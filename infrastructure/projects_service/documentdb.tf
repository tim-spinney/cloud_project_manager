resource "aws_docdb_subnet_group" "projects" {
  name       = "${local.name_prefix}-projects-docdb"
  subnet_ids = var.subnet_ids

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-projects-docdb-subnet-group"
  })
}

resource "aws_security_group" "projects_docdb" {
  name        = "${local.name_prefix}-projects-docdb"
  description = "Security group for projects service DocumentDB cluster"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Allow MongoDB traffic from ECS tasks"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.projects_service_ecs.id]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-projects-docdb-sg"
  })
}

resource "aws_docdb_cluster" "projects" {
  cluster_identifier     = "${local.name_prefix}-projects-docdb"
  engine                 = "docdb"
  master_username        = var.docdb_master_username
  master_password        = var.docdb_master_password
  db_subnet_group_name   = aws_docdb_subnet_group.projects.name
  vpc_security_group_ids = [aws_security_group.projects_docdb.id]

  skip_final_snapshot = true

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-projects-docdb-cluster"
  })
}

resource "aws_docdb_cluster_instance" "projects" {
  identifier         = "${local.name_prefix}-projects-docdb-0"
  cluster_identifier = aws_docdb_cluster.projects.id
  instance_class     = "db.t3.medium"

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-projects-docdb-instance-0"
  })
}
