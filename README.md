# 🚀 Transportation Management System (TMS)

A comprehensive backend system built with **FastAPI** and **PostgreSQL** for managing transportation services including truck loading, public transport scheduling, and fleet management.

## ✨ Features

- **🔐 Authentication & Authorization**: JWT-based auth with role-based access control
- **👥 User Management**: Admin, Driver, Dispatcher, and Public User roles
- **🚛 Vehicle Management**: Support for trucks, buses, vans, and cars
- **🚗 Driver Management**: Driver profiles with license and shift management
- **📦 Transport Orders**: Complete order lifecycle from creation to delivery
- **🚌 Public Transport**: Route management and trip scheduling
- **💳 Payment Processing**: Multiple payment methods and status tracking
- **📊 Audit Logging**: Comprehensive activity logging for compliance
- **🔍 API Documentation**: Auto-generated Swagger/OpenAPI docs

## 🏗️ Architecture

```
app/
├── core/           # Configuration, database, security
├── models/         # SQLAlchemy database models
├── schemas/        # Pydantic request/response schemas
├── routers/        # API route handlers
├── services/       # Business logic (future)
└── main.py         # FastAPI application entry point
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL 12+
- Redis (optional, for caching)

### 1. Clone and Setup

```bash
git clone <your-repo>
cd transportation-system
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the environment template and configure your database:

```bash
cp env.example .env
# Edit .env with your database credentials
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb transportation_db

# Run migrations (if using Alembic)
alembic upgrade head

# Or create tables directly
python -c "from app.main import app; print('Tables created')"
```

### 4. Seed Data (Optional)

```bash
python scripts/seed_data.py
```

### 5. Run the Application

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Visit `http://localhost:8000/docs` for interactive API documentation!

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user info

### Transport Orders
- `POST /api/v1/orders/` - Create transport order
- `GET /api/v1/orders/` - List orders (with pagination)
- `GET /api/v1/orders/{id}` - Get specific order
- `PUT /api/v1/orders/{id}/assign` - Assign vehicle/driver (Admin)
- `PUT /api/v1/orders/{id}/status` - Update order status

### Public Transport
- `POST /api/v1/trips/` - Create trip (Admin)
- `GET /api/v1/trips/` - List trips
- `POST /api/v1/trips/{id}/book` - Book seat on trip
- `PUT /api/v1/trips/{id}/status` - Update trip status

## 🗄️ Database Schema

### Core Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `users` | User accounts and roles | id, email, role, password_hash |
| `vehicles` | Fleet vehicles | id, type, capacity, license_plate |
| `drivers` | Driver profiles | id, user_id, license_number |
| `orders` | Transport orders | id, customer_id, vehicle_id, status |
| `routes` | Public transport routes | id, route_number, stops, base_fare |
| `trips` | Scheduled trips | id, route_id, vehicle_id, departure_time |
| `payments` | Payment records | id, user_id, amount, method, status |
| `logs` | Audit trail | id, user_id, action, timestamp |

### Key Relationships

- **Users** → **Drivers** (one-to-one)
- **Drivers** → **Vehicles** (one-to-one)
- **Orders** → **Users** (many-to-one, customer)
- **Orders** → **Vehicles** (many-to-one)
- **Orders** → **Drivers** (many-to-one)
- **Trips** → **Routes** (many-to-one)
- **Trips** → **Vehicles** (many-to-one)

## 🔐 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, vehicle assignment |
| **Driver** | View assigned orders/trips, update status, view own profile |
| **Dispatcher** | Create orders, assign vehicles, monitor operations |
| **Public User** | Create orders, book trips, view own data |

## 🛠️ Development

### Running Tests

```bash
pytest
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Code Quality

```bash
# Format code
black app/

# Lint code
flake8 app/

# Type checking
mypy app/
```

## 🚀 Deployment

### Docker (Recommended)

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-secret-key

# Optional
DEBUG=False
REDIS_URL=redis://localhost:6379
```

## 📊 Monitoring & Logging

- **Request Logging**: All API requests are logged with timing
- **Audit Trail**: User actions are tracked in the logs table
- **Health Check**: `/health` endpoint for monitoring
- **Performance**: Request processing time headers

## 🔮 Future Enhancements

- [ ] Real-time notifications (WebSocket)
- [ ] GPS tracking integration
- [ ] Mobile app API endpoints
- [ ] Advanced analytics dashboard
- [ ] Payment gateway integration
- [ ] Email/SMS notifications
- [ ] Multi-tenant support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: `/docs` endpoint when running
- **Issues**: Create GitHub issues for bugs/features
- **Email**: support@transport.com

---

**Built with ❤️ using FastAPI, SQLAlchemy, and PostgreSQL**
