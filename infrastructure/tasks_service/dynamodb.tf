# DynamoDB Tables for Tasks Service

# Tasks Table
resource "aws_dynamodb_table" "tasks" {
  name           = "${local.name_prefix}-tasks"
  billing_mode   = "PROVISIONED"
  read_capacity  = 2
  write_capacity = 2
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "projectId"
    type = "S"
  }

  attribute {
    name = "assigneeId"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  # GSI1: ProjectIndex - Query tasks by project
  global_secondary_index {
    name            = "ProjectIndex"
    hash_key        = "projectId"
    range_key       = "status"
    read_capacity   = 2
    write_capacity  = 2
    projection_type = "ALL"
  }

  # GSI2: AssigneeIndex - Query tasks by assignee (optional, for future use)
  global_secondary_index {
    name            = "AssigneeIndex"
    hash_key        = "assigneeId"
    range_key       = "status"
    read_capacity   = 2
    write_capacity  = 2
    projection_type = "ALL"
  }
}

# Task Links Table
resource "aws_dynamodb_table" "task_links" {
  name           = "${local.name_prefix}-task-links"
  billing_mode   = "PROVISIONED"
  read_capacity  = 2
  write_capacity = 2
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "fromTaskId"
    type = "S"
  }

  attribute {
    name = "toTaskId"
    type = "S"
  }

  # GSI1: FromTaskIndex - Query outgoing links
  global_secondary_index {
    name            = "FromTaskIndex"
    hash_key        = "fromTaskId"
    read_capacity   = 2
    write_capacity  = 2
    projection_type = "ALL"
  }

  # GSI2: ToTaskIndex - Query incoming links
  global_secondary_index {
    name            = "ToTaskIndex"
    hash_key        = "toTaskId"
    read_capacity   = 2
    write_capacity  = 2
    projection_type = "ALL"
  }
}

# Comments Table
resource "aws_dynamodb_table" "comments" {
  name           = "${local.name_prefix}-comments"
  billing_mode   = "PROVISIONED"
  read_capacity  = 2
  write_capacity = 2
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "taskId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  # GSI1: TaskCommentsIndex - Query comments by task, sorted by creation time
  global_secondary_index {
    name            = "TaskCommentsIndex"
    hash_key        = "taskId"
    range_key       = "createdAt"
    read_capacity   = 2
    write_capacity  = 2
    projection_type = "ALL"
  }
}
