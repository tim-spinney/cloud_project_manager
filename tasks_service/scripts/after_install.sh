#!/bin/bash
# AfterInstall hook - runs after files are installed

set -e

echo "AfterInstall: Setting ownership and permissions"
chown -R ec2-user:ec2-user /opt/tasks-service
chmod +x /opt/tasks-service/scripts/*.sh || true

echo "AfterInstall: Installing dependencies"
cd /opt/tasks-service
sudo -u ec2-user /home/ec2-user/.bun/bin/bun install --production || /home/ec2-user/.bun/bin/bun install

echo "AfterInstall: Completed"
