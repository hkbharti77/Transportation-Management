# Cloud Deployment Guide

This guide explains how to deploy the Transportation Management System to popular cloud platforms.

## Supported Platforms

1. [Render](#render-deployment)
2. [Railway](#railway-deployment)
3. [Heroku](#heroku-deployment)
4. [AWS](#aws-deployment)
5. [Google Cloud Platform](#google-cloud-platform-deployment)
6. [Microsoft Azure](#microsoft-azure-deployment)

## Render Deployment

### Prerequisites
- A Render account
- A PostgreSQL database (Render PostgreSQL or external)

### Steps
1. Fork this repository to your GitHub account
2. Log in to Render
3. Click "New +" and select "Web Service"
4. Connect your GitHub account and select your forked repository
5. Configure the service:
   - Name: `transportation-management`
   - Environment: `Python 3`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Auto-deploy: `Yes`
6. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SECRET_KEY`: A secure secret key
   - `DEBUG`: `False`
7. Click "Create Web Service"

### Database Setup
Render can automatically create a PostgreSQL database for you:
1. In the Render dashboard, click "New +" and select "Database"
2. Choose "PostgreSQL"
3. Configure the database:
   - Name: `transportation-db`
   - Database: `transportation_db`
   - User: (auto-generated)
4. After creation, copy the `DATABASE_URL` to your web service environment variables

## Railway Deployment

### Prerequisites
- A Railway account
- A PostgreSQL database

### Steps
1. Fork this repository to your GitHub account
2. Log in to Railway
3. Click "New Project" and select "Deploy from GitHub repo"
4. Select your forked repository
5. Railway will automatically detect it's a Python project
6. Add environment variables in the "Variables" section:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SECRET_KEY`: A secure secret key
   - `DEBUG`: `False`
7. Click "Deploy"

### Database Setup
Railway can automatically provision a PostgreSQL database:
1. In your project, click "New" and select "Database"
2. Choose "PostgreSQL"
3. Railway will automatically set the `DATABASE_URL` environment variable

## Heroku Deployment

### Prerequisites
- A Heroku account
- Heroku CLI installed (optional)

### Steps (Using Heroku CLI)
1. Fork this repository to your GitHub account
2. Log in to Heroku CLI:
   ```bash
   heroku login
   ```
3. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```
4. Set the stack to container (to use Docker):
   ```bash
   heroku stack:set container
   ```
5. Add PostgreSQL addon:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```
6. Set environment variables:
   ```bash
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set DEBUG=False
   ```
7. Deploy the app:
   ```bash
   git push heroku main
   ```

### Steps (Using Heroku Dashboard)
1. Fork this repository to your GitHub account
2. Log in to Heroku Dashboard
3. Click "New" and select "Create new app"
4. Choose an app name and region
5. In the "Deploy" tab, connect to GitHub and select your repository
6. Enable automatic deploys
7. In the "Resources" tab, add the "Heroku Postgres" addon
8. In the "Settings" tab, add environment variables:
   - `SECRET_KEY`: A secure secret key
   - `DEBUG`: `False`
9. Deploy the app using "Deploy Branch"

## AWS Deployment

### Prerequisites
- An AWS account
- AWS CLI installed and configured
- Elastic Beanstalk CLI installed

### Steps
1. Install the Elastic Beanstalk CLI:
   ```bash
   pip install awsebcli
   ```
2. Initialize the EB application:
   ```bash
   eb init
   ```
3. Create an EB environment:
   ```bash
   eb create transportation-env
   ```
4. Set environment variables:
   ```bash
   eb setenv SECRET_KEY=your-secret-key DEBUG=False
   ```
5. Deploy the application:
   ```bash
   eb deploy
   ```

### Database Setup
1. In the AWS RDS console, create a PostgreSQL database
2. Configure the database security group to allow connections from your EB environment
3. Set the `DATABASE_URL` environment variable in your EB environment

## Google Cloud Platform Deployment

### Prerequisites
- A Google Cloud Platform account
- Google Cloud SDK installed and configured
- A PostgreSQL database (Cloud SQL or external)

### Steps
1. Install the Google Cloud SDK
2. Authenticate with Google Cloud:
   ```bash
   gcloud auth login
   ```
3. Set your project:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```
4. Deploy using Cloud Run:
   ```bash
   gcloud run deploy transportation-system \
     --source . \
     --platform managed \
     --allow-unauthenticated \
     --set-env-vars SECRET_KEY=your-secret-key,DEBUG=False
   ```

### Database Setup
1. Create a Cloud SQL PostgreSQL instance
2. Configure the database connection
3. Set the `DATABASE_URL` environment variable

## Microsoft Azure Deployment

### Prerequisites
- An Azure account
- Azure CLI installed and configured

### Steps
1. Install the Azure CLI
2. Authenticate with Azure:
   ```bash
   az login
   ```
3. Create a resource group:
   ```bash
   az group create --name transportation-rg --location eastus
   ```
4. Deploy using Azure Container Instances:
   ```bash
   az container create \
     --resource-group transportation-rg \
     --name transportation-system \
     --image your-docker-hub-username/transportation-system \
     --dns-name-label transportation-system \
     --ports 8000 \
     --environment-variables SECRET_KEY=your-secret-key DEBUG=False
   ```

### Database Setup
1. Create an Azure Database for PostgreSQL instance
2. Configure the database firewall rules
3. Set the `DATABASE_URL` environment variable

## Environment Variables

All deployments require these essential environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `SECRET_KEY` | Secret key for JWT signing | `your-32-character-secret-key` |
| `DEBUG` | Debug mode (should be False in production) | `False` |

Optional environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection string (for caching) | `redis://localhost:6379` |
| `API_V1_STR` | API version prefix | `/api/v1` |

## Post-Deployment Steps

After deploying to any platform:

1. Run database migrations:
   ```bash
   alembic upgrade head
   ```

2. Seed initial data (optional):
   ```bash
   python scripts/seed_data.py
   ```

3. Verify the deployment by accessing:
   - API root: `https://your-app-url/`
   - Health check: `https://your-app-url/health`
   - API docs: `https://your-app-url/docs`

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify `DATABASE_URL` is correctly set
   - Ensure the database is accessible from your deployment platform
   - Check firewall/security group settings

2. **Application Crashes**:
   - Check logs for error messages
   - Verify all required environment variables are set
   - Ensure the `SECRET_KEY` is properly configured

3. **Performance Issues**:
   - Consider adding Redis for caching
   - Optimize database queries
   - Scale the application horizontally

### Checking Logs

Most cloud platforms provide log viewing capabilities:

- **Render**: Dashboard → Service → Logs
- **Railway**: Dashboard → Project → Logs
- **Heroku**: `heroku logs --tail`
- **AWS**: CloudWatch Logs
- **GCP**: Cloud Logging
- **Azure**: Log Analytics

## Scaling Recommendations

1. **Vertical Scaling**: Increase instance size for more CPU/memory
2. **Horizontal Scaling**: Run multiple instances behind a load balancer
3. **Database Scaling**: Use read replicas for PostgreSQL
4. **Caching**: Implement Redis for frequently accessed data
5. **CDN**: Use a CDN for static assets

## Security Considerations

1. Always use environment variables for secrets
2. Never commit secrets to version control
3. Use HTTPS in production
4. Regularly update dependencies
5. Implement proper authentication and authorization
6. Set up monitoring and alerting for security events