output "lab_role_arn" {
  description = "ARN of the LabRole IAM role"
  value       = data.aws_iam_role.LabRole.arn
}

output "vpc_id" {
  description = "ID of the default VPC"
  value       = data.aws_vpc.default.id
}

output "subnet_ids" {
  description = "IDs of the default VPC subnets"
  value       = data.aws_subnets.default.ids
}

output "default_subnet_id" {
  description = "ID of the first default VPC subnet"
  value       = data.aws_subnet.default.id
}
