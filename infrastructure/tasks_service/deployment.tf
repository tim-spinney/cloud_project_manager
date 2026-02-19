resource "aws_s3_bucket" "build_artifacts" {
  bucket_prefix = "build-artifacts"

  tags = merge(local.common_tags, {
    Name = "build-artifacts"
  })
}

resource "aws_s3_bucket_versioning" "build_artifacts" {
  bucket = aws_s3_bucket.build_artifacts.id

  versioning_configuration {
    status = "Enabled"
  }
  
  depends_on = [aws_s3_bucket.build_artifacts]
}

resource "aws_s3_bucket_public_access_block" "build_artifacts" {
  bucket = aws_s3_bucket.build_artifacts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  depends_on = [aws_s3_bucket.build_artifacts]
}

resource "aws_codedeploy_app" "tasks_service" {
  name             = "${local.name_prefix}-tasks-service"
  compute_platform = "Server"

  tags = local.common_tags
}

resource "aws_codedeploy_deployment_group" "tasks_service" {
  app_name              = aws_codedeploy_app.tasks_service.name
  deployment_group_name = "${local.name_prefix}-tasks-service-dg"
  service_role_arn      = var.lab_role_arn

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
