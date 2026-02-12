#!/bin/bash
# Deploy the packaged application using AWS CodeDeploy

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INFRASTRUCTURE_DIR="$(cd "$PROJECT_ROOT/../infrastructure" && pwd)"
PACKAGE_NAME="tasks_service.zip"

echo "Starting CodeDeploy deployment..."

# Check if infrastructure directory exists
if [ ! -d "$INFRASTRUCTURE_DIR" ]; then
    echo "Error: Infrastructure directory not found at $INFRASTRUCTURE_DIR"
    exit 1
fi

# Get Terraform outputs
cd "$INFRASTRUCTURE_DIR"
BUCKET_NAME=$(~/terraform output -raw s3_bucket_name 2>/dev/null || echo "")
CODEDEPLOY_APP_NAME=$(~/terraform output -raw codedeploy_app_name 2>/dev/null || echo "")
CODEDEPLOY_DG_NAME=$(~/terraform output -raw codedeploy_deployment_group_name 2>/dev/null || echo "")
AWS_REGION=$(~/terraform output -raw aws_region 2>/dev/null || echo "")

echo $BUCKET_NAME
echo $CODEDEPLOY_APP_NAME
echo $CODEDEPLOY_DG_NAME
echo $AWS_REGION

# Validate outputs
if [ -z "$BUCKET_NAME" ] || [ -z "$CODEDEPLOY_APP_NAME" ] || [ -z "$CODEDEPLOY_DG_NAME" ]; then
    echo "Error: Could not retrieve required values from Terraform output."
    echo "Make sure Terraform has been applied and the infrastructure directory is accessible."
    exit 1
fi

# Use default region if not set
if [ -z "$AWS_REGION" ]; then
    AWS_REGION="us-east-1"
    echo "Warning: AWS region not found in Terraform output, using default: $AWS_REGION"
fi

echo "CodeDeploy Application: $CODEDEPLOY_APP_NAME"
echo "Deployment Group: $CODEDEPLOY_DG_NAME"
echo "S3 Bucket: $BUCKET_NAME"
echo "AWS Region: $AWS_REGION"

# Check if package exists in S3
if ! aws s3 ls "s3://${BUCKET_NAME}/${PACKAGE_NAME}" --region "$AWS_REGION" > /dev/null 2>&1; then
    echo "Error: Package $PACKAGE_NAME not found in S3 bucket $BUCKET_NAME"
    echo "Please run package.sh first to create and upload the package."
    exit 1
fi

# Create deployment (CodeDeploy will automatically use the latest version)
echo "Creating CodeDeploy deployment..."

DEPLOYMENT_ID=$(aws deploy create-deployment \
    --application-name "$CODEDEPLOY_APP_NAME" \
    --deployment-group-name "$CODEDEPLOY_DG_NAME" \
    --s3-location bucket="$BUCKET_NAME",key="$PACKAGE_NAME",bundleType=zip \
    --region "$AWS_REGION" \
    --query 'deploymentId' \
    --output text)

if [ -z "$DEPLOYMENT_ID" ]; then
    echo "Error: Failed to create deployment"
    exit 1
fi

echo "Deployment created successfully!"
echo "Deployment ID: $DEPLOYMENT_ID"
echo ""
echo "You can monitor the deployment status with:"
echo "  aws deploy get-deployment --deployment-id $DEPLOYMENT_ID --region $AWS_REGION"
echo ""
echo "Or view it in the AWS Console:"
echo "  https://console.aws.amazon.com/codesuite/codedeploy/deployments/$DEPLOYMENT_ID?region=$AWS_REGION"

# Optionally wait for deployment to complete
read -p "Do you want to wait for the deployment to complete? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Waiting for deployment to complete..."
    aws deploy wait deployment-successful \
        --deployment-id "$DEPLOYMENT_ID" \
        --region "$AWS_REGION"
    
    if [ $? -eq 0 ]; then
        echo "Deployment completed successfully!"
    else
        echo "Deployment failed or was stopped."
        exit 1
    fi
fi
