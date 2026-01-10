#!/bin/bash
# Package the application for CodeDeploy deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/deploy"
PACKAGE_NAME="tasks-service-$(date +%Y%m%d-%H%M%S).zip"

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

# Create deployment package
cd "$OUTPUT_DIR"
zip -r "$PACKAGE_NAME" . -x "*.git*" "*.DS_Store"

echo "Package created: $OUTPUT_DIR/$PACKAGE_NAME"
echo "Upload this file to S3 and create a CodeDeploy deployment"
