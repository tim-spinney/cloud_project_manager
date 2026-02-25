resource "aws_cloudwatch_log_group" "tasks_service" {
  name              = "/cloud-project-manager/tasks-service"
  retention_in_days = var.observability_log_retention_days

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "projects_service" {
  name              = "/cloud-project-manager/projects-service"
  retention_in_days = var.observability_log_retention_days

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "metrics" {
  name              = "/cloud-project-manager/metrics"
  retention_in_days = var.observability_log_retention_days

  tags = local.common_tags
}

resource "aws_iam_role_policy" "lab_role_observability" {
  name = "${local.name_prefix}-observability"
  role = data.aws_iam_role.LabRole.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogStreams",
          "logs:PutLogEvents",
          "logs:PutRetentionPolicy",
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
      }
    ]
  })
}
