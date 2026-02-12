#!/usr/bin/env bash
set -euo pipefail

# Script to build Docker image, push to ECR, and force ECS service update
# This script reads Terraform outputs to get ECR and ECS resource names

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
INFRA_DIR="${PROJECT_ROOT}/../infrastructure"

# Get Terraform outputs
echo "Getting Terraform outputs..."
cd "${INFRA_DIR}"

ECR_REPO_URL=$(terraform output -raw ecr_repository_url 2>/dev/null || echo "")
ECR_REPO_NAME=$(terraform output -raw ecr_repository_name 2>/dev/null || echo "")
AWS_REGION=$(terraform output -raw aws_region 2>/dev/null || echo "us-east-1")
ECS_CLUSTER_NAME=$(terraform output -raw ecs_cluster_name 2>/dev/null || echo "")
ECS_SERVICE_NAME=$(terraform output -raw ecs_service_name 2>/dev/null || echo "")

if [ -z "$ECR_REPO_URL" ] || [ -z "$ECS_CLUSTER_NAME" ] || [ -z "$ECS_SERVICE_NAME" ]; then
  echo "Error: Could not get required Terraform outputs."
  echo "Make sure Terraform has been applied and outputs are available."
  exit 1
fi

# Extract account ID and region from ECR URL
# Format: <account>.dkr.ecr.<region>.amazonaws.com/<repo>
ECR_ACCOUNT_ID=$(echo "$ECR_REPO_URL" | cut -d'.' -f1)
ECR_REGION=$(echo "$ECR_REPO_URL" | cut -d'.' -f4)

# Use provided region or extract from ECR URL
if [ -n "$ECR_REGION" ]; then
  AWS_REGION="$ECR_REGION"
fi

IMAGE_TAG="${IMAGE_TAG:-latest}"
FULL_IMAGE_URI="${ECR_REPO_URL}:${IMAGE_TAG}"

echo "Configuration:"
echo "  ECR Repository: $ECR_REPO_URL"
echo "  Image Tag: $IMAGE_TAG"
echo "  AWS Region: $AWS_REGION"
echo "  ECS Cluster: $ECS_CLUSTER_NAME"
echo "  ECS Service: $ECS_SERVICE_NAME"
echo ""

# Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | \
  docker login --username AWS --password-stdin "${ECR_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Build image
echo "Building Docker image..."
cd "${PROJECT_ROOT}"
docker build -t "${FULL_IMAGE_URI}" .

# Push image
echo "Pushing ${FULL_IMAGE_URI} to ECR..."
docker push "${FULL_IMAGE_URI}"

# Force ECS service to deploy new image
echo "Forcing ECS service update to deploy new image..."
aws ecs update-service \
  --cluster "${ECS_CLUSTER_NAME}" \
  --service "${ECS_SERVICE_NAME}" \
  --force-new-deployment \
  --region "${AWS_REGION}" \
  --query 'service.{ServiceName:serviceName,Status:status,DesiredCount:desiredCount,RunningCount:runningCount}' \
  --output table

echo ""
echo "Deployment initiated!"
echo "Monitor the deployment with:"
echo "  aws ecs describe-services --cluster ${ECS_CLUSTER_NAME} --services ${ECS_SERVICE_NAME} --region ${AWS_REGION}"
echo ""
echo "View logs with:"
echo "  aws logs tail $(terraform -chdir=${INFRA_DIR} output -raw cloudwatch_log_group_name) --follow --region ${AWS_REGION}"
