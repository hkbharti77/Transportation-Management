# 🚀 Quick Start Guide

## ⚡ Get Running in 5 Minutes

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Setup Database (Choose One)

#### Option A: Docker (Recommended)
```bash
docker-compose up -d db
```

#### Option B: Local PostgreSQL
```bash
# Create database
createdb transportation_db
```

### 3. Run the Application
```bash
python start.py
```

### 4. Test the API
- Open: http://localhost:8000/docs
- Try the `/health` endpoint
- Register a user at `/api/v1/auth/register`

## 🔑 Default Test Accounts

After running the seed script:
- **Admin**: admin@transport.com / admin123
- **Driver**: driver@transport.com / driver123
- **User**: user@transport.com / user123

## 📱 Test API Endpoints

### Create User
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "public_user"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"
```

## 🐛 Troubleshooting

### Import Errors
```bash
python test_basic.py
```

### Database Connection
Check your `.env` file and database credentials.

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

## 📚 Next Steps

1. **Explore the API docs** at `/docs`
2. **Create your first order** using the orders endpoint
3. **Book a trip** using the trips endpoint
4. **Check the logs** to see audit trails
5. **Customize** the models and schemas for your needs

## 🆘 Need Help?

- Check the full README.md
- Run `python test_basic.py` for diagnostics
- Check the console output for error messages
