#!/bin/bash

# Staging Deployment Script for Transportation Management System

echo "Starting deployment to staging environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null
then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Pull latest code (assuming git repository)
echo "Pulling latest code from repository..."
git pull origin main

# Build and deploy services
echo "Building and deploying services..."
docker-compose -f docker-compose.staging.yml down
docker-compose -f docker-compose.staging.yml up --build -d

# Run database migrations
echo "Running database migrations..."
docker-compose -f docker-compose.staging.yml exec app alembic upgrade head

# Seed initial data if needed (optional)
# echo "Seeding initial data..."
# docker-compose -f docker-compose.staging.yml exec app python scripts/seed_data.py

echo "Staging deployment completed successfully!"
echo "Application should be accessible at http://localhost:8000"

# Show running containers
echo "Running containers:"
docker-compose -f docker-compose.staging.yml ps