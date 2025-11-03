#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Building and Pushing All Images..."
echo ""

./build-all.sh

echo ""

./push-to-registry.sh

echo ""
echo "All images built and pushed."
