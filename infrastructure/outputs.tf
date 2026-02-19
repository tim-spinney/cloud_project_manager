# Tasks service outputs
output "ec2_instance_id" {
  description = "ID of the EC2 instance"
  value       = module.tasks_service.ec2_instance_id
}

output "ec2_instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = module.tasks_service.ec2_instance_public_ip
}

output "ec2_instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = module.tasks_service.ec2_instance_public_dns
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for build artifacts"
  value       = module.tasks_service.s3_bucket_name
}

output "codedeploy_app_name" {
  description = "Name of the CodeDeploy application"
  value       = module.tasks_service.codedeploy_app_name
}

output "codedeploy_deployment_group_name" {
  description = "Name of the CodeDeploy deployment group"
  value       = module.tasks_service.codedeploy_deployment_group_name
}

output "service_url" {
  description = "URL to access the tasks service"
  value       = module.tasks_service.service_url
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

output "tasks_table_name" {
  description = "Name of the DynamoDB tasks table"
  value       = module.tasks_service.tasks_table_name
}

output "task_links_table_name" {
  description = "Name of the DynamoDB task links table"
  value       = module.tasks_service.task_links_table_name
}

output "comments_table_name" {
  description = "Name of the DynamoDB comments table"
  value       = module.tasks_service.comments_table_name
}

# Projects service outputs
output "ecr_repository_url" {
  description = "URL of the ECR repository for projects service"
  value       = module.projects_service.ecr_repository_url
}

output "ecr_repository_name" {
  description = "Name of the ECR repository for projects service"
  value       = module.projects_service.ecr_repository_name
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.projects_service.ecs_cluster_name
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = module.projects_service.ecs_cluster_arn
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = module.projects_service.ecs_service_name
}

output "ecs_task_definition_arn" {
  description = "ARN of the ECS task definition"
  value       = module.projects_service.ecs_task_definition_arn
}

output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group for ECS tasks"
  value       = module.projects_service.cloudwatch_log_group_name
}
