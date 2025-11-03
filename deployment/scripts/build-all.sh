#!/bin/bash
set -e

cd "$(dirname "$0")/../.."

echo "================================================"
echo "Building Consumer Images..."
echo "================================================"

echo "Building consumer backend..."
docker build -t 10.0.40.171:5000/consumer-dapp-backend:latest ./backend

echo "Building consumer frontend..."
cd frontend
rm -f .env
cp ../deployment/consumer/frontend/.env .env
docker build -t 10.0.40.171:5000/consumer-dapp-frontend:latest .
rm -f .env
cd ..

echo "Consumer images built!"
echo ""

echo "================================================"
echo "Building Provider Images..."
echo "================================================"

echo "Building provider backend..."
docker build -t 10.0.40.172:5000/provider-dapp-backend:latest ./backend

echo "Building provider frontend..."
cd frontend
rm -f .env
cp ../deployment/provider/frontend/.env .env
docker build -t 10.0.40.172:5000/provider-dapp-frontend:latest .
rm -f .env
cd ..

echo "Provider images built!"
