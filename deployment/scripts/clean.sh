#!/bin/bash
set -e

echo "Removing dangling images..."
docker image prune -f
