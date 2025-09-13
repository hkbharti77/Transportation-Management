# Staging Deployment Guide

This guide explains how to deploy the Transportation Management System to a staging environment.

## Prerequisites

1. Docker and Docker Compose installed
2. Git (for pulling latest code)
3. Access to staging database and Redis instances

## Configuration Files

The following configuration files have been created for staging:

1. `.env.staging` - Environment variables for staging
2. `docker-compose.staging.yml` - Docker Compose configuration for staging
3. `deploy-staging.sh` - Bash deployment script
4. `deploy-staging.ps1` - PowerShell deployment script

## Deployment Steps

### Using Docker Compose (Recommended)

1. Update the staging configuration in `docker-compose.staging.yml` with your actual database and Redis credentials.

2. Run the following commands:
   ```bash
   # Stop any running services
   docker-compose -f docker-compose.staging.yml down
   
   # Build and start services
   docker-compose -f docker-compose.staging.yml up --build -d
   
   # Run database migrations
   docker-compose -f docker-compose.staging.yml exec app alembic upgrade head
   ```

### Using Deployment Scripts

#### On Linux/Mac:
```bash
chmod +x deploy-staging.sh
./deploy-staging.sh
```

#### On Windows:
```powershell
.\deploy-staging.ps1
```

## Environment Variables

The staging environment uses the following key variables:

- `DEBUG=False` - Disables debug mode for production-like behavior
- `DATABASE_URL` - Connection string for staging database
- `SECRET_KEY` - Secure secret key for JWT tokens
- `REDIS_URL` - Connection string for Redis cache

## Health Checks

After deployment, verify the application is running correctly:

1. Check container status:
   ```bash
   docker-compose -f docker-compose.staging.yml ps
   ```

2. Check application logs:
   ```bash
   docker-compose -f docker-compose.staging.yml logs app
   ```

3. Test API endpoints:
   ```bash
   curl http://localhost:8000/api/v1/health
   ```

## Updating the Application

To update the application in staging:

1. Pull the latest code: `git pull origin main`
2. Rebuild and restart services: `docker-compose -f docker-compose.staging.yml up --build -d`
3. Run any new migrations: `docker-compose -f docker-compose.staging.yml exec app alembic upgrade head`

## Troubleshooting

### Common Issues

1. **Database connection errors**: Verify database credentials in `docker-compose.staging.yml`
2. **Port conflicts**: Change port mappings in `docker-compose.staging.yml`
3. **Insufficient permissions**: Ensure Docker has necessary permissions to access project files

### Checking Logs

View logs for specific services:
```bash
# Application logs
docker-compose -f docker-compose.staging.yml logs app

# Database logs
docker-compose -f docker-compose.staging.yml logs db

# Redis logs
docker-compose -f docker-compose.staging.yml logs redis
```