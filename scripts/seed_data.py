#!/usr/bin/env python3
"""
Seed data script for Transportation Management System
Run this script to populate the database with initial data for testing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle, VehicleType, VehicleStatus
from app.models.fleet import Fleet, Driver
from app.models.route import Route
from app.models.trip import Trip, TripStatus
from app.models.booking import Booking, ServiceType, BookingStatus
from app.models.dispatch import Dispatch, DispatchStatus
from app.models.payment import Payment, Invoice, InvoiceItem, PaymentMethod, PaymentStatus, InvoiceStatus
from app.models.tracking import Location, TripLocation, Geofence, GeofenceEvent, LocationType
from app.models.notification import Notification, NotificationTemplate, NotificationPreference, BroadcastMessage, NotificationType, NotificationStatus, NotificationCategory
from app.models.public_service import PublicService, Ticket, ServiceSchedule, ServiceStatus, TicketStatus
from app.models.order import Order, OrderStatus, CargoType
from app.models.service import Service, ServiceType as ServiceTypeEnum, ServiceStatus as ServiceStatusEnum, ServicePriority
from app.models.parts_inventory import PartsInventory, PartCategory, PartStatus
from app.models.parts_usage import PartsUsage
from app.models.maintenance_schedule import MaintenanceSchedule, ScheduleType
from app.models.service_history import ServiceHistory
from app.models.trip_booking import TripBooking
from app.models.admin_dashboard import SystemHealth, AnalyticsSnapshot, DashboardWidget, UserActivity, SystemAlert, PerformanceMetric, ReportType, MetricType
from app.models.log import Log
from datetime import datetime, timedelta, time
import random
import json

def create_seed_data():
    db = SessionLocal()
    try:
        print("🌱 Creating comprehensive seed data for Transportation Management System...")
        
        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("⚠️  Database already contains data. Skipping data creation to avoid conflicts.")
            print("💡 To create fresh data, please manually clear the database first.")
            return
        
        # Create admin user
        admin_user = User(
            name="Admin User",
            email="admin@transport.com",
            phone="+1234567890",
            role=UserRole.ADMIN,
            password_hash=get_password_hash("admin123"),
            is_active=True
        )
        db.add(admin_user)
        db.flush()
        
        # Create default fleet
        default_fleet = Fleet(
            name="Default Fleet",
            description="Default fleet for the transportation system",
            is_active=True
        )
        db.add(default_fleet)
        db.flush()
        
        # Create driver user
        driver_user = User(
            name="John Driver",
            email="driver@transport.com",
            phone="+1234567891",
            role=UserRole.DRIVER,
            password_hash=get_password_hash("driver123"),
            is_active=True
        )
        db.add(driver_user)
        db.flush()
        
        # Create dispatcher user (using TRANSPORTER role)
        dispatcher_user = User(
            name="Sarah Dispatcher",
            email="dispatcher@transport.com",
            phone="+1234567892",
            role=UserRole.TRANSPORTER,
            password_hash=get_password_hash("dispatcher123"),
            is_active=True
        )
        db.add(dispatcher_user)
        db.flush()
        
        # Create public users
        public_users = []
        for i in range(1, 6):
            public_user = User(
                name=f"Public User {i}",
                email=f"user{i}@transport.com",
                phone=f"+123456789{i+2}",
                role=UserRole.PUBLIC_USER,
                password_hash=get_password_hash(f"user{i}23"),
                is_active=True
            )
            db.add(public_user)
            db.flush()
            public_users.append(public_user)
        
        # Create driver profile
        driver_profile = Driver(
            user_id=driver_user.id,
            license_number="DL123456789",
            license_expiry=datetime.now() + timedelta(days=365*5),
            shift_start=time(8, 0),  # 8:00 AM
            shift_end=time(18, 0),   # 6:00 PM
            is_available=True
        )
        db.add(driver_profile)
        db.flush()
        
        # Create vehicles
        vehicles = []
        vehicle_data = [
            (VehicleType.TRUCK, 5000.0, "TRK001", "Freightliner Cascadia", 2020),
            (VehicleType.BUS, 50, "BUS001", "Blue Bird Vision", 2019),
            (VehicleType.VAN, 1000.0, "VAN001", "Ford Transit", 2021),
            (VehicleType.TRUCK, 3000.0, "TRK002", "Peterbilt 579", 2022),
            (VehicleType.BUS, 40, "BUS002", "Thomas Saf-T-Liner", 2020),
        ]
        
        for i, (vtype, capacity, plate, model, year) in enumerate(vehicle_data):
            vehicle = Vehicle(
                type=vtype,
                capacity=capacity,
                license_plate=plate,
                model=model,
                year=year,
                assigned_driver_id=driver_profile.id if i == 0 else None,
                status=VehicleStatus.ACTIVE
            )
            db.add(vehicle)
            db.flush()
            vehicles.append(vehicle)
        
        # Create routes
        routes = []
        route_data = [
            ("R001", "Downtown Station", "Airport Terminal", ["Downtown Station", "Central Mall", "University", "Airport Terminal"], 45, 25.5, 15.0),
            ("R002", "Suburban Center", "Industrial Park", ["Suburban Center", "Shopping District", "Industrial Park"], 30, 18.0, 12.0),
            ("R003", "City Center", "Shopping Mall", ["City Center", "Business District", "Shopping Mall"], 25, 12.0, 10.0),
            ("R004", "Residential Area", "Hospital", ["Residential Area", "School", "Hospital"], 35, 20.0, 13.0),
        ]
        
        for route_num, start, end, stops, est_time, distance, fare in route_data:
            route = Route(
                route_number=route_num,
                start_point=start,
                end_point=end,
                stops=stops,
                estimated_time=est_time,
                distance=distance,
                base_fare=fare,
                description=f"Route from {start} to {end}",
                is_active=True
            )
            db.add(route)
            db.flush()
            routes.append(route)
        
        # Create trips
        trips = []
        for i, route in enumerate(routes):
            for j in range(2):  # 2 trips per route
                trip = Trip(
                    route_id=route.id,
                    vehicle_id=vehicles[i % len(vehicles)].id,
                    driver_id=driver_profile.id,
                    departure_time=datetime.now() + timedelta(hours=i*2 + j*4),
                    arrival_time=datetime.now() + timedelta(hours=i*2 + j*4, minutes=route.estimated_time),
                    fare=route.base_fare,
                    available_seats=vehicles[i % len(vehicles)].capacity if vehicles[i % len(vehicles)].type == VehicleType.BUS else 10,
                    total_seats=vehicles[i % len(vehicles)].capacity if vehicles[i % len(vehicles)].type == VehicleType.BUS else 10,
                    status=TripStatus.SCHEDULED
                )
                db.add(trip)
                db.flush()
                trips.append(trip)
        
        # Create bookings
        bookings = []
        for i, user in enumerate(public_users):
            for j in range(2):  # 2 bookings per user
                booking = Booking(
                    user_id=user.id,
                    source=f"Location {i*2 + j + 1}",
                    destination=f"Destination {i*2 + j + 1}",
                    truck_id=vehicles[i % len(vehicles)].id,
                    service_type=ServiceType.CARGO if i % 2 == 0 else ServiceType.PUBLIC,
                    booking_status=random.choice(list(BookingStatus)),
                    price=random.uniform(50.0, 200.0)
                )
                db.add(booking)
                db.flush()
                bookings.append(booking)
        
        # Create dispatches
        dispatches = []
        for booking in bookings[:5]:  # First 5 bookings get dispatches
            dispatch = Dispatch(
                booking_id=booking.booking_id,
                assigned_driver=driver_profile.id,
                dispatch_time=datetime.now() + timedelta(minutes=random.randint(5, 30)),
                arrival_time=datetime.now() + timedelta(minutes=random.randint(30, 60)),
                status=random.choice(list(DispatchStatus))
            )
            db.add(dispatch)
            db.flush()
            dispatches.append(dispatch)
        
        # Create payments
        payments = []
        for i, booking in enumerate(bookings):
            payment = Payment(
                booking_id=booking.booking_id,
                user_id=booking.user_id,
                amount=booking.price,
                method=random.choice(list(PaymentMethod)),
                status=random.choice(list(PaymentStatus)),
                transaction_id=f"TXN{str(i+1).zfill(6)}",
                gateway_reference=f"GW{str(i+1).zfill(8)}",
                payment_time=datetime.now() - timedelta(hours=random.randint(1, 24))
            )
            db.add(payment)
            db.flush()
            payments.append(payment)
        
        # Create invoices
        invoices = []
        for i, booking in enumerate(bookings):
            invoice = Invoice(
                booking_id=booking.booking_id,
                user_id=booking.user_id,
                invoice_number=f"INV{str(i+1).zfill(6)}",
                total_amount=booking.price * 1.1,  # 10% tax
                subtotal=booking.price,
                tax_amount=booking.price * 0.1,
                discount_amount=0.0,
                currency="USD",
                status=random.choice(list(InvoiceStatus)),
                due_date=datetime.now() + timedelta(days=30),
                billing_address=f"Address {i+1}, City, State 12345",
                shipping_address=f"Shipping Address {i+1}, City, State 12345"
            )
            db.add(invoice)
            db.flush()
            invoices.append(invoice)
            
            # Create invoice items
            invoice_item = InvoiceItem(
                invoice_id=invoice.invoice_id,
                description=f"Transportation service from {booking.source} to {booking.destination}",
                quantity=1,
                unit_price=booking.price,
                total_price=booking.price,
                tax_rate=0.1,
                tax_amount=booking.price * 0.1
            )
            db.add(invoice_item)
        
        # Create locations for tracking
        locations = []
        for vehicle in vehicles:
            for i in range(5):  # 5 locations per vehicle
                location = Location(
                    vehicle_id=vehicle.id,
                    latitude=random.uniform(40.0, 45.0),
                    longitude=random.uniform(-75.0, -70.0),
                    altitude=random.uniform(0, 100),
                    speed=random.uniform(0, 80),
                    heading=random.uniform(0, 360),
                    accuracy=random.uniform(1, 10),
                    location_type=LocationType.GPS,
                    timestamp=datetime.now() - timedelta(minutes=i*30)
                )
                db.add(location)
                db.flush()
                locations.append(location)
        
        # Create geofences
        geofences = []
        geofence_data = [
            ("Downtown Zone", "Central business district", 40.7128, -74.0060, 1000),
            ("Airport Zone", "Airport terminal area", 40.6413, -73.7781, 800),
            ("Industrial Park", "Industrial area", 40.7589, -73.9851, 1200),
        ]
        
        for name, desc, lat, lon, radius in geofence_data:
            geofence = Geofence(
                name=name,
                description=desc,
                latitude=lat,
                longitude=lon,
                radius=radius,
                is_active=True
            )
            db.add(geofence)
            db.flush()
            geofences.append(geofence)
        
        # Create geofence events
        for geofence in geofences:
            for vehicle in vehicles[:2]:  # Events for first 2 vehicles
                event = GeofenceEvent(
                    geofence_id=geofence.geofence_id,
                    vehicle_id=vehicle.id,
                    event_type=random.choice(["enter", "exit"]),
                    location_id=locations[0].location_id  # Use first location as reference
                )
                db.add(event)
        
        # Create notifications
        notifications = []
        for user in [admin_user, driver_user, dispatcher_user] + public_users:
            for i in range(3):  # 3 notifications per user
                notification = Notification(
                    user_id=user.id,
                    title=f"Notification {i+1} for {user.name}",
                    message=f"This is a test notification message for {user.name}",
                    notification_type=random.choice(list(NotificationType)),
                    category=random.choice(list(NotificationCategory)),
                    status=random.choice(list(NotificationStatus)),
                    priority=random.choice(["low", "normal", "high", "urgent"]),
                    notification_data={"test": True, "user_id": user.id}
                )
                db.add(notification)
                db.flush()
                notifications.append(notification)
        
        # Create notification templates
        templates = []
        template_data = [
            ("booking_confirmation", "Booking Confirmed", "Your booking has been confirmed for {service_type} service.", NotificationType.EMAIL, NotificationCategory.BOOKING),
            ("payment_success", "Payment Successful", "Payment of ${amount} has been processed successfully.", NotificationType.SMS, NotificationCategory.PAYMENT),
            ("dispatch_update", "Dispatch Update", "Your vehicle has been dispatched and will arrive in {estimated_time} minutes.", NotificationType.PUSH, NotificationCategory.DISPATCH),
        ]
        
        for name, title, message, ntype, category in template_data:
            template = NotificationTemplate(
                name=name,
                title_template=title,
                message_template=message,
                notification_type=ntype,
                category=category,
                is_active=True,
                variables={"service_type": "string", "amount": "float", "estimated_time": "integer"}
            )
            db.add(template)
            db.flush()
            templates.append(template)
        
        # Create notification preferences
        for user in [admin_user, driver_user, dispatcher_user] + public_users:
            for ntype in NotificationType:
                for category in NotificationCategory:
                    preference = NotificationPreference(
                        user_id=user.id,
                        notification_type=ntype,
                        category=category,
                        is_enabled=random.choice([True, False])
                    )
                    db.add(preference)
        
        # Create broadcast messages
        broadcasts = []
        broadcast_data = [
            ("System Maintenance", "Scheduled maintenance on Sunday 2-4 AM", NotificationType.EMAIL, "all"),
            ("New Route Available", "New express route to airport now available", NotificationType.PUSH, "customers"),
            ("Driver Meeting", "Monthly driver meeting this Friday at 3 PM", NotificationType.SMS, "drivers"),
        ]
        
        for title, message, ntype, audience in broadcast_data:
            broadcast = BroadcastMessage(
                title=title,
                message=message,
                notification_type=ntype,
                target_audience=audience,
                total_recipients=random.randint(10, 100),
                sent_count=random.randint(5, 50),
                failed_count=random.randint(0, 5),
                created_by=admin_user.id
            )
            db.add(broadcast)
            db.flush()
            broadcasts.append(broadcast)
        
        # Create public services
        public_services = []
        service_data = [
            ("Airport Express", [{"name": "Downtown", "location": "40.7128,-74.0060", "sequence": 1}, {"name": "Airport", "location": "40.6413,-73.7781", "sequence": 2}], 25.0),
            ("City Shuttle", [{"name": "City Center", "location": "40.7589,-73.9851", "sequence": 1}, {"name": "Mall", "location": "40.7505,-73.9934", "sequence": 2}], 15.0),
        ]
        
        for name, stops, fare in service_data:
            service = PublicService(
                route_name=name,
                stops=stops,
                schedule={"monday": ["08:00", "12:00", "16:00"], "tuesday": ["08:00", "12:00", "16:00"]},
                vehicle_id=vehicles[1].id,  # Use bus
                capacity=50,
                fare=fare,
                status=ServiceStatus.ACTIVE
            )
            db.add(service)
            db.flush()
            public_services.append(service)
        
        # Create tickets
        for service in public_services:
            for i in range(10):  # 10 tickets per service
                ticket = Ticket(
                    service_id=service.service_id,
                    passenger_name=f"Passenger {i+1}",
                    seat_number=f"{random.randint(1, 10)}{chr(65 + random.randint(0, 3))}",
                    booking_status=random.choice(list(TicketStatus)),
                    user_id=public_users[i % len(public_users)].id if i < len(public_users) else None,
                    travel_date=datetime.now() + timedelta(days=random.randint(1, 7)),
                    fare_paid=service.fare
                )
                db.add(ticket)
        
        # Create service schedules
        for service in public_services:
            for day in range(7):  # All days of week
                schedule = ServiceSchedule(
                    service_id=service.service_id,
                    day_of_week=day,
                    departure_time=time(8, 0),
                    arrival_time=time(9, 0),
                    is_active=True
                )
                db.add(schedule)
        
        # Create orders
        orders = []
        for i, user in enumerate(public_users):
            for j in range(2):  # 2 orders per user
                order = Order(
                    customer_id=user.id,
                    vehicle_id=vehicles[i % len(vehicles)].id,
                    driver_id=driver_profile.id,
                    pickup_location=f"Pickup Location {i*2 + j + 1}",
                    drop_location=f"Drop Location {i*2 + j + 1}",
                    cargo_type=random.choice(list(CargoType)),
                    cargo_weight=random.uniform(100, 1000),
                    cargo_description=f"Cargo description for order {i*2 + j + 1}",
                    status=random.choice(list(OrderStatus)),
                    pickup_time=datetime.now() + timedelta(hours=random.randint(1, 24)),
                    estimated_delivery_time=datetime.now() + timedelta(hours=random.randint(2, 48)),
                    total_amount=random.uniform(200, 800)
                )
                db.add(order)
                db.flush()
                orders.append(order)
        
        # Create services (maintenance)
        services = []
        for vehicle in vehicles:
            for i in range(2):  # 2 services per vehicle
                service = Service(
                    vehicle_id=vehicle.id,
                    service_type=random.choice(list(ServiceTypeEnum)),
                    description=f"Service {i+1} for {vehicle.model}",
                    scheduled_date=datetime.now() + timedelta(days=random.randint(1, 30)),
                    estimated_duration=random.randint(60, 240),
                    cost=random.uniform(100, 500),
                    status=random.choice(list(ServiceStatusEnum)),
                    priority=random.choice(list(ServicePriority)),
                    assigned_mechanic_id=admin_user.id,
                    notes=f"Service notes for {vehicle.license_plate}"
                )
                db.add(service)
                db.flush()
                services.append(service)
        
        # Create parts inventory
        parts = []
        part_data = [
            ("ENG001", "Engine Oil Filter", PartCategory.FILTERS, "Mobil", 15.99, 50),
            ("TIR001", "Tire Set", PartCategory.TIRES, "Michelin", 299.99, 20),
            ("BRA001", "Brake Pads", PartCategory.BRAKES, "Brembo", 89.99, 30),
            ("BAT001", "Battery", PartCategory.ELECTRICAL, "Optima", 199.99, 15),
            ("FLU001", "Brake Fluid", PartCategory.FLUIDS, "Castrol", 12.99, 100),
        ]
        
        for part_num, name, category, manufacturer, cost, stock in part_data:
            part = PartsInventory(
                part_number=part_num,
                name=name,
                category=category,
                description=f"High quality {name.lower()}",
                manufacturer=manufacturer,
                supplier=f"{manufacturer} Supplier",
                unit_cost=cost,
                current_stock=stock,
                min_stock_level=5,
                max_stock_level=stock * 2,
                location=f"Warehouse A-{random.randint(1, 10)}",
                status=PartStatus.AVAILABLE
            )
            db.add(part)
            db.flush()
            parts.append(part)
        
        # Create parts usage
        for service in services[:5]:  # First 5 services use parts
            for part in parts[:3]:  # Use first 3 parts
                usage = PartsUsage(
                    service_id=service.id,
                    part_id=part.id,
                    quantity_used=random.randint(1, 3),
                    unit_cost_at_time=part.unit_cost,
                    total_cost=part.unit_cost * random.randint(1, 3),
                    notes=f"Used in {service.description}"
                )
                db.add(usage)
        
        # Create maintenance schedules
        for vehicle in vehicles:
            schedule = MaintenanceSchedule(
                vehicle_id=vehicle.id,
                service_type="Oil Change",
                schedule_type=ScheduleType.MILEAGE_BASED,
                interval_value=5000,  # Every 5000 miles
                last_service_mileage=random.randint(0, 50000),
                last_service_date=datetime.now() - timedelta(days=random.randint(30, 180)),
                next_service_mileage=random.randint(50000, 100000),
                next_service_date=datetime.now() + timedelta(days=random.randint(30, 90)),
                description="Regular oil change maintenance",
                estimated_cost=random.uniform(50, 150)
            )
            db.add(schedule)
        
        # Create service history
        for vehicle in vehicles:
            for i in range(3):  # 3 service history records per vehicle
                history = ServiceHistory(
                    vehicle_id=vehicle.id,
                    service_type=random.choice(["Oil Change", "Tire Rotation", "Brake Service"]),
                    description=f"Service history record {i+1}",
                    performed_by=f"Mechanic {i+1}",
                    performed_at=datetime.now() - timedelta(days=random.randint(30, 365)),
                    cost=random.uniform(100, 500),
                    parts_used=[{"part": "Oil Filter", "cost": 15.99}, {"part": "Oil", "cost": 25.99}],
                    mileage_at_service=random.randint(10000, 100000),
                    next_service_mileage=random.randint(50000, 150000),
                    notes=f"Service performed on {vehicle.license_plate}"
                )
                db.add(history)
        
        # Create trip bookings
        for trip in trips[:5]:  # First 5 trips get bookings
            for i in range(3):  # 3 bookings per trip
                booking = TripBooking(
                    trip_id=trip.id,
                    user_id=public_users[i % len(public_users)].id,
                    seat_number=f"{random.randint(1, 10)}{chr(65 + random.randint(0, 3))}",
                    status=random.choice(list(BookingStatus))
                )
                db.add(booking)
        
        # Create admin dashboard data
        # System health
        health_services = ["API Gateway", "Database", "Payment Gateway", "Notification Service"]
        for service_name in health_services:
            health = SystemHealth(
                service_name=service_name,
                status=random.choice(["healthy", "warning", "critical"]),
                response_time=random.uniform(10, 500),
                error_count=random.randint(0, 10),
                details={"uptime": random.uniform(95, 99.9), "memory_usage": random.uniform(50, 90)}
            )
            db.add(health)
        
        # Analytics snapshots
        for report_type in ReportType:
            for metric_type in MetricType:
                snapshot = AnalyticsSnapshot(
                    report_type=report_type,
                    metric_type=metric_type,
                    period_start=datetime.now() - timedelta(days=7),
                    period_end=datetime.now(),
                    value=random.uniform(100, 10000),
                    analytics_data={"trend": "up", "growth_rate": random.uniform(5, 25)}
                )
                db.add(snapshot)
        
        # Dashboard widgets
        widget_data = [
            ("Revenue Chart", "chart", {"type": "line", "data": "revenue_data"}),
            ("Booking Metrics", "metric", {"value": "150", "unit": "bookings"}),
            ("Vehicle Status", "table", {"columns": ["Vehicle", "Status", "Location"]}),
        ]
        
        for name, widget_type, config in widget_data:
            widget = DashboardWidget(
                name=name,
                widget_type=widget_type,
                config=config,
                position={"x": random.randint(0, 100), "y": random.randint(0, 100)},
                is_active=True,
                created_by=admin_user.id
            )
            db.add(widget)
        
        # User activities
        activities = ["login", "booking_created", "payment_made", "trip_viewed"]
        for user in [admin_user, driver_user, dispatcher_user] + public_users:
            for i in range(5):  # 5 activities per user
                activity = UserActivity(
                    user_id=user.id,
                    action=random.choice(activities),
                    resource_type=random.choice(["booking", "payment", "trip", "user"]),
                    resource_id=random.randint(1, 100),
                    ip_address=f"192.168.1.{random.randint(1, 255)}",
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    activity_data={"session_id": f"session_{i}", "duration": random.randint(60, 3600)}
                )
                db.add(activity)
        
        # System alerts
        alert_data = [
            ("error", "Database Connection Failed", "Unable to connect to database", "high"),
            ("warning", "Low Disk Space", "Server disk space is running low", "medium"),
            ("info", "System Update Available", "New system update is ready for installation", "low"),
        ]
        
        for alert_type, title, message, severity in alert_data:
            alert = SystemAlert(
                alert_type=alert_type,
                title=title,
                message=message,
                severity=severity,
                is_resolved=random.choice([True, False]),
                resolved_by=admin_user.id if random.choice([True, False]) else None,
                alert_data={"affected_services": ["database", "api"], "resolution_time": random.randint(5, 60)}
            )
            db.add(alert)
        
        # Performance metrics
        metric_names = ["response_time", "throughput", "error_rate", "cpu_usage", "memory_usage"]
        for metric_name in metric_names:
            for i in range(10):  # 10 data points per metric
                metric = PerformanceMetric(
                    metric_name=metric_name,
                    metric_value=random.uniform(0, 100),
                    unit="ms" if metric_name == "response_time" else "%" if "usage" in metric_name else "req/s",
                    timestamp=datetime.now() - timedelta(minutes=i*5),
                    tags={"service": "api", "environment": "production"}
                )
                db.add(metric)
        
        # Create logs
        log_actions = ["create", "update", "delete", "view", "login", "logout"]
        for user in [admin_user, driver_user, dispatcher_user] + public_users:
            for i in range(3):  # 3 logs per user
                log = Log(
                    user_id=user.id,
                    action=random.choice(log_actions),
                    resource_type=random.choice(["user", "booking", "vehicle", "payment"]),
                    resource_id=random.randint(1, 100),
                    details={"ip": f"192.168.1.{random.randint(1, 255)}", "user_agent": "Mozilla/5.0"},
                    ip_address=f"192.168.1.{random.randint(1, 255)}",
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                )
                db.add(log)
        
        # Commit all changes
        db.commit()
        
        print("✅ Comprehensive seed data created successfully!")
        print("\n📋 Created users:")
        print(f"   Admin: admin@transport.com / admin123")
        print(f"   Driver: driver@transport.com / driver123")
        print(f"   Dispatcher: dispatcher@transport.com / dispatcher123")
        for i, user in enumerate(public_users):
            print(f"   Public User {i+1}: user{i+1}@transport.com / user{i+1}23")
        
        print("\n🚛 Created vehicles:")
        for vehicle in vehicles:
            print(f"   {vehicle.type.value.title()}: {vehicle.license_plate} ({vehicle.model})")
        
        print("\n🛣️  Created routes:")
        for route in routes:
            print(f"   Route {route.route_number}: {route.start_point} → {route.end_point}")
        
        print("\n🚌 Created trips:")
        for trip in trips:
            print(f"   Trip: Route {trip.route_id} at {trip.departure_time.strftime('%H:%M')}")
        
        print("\n📦 Created bookings:")
        print(f"   Total bookings: {len(bookings)}")
        
        print("\n🚚 Created dispatches:")
        print(f"   Total dispatches: {len(dispatches)}")
        
        print("\n💳 Created payments:")
        print(f"   Total payments: {len(payments)}")
        
        print("\n🧾 Created invoices:")
        print(f"   Total invoices: {len(invoices)}")
        
        print("\n📍 Created locations:")
        print(f"   Total locations: {len(locations)}")
        
        print("\n🔔 Created notifications:")
        print(f"   Total notifications: {len(notifications)}")
        
        print("\n🎫 Created public services:")
        print(f"   Total services: {len(public_services)}")
        
        print("\n📋 Created orders:")
        print(f"   Total orders: {len(orders)}")
        
        print("\n🔧 Created services:")
        print(f"   Total services: {len(services)}")
        
        print("\n🔩 Created parts:")
        print(f"   Total parts: {len(parts)}")
        
        print("\n📊 Created admin dashboard data:")
        print(f"   System health records, analytics snapshots, widgets, activities, alerts, and metrics")
        
        print("\n📝 Created logs:")
        print(f"   Activity logs for all users")
        
    except Exception as e:
        print(f"❌ Error creating seed data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_seed_data()
