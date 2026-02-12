#!/bin/bash
# Package the application for CodeDeploy deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INFRASTRUCTURE_DIR="$(cd "$PROJECT_ROOT/../infrastructure" && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/deploy"
PACKAGE_NAME="tasks_service.zip"

echo "Packaging application for deployment..."

echo $INFRASTRUCTURE_DIR

# Get S3 bucket name from Terraform output
if [ ! -d "$INFRASTRUCTURE_DIR" ]; then
    echo "Error: Infrastructure directory not found at $INFRASTRUCTURE_DIR"
    exit 1
fi

cd "$INFRASTRUCTURE_DIR"
BUCKET_NAME=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
if [ -z "$BUCKET_NAME" ]; then
    echo "Error: Could not retrieve S3 bucket name from Terraform output."
    echo "Make sure Terraform has been applied and the infrastructure directory is accessible."
    exit 1
fi

echo "Using S3 bucket: $BUCKET_NAME"

# Create output directory
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Copy application files
cd "$PROJECT_ROOT"
cp -r src "$OUTPUT_DIR/"
cp -r scripts "$OUTPUT_DIR/"
cp package.json "$OUTPUT_DIR/"
cp appspec.yml "$OUTPUT_DIR/"
cp -r scripts/runtime_setup "$OUTPUT_DIR/"

# Create deployment package
cd "$OUTPUT_DIR"
# use tar if zip not available
if command -v zip &> /dev/null; then
    zip -r "$PACKAGE_NAME" . -x "*.git*" "*.DS_Store"
else
    tar -acf "$PACKAGE_NAME" .
fi

echo "Package created: $OUTPUT_DIR/$PACKAGE_NAME"

aws s3 cp "$OUTPUT_DIR/$PACKAGE_NAME" "s3://${BUCKET_NAME}/$PACKAGE_NAME"
echo "Uploaded package to S3: s3://${BUCKET_NAME}/$PACKAGE_NAME"