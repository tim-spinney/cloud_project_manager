output "ecr_repository_url" {
  description = "URL of the ECR repository for projects service"
  value       = aws_ecr_repository.projects_service.repository_url
}

output "ecr_repository_name" {
  description = "Name of the ECR repository for projects service"
  value       = aws_ecr_repository.projects_service.name
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.projects.name
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = aws_ecs_cluster.projects.arn
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.projects_service.name
}

output "ecs_task_definition_arn" {
  description = "ARN of the ECS task definition"
  value       = aws_ecs_task_definition.projects_service.arn
}

output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group for ECS tasks"
  value       = aws_cloudwatch_log_group.projects_service.name
}

output "docdb_cluster_endpoint" {
  description = "Endpoint of the DocumentDB cluster"
  value       = aws_docdb_cluster.projects.endpoint
}

output "docdb_cluster_port" {
  description = "Port of the DocumentDB cluster"
  value       = aws_docdb_cluster.projects.port
}
