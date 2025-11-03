#!/bin/bash
set -e

echo "Pushing images to registries..."
echo ""

echo "================================================"
echo "Pushing consumer images to 10.0.40.171:5000..."
echo "================================================"
docker push 10.0.40.171:5000/consumer-dapp-backend:latest
docker push 10.0.40.171:5000/consumer-dapp-frontend:latest

echo ""

echo "================================================"
echo "Pushing provider images to 10.0.40.172:5000..."
echo "================================================"
docker push 10.0.40.172:5000/provider-dapp-backend:latest
docker push 10.0.40.172:5000/provider-dapp-frontend:latest

echo ""
echo "All images pushed successfully!"
echo ""
echo "View in registry UI:"
echo "  Consumer: http://10.0.40.171:7000"
echo "  Provider: http://10.0.40.172:7000"
