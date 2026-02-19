# ECR repository for projects service
resource "aws_ecr_repository" "projects_service" {
  name                 = "projects-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-projects-service-ecr"
  })
}

# Lifecycle policy to keep only the last 10 images
resource "aws_ecr_lifecycle_policy" "projects_service" {
  repository = aws_ecr_repository.projects_service.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
