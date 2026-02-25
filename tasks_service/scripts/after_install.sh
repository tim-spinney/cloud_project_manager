#!/bin/bash
# AfterInstall hook - runs after files are installed

set -e

echo "AfterInstall: Setting ownership and permissions"
chown -R ec2-user:ec2-user /opt/tasks-service
chmod +x /opt/tasks-service/scripts/*.sh || true
mkdir -p /var/log/cloud-project-manager
chown -R ec2-user:ec2-user /var/log/cloud-project-manager

echo "AfterInstall: Installing dependencies"
cd /opt/tasks-service
sudo -u ec2-user /home/ec2-user/.bun/bin/bun install --production || /home/ec2-user/.bun/bin/bun install

echo "AfterInstall: Creating systemd service"
cp /opt/tasks-service/scripts/runtime_setup/tasks_service.service /etc/systemd/system/tasks-service.service
systemctl daemon-reload
systemctl enable tasks-service

echo "AfterInstall: Installing AWS OTel Collector if missing"
if ! command -v aws-otel-collector-ctl >/dev/null 2>&1; then
  ARCH=$(uname -m)
  if [ "$ARCH" = "aarch64" ]; then
    OTEL_ARCH="arm64"
  else
    OTEL_ARCH="amd64"
  fi
  rpm -Uvh "https://aws-otel-collector.s3.amazonaws.com/amazon_linux/${OTEL_ARCH}/latest/aws-otel-collector.rpm"
fi

echo "AfterInstall: Configuring AWS OTel Collector"
TOKEN=$(curl -sX PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
if [ -n "$TOKEN" ]; then
  AWS_REGION=$(curl -s -H "X-aws-ec2-metadata-token: ${TOKEN}" http://169.254.169.254/latest/meta-data/placement/region)
else
  AWS_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)
fi
if [ -z "$AWS_REGION" ]; then
  AWS_REGION="us-east-1"
fi
cp /opt/tasks-service/scripts/runtime_setup/aws_otel_collector_config.yaml /opt/aws/aws-otel-collector/etc/config.yaml
sed -i "s/\${AWS_REGION}/${AWS_REGION}/g" /opt/aws/aws-otel-collector/etc/config.yaml
systemctl enable aws-otel-collector
systemctl restart aws-otel-collector

echo "AfterInstall: Completed"
