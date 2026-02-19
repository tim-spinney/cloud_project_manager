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

output "tasks_table_name" {
  description = "Name of the DynamoDB tasks table"
  value       = aws_dynamodb_table.tasks.name
}

output "task_links_table_name" {
  description = "Name of the DynamoDB task links table"
  value       = aws_dynamodb_table.task_links.name
}

output "comments_table_name" {
  description = "Name of the DynamoDB comments table"
  value       = aws_dynamodb_table.comments.name
}
