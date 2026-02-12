resource "aws_instance" "tasks_service" {
  ami           = "ami-02b86da1e539b4dd0"
  instance_type = var.instance_type

  iam_instance_profile   = data.aws_iam_instance_profile.LabInstanceProfile.name
  vpc_security_group_ids = [aws_security_group.tasks_service.id]
  subnet_id              = data.aws_subnet.default.id
  key_name               = var.ec2_key_pair

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-tasks-service"
  })

  lifecycle {
    create_before_destroy = true
  }

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    region = var.aws_region
  })
}
