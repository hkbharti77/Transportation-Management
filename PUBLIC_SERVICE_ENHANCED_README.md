# Enhanced Public Service Scheduling System

A comprehensive FastAPI-based public service scheduling and ticket management system for transportation services. This system provides advanced features for route management, ticket booking, seat management, and real-time availability tracking.

## 🚌 Features

### Public Service Management
- **CRUD Operations**: Complete Create, Read, Update, Delete operations for public service routes
- **Route Configuration**: Flexible route setup with multiple stops and schedules
- **JSON Storage**: Stops and schedules stored as JSON for maximum flexibility
- **Truck Assignment**: Automatic or manual truck assignment to services
- **Status Management**: Service status tracking (active, inactive, maintenance, cancelled)

### Ticket Management
- **Seat Booking**: Advanced seat management with real-time availability
- **Automatic Assignment**: Smart seat assignment with preferred seat support
- **Booking Status**: Comprehensive ticket status tracking (available, reserved, booked, cancelled, used)
- **User Integration**: Support for both registered and guest users
- **Travel Date Management**: Flexible travel date scheduling

### Real-time Features
- **Seat Availability**: Real-time seat availability checking
- **Service Timetable**: Complete service timetable management
- **Statistics**: Service performance and revenue analytics
- **Search & Filter**: Advanced search and filtering capabilities

### Integration
- **Trip System Integration**: Seamless integration with existing trip management
- **Vehicle Management**: Integration with fleet management system
- **User Management**: Integration with user authentication system

## 📊 Database Schema

### PublicService Table
```sql
CREATE TABLE public_services (
    service_id INTEGER PRIMARY KEY,
    route_name VARCHAR(255) NOT NULL,
    stops JSON NOT NULL,  -- Array of stop objects
    schedule JSON NOT NULL,  -- Array of time slot objects
    assigned_truck INTEGER,
    capacity INTEGER NOT NULL DEFAULT 50,
    fare FLOAT NOT NULL,
    status ENUM('active', 'inactive', 'maintenance', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Ticket Table
```sql
CREATE TABLE tickets (
    ticket_id INTEGER PRIMARY KEY,
    service_id INTEGER NOT NULL,
    passenger_name VARCHAR(255) NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    booking_status ENUM('available', 'reserved', 'booked', 'cancelled', 'used') DEFAULT 'available',
    user_id INTEGER,  -- For registered users
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    travel_date TIMESTAMP NOT NULL,
    fare_paid FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
```

### ServiceSchedule Table
```sql
CREATE TABLE service_schedules (
    schedule_id INTEGER PRIMARY KEY,
    service_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,  -- 0=Monday, 6=Sunday
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🛠️ API Endpoints

### Public Service Management

#### Create Public Service
```http
POST /api/v1/public-services/
```
**Request Body:**
```json
{
    "route_name": "Downtown Express",
    "stops": [
        {
            "name": "Central Station",
            "location": "123 Main St, Downtown",
            "sequence": 1,
            "estimated_time": "08:00"
        },
        {
            "name": "Shopping Mall",
            "location": "456 Commerce Ave",
            "sequence": 2,
            "estimated_time": "08:15"
        }
    ],
    "schedule": [
        {
            "day": "Monday",
            "departure_time": "08:00",
            "arrival_time": "08:45"
        },
        {
            "day": "Tuesday",
            "departure_time": "08:00",
            "arrival_time": "08:45"
        }
    ],
    "capacity": 30,
    "fare": 15.00,
    "assigned_truck": 1
}
```

#### Get Public Service
```http
GET /api/v1/public-services/{service_id}
```

#### Get All Public Services
```http
GET /api/v1/public-services/?skip=0&limit=100&status=active
```

#### Update Public Service
```http
PUT /api/v1/public-services/{service_id}
```
**Request Body:**
```json
{
    "fare": 18.00,
    "capacity": 35,
    "status": "active"
}
```

#### Delete Public Service
```http
DELETE /api/v1/public-services/{service_id}
```

### Ticket Management

#### Create Ticket
```http
POST /api/v1/public-services/tickets/
```
**Request Body:**
```json
{
    "service_id": 1,
    "passenger_name": "John Doe",
    "seat_number": "1",
    "travel_date": "2024-12-25T08:00:00",
    "fare_paid": 15.00,
    "user_id": 1
}
```

#### Book Ticket with Auto-assignment
```http
POST /api/v1/public-services/book-ticket
```
**Request Body:**
```json
{
    "service_id": 1,
    "passenger_name": "John Doe",
    "travel_date": "2024-12-25T08:00:00",
    "preferred_seat": "1",
    "user_id": 1
}
```

#### Get Ticket
```http
GET /api/v1/public-services/tickets/{ticket_id}
```

#### Update Ticket
```http
PUT /api/v1/public-services/tickets/{ticket_id}
```
**Request Body:**
```json
{
    "passenger_name": "John Doe Updated",
    "booking_status": "booked"
}
```

#### Cancel Ticket
```http
DELETE /api/v1/public-services/tickets/{ticket_id}/cancel
```

### Seat Availability

#### Get Seat Availability
```http
GET /api/v1/public-services/{service_id}/availability?travel_date=2024-12-25
```

**Response:**
```json
{
    "service_id": 1,
    "route_name": "Downtown Express",
    "travel_date": "2024-12-25",
    "total_seats": 30,
    "available_seats": 25,
    "booked_seats": 5,
    "seat_details": [
        {
            "seat_number": "1",
            "status": "booked",
            "passenger_name": "John Doe",
            "ticket_id": 1
        },
        {
            "seat_number": "2",
            "status": "available",
            "passenger_name": null,
            "ticket_id": null
        }
    ]
}
```

### Service Timetable

#### Get Service Timetable
```http
GET /api/v1/public-services/{service_id}/timetable
```

**Response:**
```json
[
    {
        "service_id": 1,
        "route_name": "Downtown Express",
        "day_of_week": "Monday",
        "departure_time": "08:00",
        "arrival_time": "08:45",
        "is_active": true
    },
    {
        "service_id": 1,
        "route_name": "Downtown Express",
        "day_of_week": "Tuesday",
        "departure_time": "08:00",
        "arrival_time": "08:45",
        "is_active": true
    }
]
```

### Service Statistics

#### Get Service Statistics
```http
GET /api/v1/public-services/{service_id}/statistics
```

**Response:**
```json
{
    "service_id": 1,
    "route_name": "Downtown Express",
    "total_tickets_sold": 150,
    "total_revenue": 2250.00,
    "average_occupancy": 75.5,
    "most_popular_times": ["Morning", "Afternoon", "Evening"]
}
```

### Service Management

#### Update Service Status
```http
PUT /api/v1/public-services/{service_id}/status?new_status=active
```

#### Get Service Tickets
```http
GET /api/v1/public-services/{service_id}/tickets?travel_date=2024-12-25
```

#### Search Routes
```http
GET /api/v1/public-services/search/routes?route_name=Downtown&status=active
```

### Integration Features

#### Create Trip from Service
```http
POST /api/v1/public-services/{service_id}/create-trip?departure_date=2024-12-25
```

## 🔄 Workflow Examples

### Complete Service Creation and Booking Workflow

1. **Create a public service route**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/public-services/" \
        -H "Content-Type: application/json" \
        -d '{
            "route_name": "Downtown Express",
            "stops": [
                {
                    "name": "Central Station",
                    "location": "123 Main St, Downtown",
                    "sequence": 1,
                    "estimated_time": "08:00"
                },
                {
                    "name": "Airport Terminal",
                    "location": "789 Aviation Blvd",
                    "sequence": 2,
                    "estimated_time": "08:45"
                }
            ],
            "schedule": [
                {
                    "day": "Monday",
                    "departure_time": "08:00",
                    "arrival_time": "08:45"
                }
            ],
            "capacity": 30,
            "fare": 15.00,
            "assigned_truck": 1
        }'
   ```

2. **Check seat availability**
   ```bash
   curl -X GET "http://localhost:8000/api/v1/public-services/1/availability?travel_date=2024-12-25"
   ```

3. **Book a ticket**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/public-services/book-ticket" \
        -H "Content-Type: application/json" \
        -d '{
            "service_id": 1,
            "passenger_name": "John Doe",
            "travel_date": "2024-12-25T08:00:00",
            "preferred_seat": "1",
            "user_id": 1
        }'
   ```

4. **Get service timetable**
   ```bash
   curl -X GET "http://localhost:8000/api/v1/public-services/1/timetable"
   ```

5. **View service statistics**
   ```bash
   curl -X GET "http://localhost:8000/api/v1/public-services/1/statistics"
   ```

## 🧪 Testing

Run the comprehensive test script to verify all functionality:

```bash
python test_public_service_enhanced.py
```

The test script will:
- Create multiple public service routes
- Test ticket booking with seat assignment
- Verify seat availability tracking
- Test service timetable functionality
- Demonstrate error handling
- Test integration features

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

### Service Status
- `active`: Service is operational
- `inactive`: Service is temporarily suspended
- `maintenance`: Service is under maintenance
- `cancelled`: Service is permanently cancelled

### Ticket Status
- `available`: Seat is available for booking
- `reserved`: Seat is temporarily reserved
- `booked`: Ticket is confirmed and paid
- `cancelled`: Ticket has been cancelled
- `used`: Ticket has been used for travel

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
   python test_public_service_enhanced.py
   ```

## 🔒 Security Considerations

- Implement authentication and authorization
- Validate user permissions for service operations
- Sanitize input data, especially JSON fields
- Use HTTPS in production
- Implement rate limiting for booking endpoints
- Add request logging and monitoring

## 📝 Error Handling

The system includes comprehensive error handling:
- 404: Resource not found (service, ticket)
- 400: Bad request (invalid data, seat already booked)
- 422: Validation errors (invalid JSON, missing fields)
- 503: Service unavailable (no available seats)

## 🔄 Integration Points

The enhanced public service system integrates with:
- User management system
- Vehicle/fleet management
- Trip management system
- Payment processing
- Analytics and reporting

## 📊 Monitoring and Analytics

Track key metrics:
- Service utilization rates
- Seat occupancy percentages
- Revenue per service
- Popular routes and times
- Booking success rates
- Customer satisfaction

## 🎯 Advanced Features

### Smart Seat Assignment
- Automatic seat assignment based on availability
- Preferred seat support
- Adjacent seat booking for groups
- Accessibility seat prioritization

### Real-time Updates
- Live seat availability updates
- Real-time booking confirmations
- Instant status notifications
- Dynamic pricing support

### Analytics Dashboard
- Service performance metrics
- Revenue analytics
- Customer behavior insights
- Route optimization suggestions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the test examples for usage patterns
