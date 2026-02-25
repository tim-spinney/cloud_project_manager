variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., test, prod)"
  type        = string
  default     = "test"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "cloud-project-manager"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t4g.micro"
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the EC2 instance"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Restrict this in production
}

variable "key_pair_name" {
  description = "Name of the AWS key pair for EC2 instance access"
  type        = string
  default     = ""
}

variable "iam_instance_profile_name" {
  description = "Name of the IAM instance profile to use for EC2 instances"
  type        = string
  default     = "LabInstanceProfile"
}

variable "ec2_key_pair" {
  description = "Name of the key pair to use for SSH access to EC2 instances"
  type        = string
  default     = "vockey"
}

variable "observability_log_retention_days" {
  description = "CloudWatch log retention for service logs and EMF metric log group"
  type        = number
  default     = 14
}