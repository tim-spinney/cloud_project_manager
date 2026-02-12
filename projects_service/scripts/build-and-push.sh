#!/usr/bin/env bash
set -euo pipefail

# ECR registry and repository (edit ECR_REPO_NAME if you use a different repo, e.g. "projects")
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="656100960624"
ECR_REPO_NAME="${ECR_REPO_NAME:-tasks}"
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "Logging in to ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | \
  docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "Building image..."
docker build -t "${ECR_URI}:${IMAGE_TAG}" "${PROJECT_ROOT}"

echo "Pushing ${ECR_URI}:${IMAGE_TAG}..."
docker push "${ECR_URI}:${IMAGE_TAG}"

echo "Done. Image: ${ECR_URI}:${IMAGE_TAG}"
