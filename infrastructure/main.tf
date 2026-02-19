terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "shared" {
  source = "./shared"
}

module "projects_service" {
  source = "./projects_service"

  aws_region                = var.aws_region
  environment               = var.environment
  project_name              = var.project_name
  allowed_cidr_blocks       = var.allowed_cidr_blocks
  iam_instance_profile_name = var.iam_instance_profile_name
  ec2_key_pair              = var.ec2_key_pair
  lab_role_arn              = module.shared.lab_role_arn
  vpc_id                    = module.shared.vpc_id
  subnet_ids                = module.shared.subnet_ids
}

module "tasks_service" {
  source = "./tasks_service"

  aws_region                = var.aws_region
  environment               = var.environment
  project_name              = var.project_name
  allowed_cidr_blocks       = var.allowed_cidr_blocks
  iam_instance_profile_name = var.iam_instance_profile_name
  ec2_key_pair              = var.ec2_key_pair
  lab_role_arn              = module.shared.lab_role_arn
  vpc_id                    = module.shared.vpc_id
  default_subnet_id         = module.shared.default_subnet_id
}
