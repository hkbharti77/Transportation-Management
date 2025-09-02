# 🔧 Service Management System

## Overview

The Service Management System provides comprehensive vehicle maintenance tracking, parts inventory management, and service scheduling capabilities for the Transportation Management System.

## 🏗️ Core Components

### 1. Service Management (`/api/v1/services/`)
- **Create Services**: Schedule maintenance, repairs, inspections
- **Service Tracking**: Monitor service status and progress
- **Service History**: Complete maintenance records
- **Priority Management**: Critical, high, medium, low priority levels

### 2. Parts Inventory (`/api/v1/services/parts/`)
- **Parts Management**: Add, update, track spare parts
- **Stock Control**: Monitor inventory levels and alerts
- **Category Organization**: Engine, transmission, brakes, tires, etc.
- **Cost Tracking**: Unit costs and total inventory value

### 3. Maintenance Scheduling (`/api/v1/services/schedules/`)
- **Automated Scheduling**: Mileage-based and time-based maintenance
- **Preventive Maintenance**: Regular service reminders
- **Condition Monitoring**: Track vehicle health metrics

### 4. Analytics & Reporting (`/api/v1/analytics/`)
- **Service Summary**: Statistics and performance metrics
- **Cost Analysis**: Detailed cost breakdowns
- **Inventory Status**: Parts availability and alerts
- **Maintenance Overview**: Vehicle health dashboard

## 📊 Database Schema

### Service Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `services` | Active service records | vehicle_id, service_type, status, priority |
| `service_history` | Completed service records | vehicle_id, performed_at, cost, parts_used |
| `parts_inventory` | Spare parts management | part_number, category, stock_levels, cost |
| `parts_usage` | Parts consumption tracking | service_id, part_id, quantity, cost |
| `maintenance_schedules` | Automated maintenance planning | vehicle_id, interval, next_service |

### Service Types

```python
class ServiceType(str, enum.Enum):
    MAINTENANCE = "maintenance"      # Regular maintenance
    REPAIR = "repair"                # Breakdown repairs
    INSPECTION = "inspection"        # Safety inspections
    CLEANING = "cleaning"            # Vehicle cleaning
    FUEL_REFILL = "fuel_refill"     # Fuel services
    TIRE_CHANGE = "tire_change"     # Tire replacement
    OIL_CHANGE = "oil_change"       # Oil changes
```

### Service Statuses

```python
class ServiceStatus(str, enum.Enum):
    SCHEDULED = "scheduled"          # Planned service
    IN_PROGRESS = "in_progress"      # Currently being performed
    COMPLETED = "completed"          # Service finished
    CANCELLED = "cancelled"          # Service cancelled
    OVERDUE = "overdue"              # Past due date
```

### Priority Levels

```python
class ServicePriority(str, enum.Enum):
    LOW = "low"                      # Non-urgent
    MEDIUM = "medium"                # Standard priority
    HIGH = "high"                    # Important
    CRITICAL = "critical"            # Emergency/urgent
```

## 🚀 API Endpoints

### Service Management

#### Create Service
```http
POST /api/v1/services/
Authorization: Bearer {token}
Content-Type: application/json

{
  "vehicle_id": 1,
  "service_type": "maintenance",
  "description": "Regular oil change and inspection",
  "scheduled_date": "2024-01-15T10:00:00Z",
  "estimated_duration": 120,
  "cost": 150.00,
  "priority": "medium",
  "assigned_mechanic_id": 5
}
```

#### Get Services
```http
GET /api/v1/services/?status=scheduled&service_type=maintenance&vehicle_id=1
Authorization: Bearer {token}
```

#### Update Service Status
```http
PUT /api/v1/services/{service_id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed",
  "actual_duration": 135,
  "notes": "Oil filter was replaced, brake pads checked"
}
```

### Parts Inventory

#### Create Part
```http
POST /api/v1/services/parts
Authorization: Bearer {token}
Content-Type: application/json

{
  "part_number": "OIL-FILTER-001",
  "name": "High Performance Oil Filter",
  "category": "filters",
  "description": "Premium oil filter for diesel engines",
  "manufacturer": "FilterCorp",
  "supplier": "AutoParts Inc",
  "unit_cost": 25.50,
  "current_stock": 50,
  "min_stock_level": 10,
  "max_stock_level": 100,
  "location": "Warehouse A - Shelf 3"
}
```

#### Update Stock
```http
PUT /api/v1/services/parts/{part_id}/stock
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity_change": -2,
  "reason": "service_usage",
  "notes": "Used in oil change service #123"
}
```

#### Add Parts to Service
```http
POST /api/v1/services/{service_id}/parts
Authorization: Bearer {token}
Content-Type: application/json

[
  {
    "part_id": 1,
    "quantity_used": 1,
    "unit_cost_at_time": 25.50,
    "notes": "Oil filter replacement"
  },
  {
    "part_id": 2,
    "quantity_used": 5,
    "unit_cost_at_time": 12.00,
    "notes": "5 liters of synthetic oil"
  }
]
```

### Analytics & Reporting

#### Service Summary
```http
GET /api/v1/analytics/service-summary?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {token}
```

#### Vehicle Maintenance Status
```http
GET /api/v1/analytics/vehicle-maintenance
Authorization: Bearer {token}
```

#### Parts Inventory Status
```http
GET /api/v1/analytics/parts-inventory-status
Authorization: Bearer {token}
```

#### Cost Analysis
```http
GET /api/v1/analytics/cost-analysis?group_by=vehicle&start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {token}
```

## 🔐 Access Control

### Role-Based Permissions

| Role | Service Access | Parts Access | Analytics Access |
|------|----------------|--------------|------------------|
| **Admin** | Full access | Full access | Full access |
| **Driver** | Own vehicle only | Read-only | None |
| **Dispatcher** | Read-only | Read-only | None |
| **Public User** | None | None | None |

### Driver Access
- Drivers can view services for their assigned vehicle
- Can update service status (start, complete, update notes)
- Cannot create new services or modify costs
- Can view parts used in their vehicle's services

## 📈 Business Intelligence

### Key Metrics

1. **Service Performance**
   - Total services completed
   - Average service duration
   - Service completion rate
   - Cost per service type

2. **Vehicle Health**
   - Maintenance schedule compliance
   - Overdue services count
   - Service frequency by vehicle
   - Cost per vehicle

3. **Inventory Management**
   - Stock turnover rates
   - Low stock alerts
   - Inventory value
   - Parts usage patterns

4. **Cost Analysis**
   - Monthly/weekly cost trends
   - Cost by vehicle type
   - Cost by service type
   - Parts vs. labor costs

### Automated Alerts

- **Low Stock Parts**: When inventory falls below minimum levels
- **Overdue Services**: Services past scheduled date
- **Maintenance Due**: Upcoming scheduled maintenance
- **High-Cost Services**: Services exceeding budget thresholds

## 🛠️ Implementation Examples

### Creating a Maintenance Schedule

```python
# Create maintenance schedule for oil changes every 5,000 miles
maintenance_schedule = MaintenanceSchedule(
    vehicle_id=1,
    service_type="oil_change",
    schedule_type=ScheduleType.MILEAGE_BASED,
    interval_value=5000,
    description="Oil change every 5,000 miles",
    estimated_cost=75.00
)
```

### Tracking Parts Usage

```python
# When performing a service, track parts used
parts_usage = PartsUsage(
    service_id=service.id,
    part_id=oil_filter.id,
    quantity_used=1,
    unit_cost_at_time=oil_filter.unit_cost,
    total_cost=oil_filter.unit_cost,
    notes="Oil filter replacement"
)

# Update inventory
oil_filter.current_stock -= 1
if oil_filter.current_stock <= oil_filter.min_stock_level:
    oil_filter.status = "low_stock"
```

### Service Status Workflow

```python
# 1. Create scheduled service
service = Service(status=ServiceStatus.SCHEDULED)

# 2. Start service
service.status = ServiceStatus.IN_PROGRESS
service.actual_departure_time = datetime.utcnow()

# 3. Complete service
service.status = ServiceStatus.COMPLETED
service.actual_arrival_time = datetime.utcnow()
service.completed_at = datetime.utcnow()

# 4. Move to service history
service_history = ServiceHistory(
    vehicle_id=service.vehicle_id,
    service_type=service.service_type,
    performed_at=service.completed_at,
    cost=service.cost
)
```

## 🔮 Future Enhancements

### Planned Features

1. **Predictive Maintenance**
   - AI-powered failure prediction
   - Condition-based monitoring
   - Sensor data integration

2. **Mobile App Integration**
   - Driver service notifications
   - Photo documentation
   - Digital signatures

3. **Supplier Management**
   - Automated reordering
   - Price comparison
   - Delivery tracking

4. **Warranty Tracking**
   - Parts warranty management
   - Claim processing
   - Coverage validation

5. **Integration APIs**
   - GPS tracking systems
   - Fuel management systems
   - Driver behavior monitoring

## 📚 Best Practices

### Service Management

1. **Regular Scheduling**: Set up preventive maintenance schedules
2. **Priority Classification**: Use appropriate priority levels
3. **Documentation**: Maintain detailed service notes
4. **Cost Tracking**: Monitor service costs and trends

### Parts Inventory

1. **Stock Levels**: Set appropriate min/max stock levels
2. **Categorization**: Organize parts by logical categories
3. **Supplier Management**: Maintain multiple supplier relationships
4. **Regular Audits**: Conduct periodic inventory counts

### Analytics Usage

1. **Regular Monitoring**: Check key metrics weekly/monthly
2. **Trend Analysis**: Identify patterns and anomalies
3. **Cost Optimization**: Use data to reduce maintenance costs
4. **Performance Tracking**: Monitor service quality metrics

---

**The Service Management System provides a comprehensive foundation for maintaining fleet health, optimizing costs, and ensuring operational efficiency.**
