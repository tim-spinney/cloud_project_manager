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

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the EC2 instance"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Restrict this in production
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

variable "lab_role_arn" {
  description = "ARN of the LabRole IAM role"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC to deploy into"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the ECS service"
  type        = list(string)
}