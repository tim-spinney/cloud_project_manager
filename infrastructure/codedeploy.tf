resource "aws_codedeploy_app" "tasks_service" {
  name             = "${local.name_prefix}-tasks-service"
  compute_platform = "Server"

  tags = local.common_tags
}

resource "aws_codedeploy_deployment_group" "tasks_service" {
  app_name              = aws_codedeploy_app.tasks_service.name
  deployment_group_name = "${local.name_prefix}-tasks-service-dg"
  service_role_arn      = data.aws_iam_role.vocrole.arn

  ec2_tag_filter {
    key   = "Name"
    type  = "KEY_AND_VALUE"
    value = "${local.name_prefix}-tasks-service"
  }

  deployment_config_name = "CodeDeployDefault.AllAtOnce"

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }

  tags = local.common_tags
}
