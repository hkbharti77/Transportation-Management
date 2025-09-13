# Staging Deployment Script for Transportation Management System

Write-Host "Starting deployment to staging environment..."

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "Docker is installed: $dockerVersion"
} catch {
    Write-Host "Docker is not installed. Please install Docker first."
    exit 1
}

# Check if Docker Compose is installed
try {
    $dockerComposeVersion = docker-compose --version
    Write-Host "Docker Compose is installed: $dockerComposeVersion"
} catch {
    Write-Host "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
}

# Pull latest code (assuming git repository)
Write-Host "Pulling latest code from repository..."
git pull origin main

# Build and deploy services
Write-Host "Building and deploying services..."
docker-compose -f docker-compose.staging.yml down
docker-compose -f docker-compose.staging.yml up --build -d

# Run database migrations
Write-Host "Running database migrations..."
docker-compose -f docker-compose.staging.yml exec app alembic upgrade head

# Seed initial data if needed (optional)
# Write-Host "Seeding initial data..."
# docker-compose -f docker-compose.staging.yml exec app python scripts/seed_data.py

Write-Host "Staging deployment completed successfully!"
Write-Host "Application should be accessible at http://localhost:8000"

# Show running containers
Write-Host "Running containers:"
docker-compose -f docker-compose.staging.yml ps