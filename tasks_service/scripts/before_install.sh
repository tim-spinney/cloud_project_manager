#!/bin/bash
# BeforeInstall hook - runs before installation begins

set -e

echo "BeforeInstall: Stopping existing service if running"
systemctl stop tasks-service || true

echo "BeforeInstall: Removing old application files"
rm -rf /opt/tasks-service/* || true

echo "BeforeInstall: Creating application directory"
mkdir -p /opt/tasks-service
chown ec2-user:ec2-user /opt/tasks-service

echo "BeforeInstall: Completed"
