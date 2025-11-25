#!/bin/bash
set -e

echo "Removing unused Docker resources..."
docker system prune -f
