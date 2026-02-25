output "ec2_instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.tasks_service.id
}

output "ec2_instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.tasks_service.public_ip
}

output "ec2_instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.tasks_service.public_dns
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for build artifacts"
  value       = aws_s3_bucket.build_artifacts.id
}

output "codedeploy_app_name" {
  description = "Name of the CodeDeploy application"
  value       = aws_codedeploy_app.tasks_service.name
}

output "codedeploy_deployment_group_name" {
  description = "Name of the CodeDeploy deployment group"
  value       = aws_codedeploy_deployment_group.tasks_service.deployment_group_name
}

output "service_url" {
  description = "URL to access the tasks service"
  value       = "http://${aws_instance.tasks_service.public_dns}:3000"
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

output "tasks_service_log_group" {
  description = "CloudWatch log group for tasks service application logs"
  value       = aws_cloudwatch_log_group.tasks_service.name
}

output "projects_service_log_group" {
  description = "CloudWatch log group for projects service application logs"
  value       = aws_cloudwatch_log_group.projects_service.name
}

output "metrics_log_group" {
  description = "CloudWatch log group where EMF metrics are published"
  value       = aws_cloudwatch_log_group.metrics.name
}
