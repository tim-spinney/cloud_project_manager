# CloudWatch log group for ECS tasks
resource "aws_cloudwatch_log_group" "projects_service" {
  name              = "/ecs/${local.name_prefix}-projects-service"
  retention_in_days = 7

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-projects-service-logs"
  })
}

# ECS cluster
resource "aws_ecs_cluster" "projects" {
  name = "${local.name_prefix}-projects-cluster"

  configuration {
    execute_command_configuration {
      logging = "OVERRIDE"
      log_configuration {
        cloud_watch_log_group_name = aws_cloudwatch_log_group.projects_service.name
      }
    }
  }

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-projects-cluster"
  })
}

# ECS task definition
resource "aws_ecs_task_definition" "projects_service" {
  family                   = "${local.name_prefix}-projects-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"     # 1 vCPU
  memory                   = "512"     # 2 GB (minimum for 1 vCPU in Fargate)
  execution_role_arn       = data.aws_iam_role.LabRole.arn
  task_role_arn            = data.aws_iam_role.LabRole.arn

  container_definitions = jsonencode([
    {
      name      = "projects-service"
      image     = "${aws_ecr_repository.projects_service.repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.projects_service.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      environment = [
        {
          name  = "PORT"
          value = "8000"
        }
      ]

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-projects-service-task"
  })
}

# Security group for ECS tasks
resource "aws_security_group" "projects_service_ecs" {
  name        = "${local.name_prefix}-projects-service-ecs"
  description = "Security group for projects service ECS tasks"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "Allow HTTP traffic on port 8000"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-projects-service-ecs-sg"
  })
}

# ECS service
resource "aws_ecs_service" "projects_service" {
  name            = "${local.name_prefix}-projects-service"
  cluster         = aws_ecs_cluster.projects.id
  task_definition = aws_ecs_task_definition.projects_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.projects_service_ecs.id]
    assign_public_ip = true
  }

  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  # Ignore changes to desired_count to allow manual scaling
  lifecycle {
    ignore_changes = [desired_count]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-projects-service"
  })
}
