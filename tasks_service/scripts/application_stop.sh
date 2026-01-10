#!/bin/bash
# ApplicationStop hook - stops the application

set -e

echo "ApplicationStop: Stopping tasks-service"
systemctl stop tasks-service || true

echo "ApplicationStop: Waiting for service to stop"
sleep 5

echo "ApplicationStop: Completed"
