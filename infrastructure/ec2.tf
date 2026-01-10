resource "aws_instance" "tasks_service" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type

  iam_instance_profile = data.aws_iam_instance_profile.vocrole.name
  security_groups     = [aws_security_group.tasks_service.id]

  user_data = <<-EOF
    #!/bin/bash
    # Install CodeDeploy agent
    yum update -y
    yum install -y ruby wget

    cd /home/ec2-user
    wget https://aws-codedeploy-${var.aws_region}.s3.${var.aws_region}.amazonaws.com/latest/install
    chmod +x ./install
    ./install auto

    # Install Bun for ec2-user
    sudo -u ec2-user bash -c "curl -fsSL https://bun.sh/install | bash"
    echo 'export PATH="$HOME/.bun/bin:$PATH"' >> /home/ec2-user/.bashrc

    # Create application directory
    mkdir -p /opt/tasks-service
    chown ec2-user:ec2-user /opt/tasks-service

    # Create systemd service file
    cat > /etc/systemd/system/tasks-service.service <<'SERVICE'
[Unit]
Description=Tasks Service
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/tasks-service
Environment="PORT=3000"
ExecStart=/home/ec2-user/.bun/bin/bun src/index.ts
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

    systemctl daemon-reload
  EOF

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-tasks-service"
  })

  lifecycle {
    create_before_destroy = true
  }
}
