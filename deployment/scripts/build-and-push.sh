#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Building and Pushing All Images..."
echo ""

./build-all.sh
if [ $? -ne 0 ]; then
    echo "Build failed" >&2
    exit 1
fi

echo ""

./push-to-registry.sh
if [ $? -ne 0 ]; then
    echo "Push to registry failed" >&2
    exit 1
fi

echo ""
echo "All images built and pushed."
