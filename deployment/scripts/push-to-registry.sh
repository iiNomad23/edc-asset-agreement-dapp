#!/bin/bash
set -e

echo "Pushing images to registries..."
echo ""

echo "================================================"
echo "Pushing consumer images to 10.0.40.171:5000..."
echo "================================================"
echo ""

docker push 10.0.40.171:5000/consumer-dapp-backend:latest
if [ $? -ne 0 ]; then
    echo "Consumer backend push failed" >&2
    exit 1
fi
echo "Consumer backend pushed"

docker push 10.0.40.171:5000/consumer-dapp-frontend:latest
if [ $? -ne 0 ]; then
    echo "Consumer frontend push failed" >&2
    exit 1
fi
echo "Consumer frontend pushed"
echo ""

echo "================================================"
echo "Pushing provider images to 10.0.40.172:5000..."
echo "================================================"
echo ""

docker push 10.0.40.172:5000/provider-dapp-backend:latest
if [ $? -ne 0 ]; then
    echo "Provider backend push failed" >&2
    exit 1
fi
echo "Provider backend pushed"

docker push 10.0.40.172:5000/provider-dapp-frontend:latest
if [ $? -ne 0 ]; then
    echo "Provider frontend push failed" >&2
    exit 1
fi
echo "Provider frontend pushed"
echo ""

echo "View in registry UI:"
echo "  Consumer: http://10.0.40.171:7000"
echo "  Provider: http://10.0.40.172:7000"
