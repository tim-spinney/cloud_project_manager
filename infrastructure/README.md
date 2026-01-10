# Infrastructure Terraform Configuration

This directory contains Terraform configuration for provisioning AWS infrastructure for the tasks service in the test environment.

## Resources Created

- **EC2 Instance**: t4g.micro instance running Amazon Linux 2023 with ARM64 architecture
- **S3 Bucket**: Stores build artifacts for CodeDeploy deployments
- **CodeDeploy Application**: Manages deployments to the EC2 instance
- **IAM Roles**: Roles for EC2 instance and CodeDeploy service
- **Security Group**: Allows HTTP (port 3000) and SSH (port 22) access

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform >= 1.0 installed
3. AWS account with permissions to create EC2, S3, CodeDeploy, and IAM resources

## Usage

### Initialize Terraform

```bash
cd infrastructure
terraform init
```

### Plan Changes

```bash
terraform plan
```

### Apply Configuration

```bash
terraform apply
```

### Destroy Infrastructure

```bash
terraform destroy
```

## Variables

You can override default variables by creating a `terraform.tfvars` file:

```hcl
aws_region = "us-west-2"
environment = "test"
project_name = "cloud-project-manager"
instance_type = "t4g.micro"
allowed_cidr_blocks = ["10.0.0.0/8"]
key_pair_name = "my-key-pair"
```

## Outputs

After applying, Terraform will output:
- EC2 instance ID and public IP/DNS
- S3 bucket name for build artifacts
- CodeDeploy application and deployment group names
- Service URL

## Deployment Process

### 1. Package the Application

From the `tasks_service` directory, run:
```bash
./scripts/package.sh
```

This creates a zip file in the `deploy/` directory.

### 2. Upload to S3

Upload the package to the S3 bucket:
```bash
# Get the bucket name from Terraform outputs
BUCKET_NAME=$(terraform -chdir=../infrastructure output -raw s3_bucket_name)

# Upload the latest package
aws s3 cp deploy/tasks-service-*.zip s3://$BUCKET_NAME/
```

### 3. Create CodeDeploy Deployment

Create a deployment using AWS CLI:
```bash
# Get values from Terraform outputs
APP_NAME=$(terraform -chdir=../infrastructure output -raw codedeploy_app_name)
DG_NAME=$(terraform -chdir=../infrastructure output -raw codedeploy_deployment_group_name)
BUCKET_NAME=$(terraform -chdir=../infrastructure output -raw s3_bucket_name)

# Get the latest uploaded file
LATEST_PACKAGE=$(aws s3 ls s3://$BUCKET_NAME/ --recursive | sort | tail -n 1 | awk '{print $4}')

# Create deployment
aws deploy create-deployment \
  --application-name $APP_NAME \
  --deployment-group-name $DG_NAME \
  --s3-location bucket=$BUCKET_NAME,key=$LATEST_PACKAGE,bundleType=zip
```

### 4. Monitor Deployment

Check deployment status:
```bash
DEPLOYMENT_ID=$(aws deploy list-deployments \
  --application-name $APP_NAME \
  --deployment-group-name $DG_NAME \
  --max-items 1 \
  --query 'deployments[0]' \
  --output text)

aws deploy get-deployment --deployment-id $DEPLOYMENT_ID
```
