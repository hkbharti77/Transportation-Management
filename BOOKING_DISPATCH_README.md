# Booking and Dispatch System

A comprehensive FastAPI-based booking and dispatch management system for transportation services. This system handles both cargo and public transportation bookings with automatic truck and driver assignment.

## 🚚 Features

### Booking Management
- **Customer Booking**: Customers can book trucks for cargo transport or public transportation services
- **Auto-Assignment**: System automatically assigns available trucks and drivers based on service type
- **Status Tracking**: Real-time booking status updates (pending, confirmed, in_progress, completed, cancelled)
- **Price Management**: Flexible pricing for different service types

### Dispatch Management
- **Automatic Dispatch Creation**: Dispatch records are automatically created for each booking
- **Driver Assignment**: Manual or automatic driver assignment to dispatches
- **Status Tracking**: Complete dispatch lifecycle tracking (pending, dispatched, in_transit, arrived, completed)
- **Time Tracking**: Dispatch and arrival time recording

### Service Types
- **Cargo Service**: For freight and goods transportation
- **Public Service**: For passenger transportation

## 📊 Database Schema

### Booking Table
```sql
CREATE TABLE bookings (
    booking_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    truck_id INTEGER,
    service_type ENUM('cargo', 'public') NOT NULL,
    booking_status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    price FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Dispatch Table
```sql
CREATE TABLE dispatches (
    dispatch_id INTEGER PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    assigned_driver INTEGER,
    dispatch_time TIMESTAMP,
    arrival_time TIMESTAMP,
    status ENUM('pending', 'dispatched', 'in_transit', 'arrived', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🛠️ API Endpoints

### Booking Endpoints

#### Create Booking
```http
POST /api/v1/bookings/
```
**Request Body:**
```json
{
    "user_id": 1,
    "source": "Warehouse A, Industrial District",
    "destination": "Distribution Center B, Downtown",
    "service_type": "cargo",
    "price": 150.00
}
```

#### Get Booking
```http
GET /api/v1/bookings/{booking_id}
```

#### Get User Bookings
```http
GET /api/v1/bookings/user/{user_id}?skip=0&limit=100
```

#### Get All Bookings
```http
GET /api/v1/bookings/?skip=0&limit=100&status=confirmed
```

#### Update Booking Status
```http
PUT /api/v1/bookings/{booking_id}/status
```
**Request Body:**
```json
{
    "booking_status": "in_progress"
}
```

#### Update Booking
```http
PUT /api/v1/bookings/{booking_id}
```
**Request Body:**
```json
{
    "source": "New Pickup Location",
    "price": 175.00
}
```

#### Cancel Booking
```http
DELETE /api/v1/bookings/{booking_id}/cancel
```

#### Get Booking with Dispatch
```http
GET /api/v1/bookings/{booking_id}/with-dispatch
```

#### Get Bookings by Status
```http
GET /api/v1/bookings/status/{status}
```

### Dispatch Endpoints

#### Create Dispatch
```http
POST /api/v1/dispatches/
```
**Request Body:**
```json
{
    "booking_id": 1
}
```

#### Get Dispatch
```http
GET /api/v1/dispatches/{dispatch_id}
```

#### Get Dispatch by Booking
```http
GET /api/v1/dispatches/booking/{booking_id}
```

#### Get All Dispatches
```http
GET /api/v1/dispatches/?skip=0&limit=100&status=pending
```

#### Get Driver Dispatches
```http
GET /api/v1/dispatches/driver/{driver_id}?skip=0&limit=100
```

#### Assign Driver
```http
PUT /api/v1/dispatches/{dispatch_id}/assign-driver?driver_id=1
```

#### Update Dispatch Status
```http
PUT /api/v1/dispatches/{dispatch_id}/status
```
**Request Body:**
```json
{
    "status": "dispatched",
    "dispatch_time": "2024-01-15T10:30:00Z"
}
```

#### Update Dispatch
```http
PUT /api/v1/dispatches/{dispatch_id}
```
**Request Body:**
```json
{
    "assigned_driver": 2,
    "dispatch_time": "2024-01-15T10:30:00Z"
}
```

#### Cancel Dispatch
```http
DELETE /api/v1/dispatches/{dispatch_id}/cancel
```

#### Get Dispatch with Details
```http
GET /api/v1/dispatches/{dispatch_id}/with-details
```

#### Get Dispatches by Status
```http
GET /api/v1/dispatches/status/{status}
```

#### Get Available Drivers
```http
GET /api/v1/dispatches/available-drivers
```

## 🔄 Workflow Examples

### Complete Booking Workflow

1. **Customer creates a booking**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/bookings/" \
        -H "Content-Type: application/json" \
        -d '{
            "user_id": 1,
            "source": "Warehouse A",
            "destination": "Distribution Center B",
            "service_type": "cargo",
            "price": 150.00
        }'
   ```

2. **System automatically:**
   - Assigns available truck and driver
   - Creates dispatch record
   - Sets booking status to "confirmed"

3. **Update booking status to "in_progress"**
   ```bash
   curl -X PUT "http://localhost:8000/api/v1/bookings/1/status" \
        -H "Content-Type: application/json" \
        -d '{"booking_status": "in_progress"}'
   ```

4. **Update dispatch status to "dispatched"**
   ```bash
   curl -X PUT "http://localhost:8000/api/v1/dispatches/1/status" \
        -H "Content-Type: application/json" \
        -d '{
            "status": "dispatched",
            "dispatch_time": "2024-01-15T10:30:00Z"
        }'
   ```

5. **Complete the trip**
   ```bash
   curl -X PUT "http://localhost:8000/api/v1/dispatches/1/status" \
        -H "Content-Type: application/json" \
        -d '{
            "status": "completed",
            "arrival_time": "2024-01-15T12:30:00Z"
        }'
   ```

### Public Service Booking

```bash
curl -X POST "http://localhost:8000/api/v1/bookings/" \
     -H "Content-Type: application/json" \
     -d '{
         "user_id": 2,
         "source": "Central Station",
         "destination": "Airport Terminal",
         "service_type": "public",
         "price": 25.00
     }'
```

## 🧪 Testing

Run the comprehensive test script to verify all functionality:

```bash
python test_booking_dispatch.py
```

The test script will:
- Create cargo and public service bookings
- Test dispatch workflow
- Verify status updates
- Test error handling
- Demonstrate all API endpoints

## 🔧 Configuration

### Environment Variables
Make sure your `.env` file includes:
```env
DATABASE_URL=postgresql://user:password@localhost/transportation_db
API_V1_STR=/api/v1
PROJECT_NAME=Transportation Management System
```

### Database Setup
The system uses SQLAlchemy with PostgreSQL. Tables are automatically created when the application starts.

## 📈 Status Enums

### Booking Status
- `pending`: Initial booking state
- `confirmed`: Truck and driver assigned
- `in_progress`: Trip has started
- `completed`: Trip finished successfully
- `cancelled`: Booking cancelled

### Dispatch Status
- `pending`: Dispatch created, waiting for assignment
- `dispatched`: Driver assigned and dispatched
- `in_transit`: Vehicle en route
- `arrived`: Vehicle arrived at destination
- `completed`: Trip completed
- `cancelled`: Dispatch cancelled

### Service Type
- `cargo`: Freight transportation
- `public`: Passenger transportation

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up database:**
   ```bash
   # Configure your database connection in .env
   ```

3. **Run the application:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access the API documentation:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

5. **Run tests:**
   ```bash
   python test_booking_dispatch.py
   ```

## 🔒 Security Considerations

- Implement authentication and authorization
- Validate user permissions for booking operations
- Sanitize input data
- Use HTTPS in production
- Implement rate limiting
- Add request logging and monitoring

## 📝 Error Handling

The system includes comprehensive error handling:
- 404: Resource not found
- 400: Bad request (invalid data)
- 503: Service unavailable (no available trucks/drivers)
- 422: Validation errors

## 🔄 Integration Points

The booking and dispatch system integrates with:
- User management system
- Vehicle/fleet management
- Driver management
- Payment processing
- Analytics and reporting

## 📊 Monitoring and Analytics

Track key metrics:
- Booking success rate
- Dispatch completion time
- Driver utilization
- Revenue per booking
- Service type distribution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
