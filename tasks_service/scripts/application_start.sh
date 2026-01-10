#!/bin/bash
# ApplicationStart hook - starts the application

set -e

echo "ApplicationStart: Starting tasks-service"
systemctl start tasks-service

echo "ApplicationStart: Waiting for service to start"
sleep 5

echo "ApplicationStart: Checking service status"
systemctl status tasks-service --no-pager || true

echo "ApplicationStart: Completed"
