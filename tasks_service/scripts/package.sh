#!/bin/bash
# Package the application for CodeDeploy deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/deploy"
PACKAGE_NAME="tasks_service.zip"

echo "Packaging application for deployment..."

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

aws s3 cp "$OUTPUT_DIR/$PACKAGE_NAME" s3://${BUCKET_NAME}/$PACKAGE_NAME
echo "Uploaded package to S3: s3://$BUCKET_NAME/$PACKAGE_NAME"