from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Dict, Any
from app.core.database import get_db
from app.core.deps import require_admin
from app.models.service import Service, ServiceStatus, ServiceType
from app.models.vehicle import Vehicle
from app.models.parts_inventory import PartsInventory
from app.models.parts_usage import PartsUsage
from app.models.maintenance_schedule import MaintenanceSchedule
from app.models.user import User
from datetime import datetime, timedelta

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/service-summary")
def get_service_summary(
    start_date: datetime = Query(default=None),
    end_date: datetime = Query(default=None),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get service summary statistics (Admin only)"""
    
    # Set default date range if not provided
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
    
    # Service count by status
    status_counts = db.query(
        Service.status,
        func.count(Service.id).label('count')
    ).filter(
        and_(Service.created_at >= start_date, Service.created_at <= end_date)
    ).group_by(Service.status).all()
    
    # Service count by type
    type_counts = db.query(
        Service.service_type,
        func.count(Service.id).label('count')
    ).filter(
        and_(Service.created_at >= start_date, Service.created_at <= end_date)
    ).group_by(Service.service_type).all()
    
    # Total cost
    total_cost = db.query(func.sum(Service.cost)).filter(
        and_(Service.created_at >= start_date, Service.created_at <= end_date)
    ).scalar() or 0
    
    # Average service duration
    avg_duration = db.query(func.avg(Service.actual_duration)).filter(
        and_(Service.actual_duration.isnot(None))
    ).scalar() or 0
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "summary": {
            "total_services": sum(count.count for count in status_counts),
            "total_cost": total_cost,
            "average_duration_minutes": round(avg_duration, 2)
        },
        "by_status": [{"status": count.status.value, "count": count.count} for count in status_counts],
        "by_type": [{"type": count.service_type.value, "count": count.count} for count in type_counts]
    }

@router.get("/vehicle-maintenance")
def get_vehicle_maintenance_status(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get vehicle maintenance status overview (Admin only)"""
    
    # Get all vehicles with their maintenance status
    vehicles = db.query(Vehicle).all()
    maintenance_status = []
    
    for vehicle in vehicles:
        # Get pending services
        pending_services = db.query(Service).filter(
            and_(Service.vehicle_id == vehicle.id, Service.status == ServiceStatus.SCHEDULED)
        ).count()
        
        # Get overdue services
        overdue_services = db.query(Service).filter(
            and_(
                Service.vehicle_id == vehicle.id,
                Service.status == ServiceStatus.SCHEDULED,
                Service.scheduled_date < datetime.now()
            )
        ).count()
        
        # Get last service date
        last_service = db.query(Service).filter(
            and_(Service.vehicle_id == vehicle.id, Service.status == ServiceStatus.COMPLETED)
        ).order_by(Service.completed_at.desc()).first()
        
        maintenance_status.append({
            "vehicle_id": vehicle.id,
            "license_plate": vehicle.license_plate,
            "type": vehicle.type.value,
            "status": vehicle.status.value,
            "pending_services": pending_services,
            "overdue_services": overdue_services,
            "last_service_date": last_service.completed_at if last_service else None,
            "assigned_driver": vehicle.assigned_driver.user.name if vehicle.assigned_driver else None
        })
    
    return {
        "total_vehicles": len(vehicles),
        "vehicles_requiring_maintenance": len([v for v in maintenance_status if v["pending_services"] > 0]),
        "vehicles_overdue": len([v for v in maintenance_status if v["overdue_services"] > 0]),
        "vehicle_details": maintenance_status
    }

@router.get("/parts-inventory-status")
def get_parts_inventory_status(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get parts inventory status (Admin only)"""
    
    # Get parts by status
    parts_by_status = db.query(
        PartsInventory.status,
        func.count(PartsInventory.id).label('count'),
        func.sum(PartsInventory.current_stock * PartsInventory.unit_cost).label('total_value')
    ).group_by(PartsInventory.status).all()
    
    # Get low stock parts
    low_stock_parts = db.query(PartsInventory).filter(
        PartsInventory.current_stock <= PartsInventory.min_stock_level
    ).all()
    
    # Get parts by category
    parts_by_category = db.query(
        PartsInventory.category,
        func.count(PartsInventory.id).label('count'),
        func.sum(PartsInventory.current_stock).label('total_stock')
    ).group_by(PartsInventory.category).all()
    
    return {
        "summary": {
            "total_parts": sum(count.count for count in parts_by_status),
            "total_inventory_value": sum(count.total_value or 0 for count in parts_by_status)
        },
        "by_status": [
            {
                "status": count.status.value,
                "count": count.count,
                "value": count.total_value or 0
            } for count in parts_by_status
        ],
        "by_category": [
            {
                "category": count.category.value,
                "count": count.count,
                "total_stock": count.total_stock or 0
            } for count in parts_by_category
        ],
        "low_stock_alerts": [
            {
                "part_id": part.id,
                "part_number": part.part_number,
                "name": part.name,
                "current_stock": part.current_stock,
                "min_stock_level": part.min_stock_level,
                "category": part.category.value
            } for part in low_stock_parts
        ]
    }

@router.get("/maintenance-schedule")
def get_maintenance_schedule_overview(
    days_ahead: int = Query(default=30, ge=1, le=365),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get upcoming maintenance schedule (Admin only)"""
    
    future_date = datetime.now() + timedelta(days=days_ahead)
    
    # Get scheduled services in the next X days
    upcoming_services = db.query(Service).filter(
        and_(
            Service.status == ServiceStatus.SCHEDULED,
            Service.scheduled_date <= future_date
        )
    ).order_by(Service.scheduled_date).all()
    
    # Get maintenance schedules
    maintenance_schedules = db.query(MaintenanceSchedule).filter(
        MaintenanceSchedule.is_active == True
    ).all()
    
    # Group services by date
    services_by_date = {}
    for service in upcoming_services:
        date_key = service.scheduled_date.strftime('%Y-%m-%d')
        if date_key not in services_by_date:
            services_by_date[date_key] = []
        
        services_by_date[date_key].append({
            "service_id": service.id,
            "vehicle_id": service.vehicle_id,
            "service_type": service.service_type.value,
            "description": service.description,
            "priority": service.priority.value,
            "estimated_duration": service.estimated_duration,
            "cost": service.cost
        })
    
    return {
        "period_days": days_ahead,
        "total_upcoming_services": len(upcoming_services),
        "services_by_date": services_by_date,
        "maintenance_schedules": [
            {
                "id": schedule.id,
                "vehicle_id": schedule.vehicle_id,
                "service_type": schedule.service_type,
                "schedule_type": schedule.schedule_type.value,
                "next_service_date": schedule.next_service_date,
                "next_service_mileage": schedule.next_service_mileage,
                "description": schedule.description,
                "estimated_cost": schedule.estimated_cost
            } for schedule in maintenance_schedules
        ]
    }

@router.get("/cost-analysis")
def get_service_cost_analysis(
    start_date: datetime = Query(default=None),
    end_date: datetime = Query(default=None),
    group_by: str = Query(default="month", pattern="^(month|week|day|vehicle|service_type)$"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get service cost analysis (Admin only)"""
    
    # Set default date range if not provided
    if not start_date:
        start_date = datetime.now() - timedelta(days=90)
    if not end_date:
        end_date = datetime.now()
    
    if group_by == "month":
        # Group by month
        cost_data = db.query(
            func.date_trunc('month', Service.created_at).label('period'),
            func.sum(Service.cost).label('total_cost'),
            func.count(Service.id).label('service_count')
        ).filter(
            and_(Service.created_at >= start_date, Service.created_at <= end_date)
        ).group_by(func.date_trunc('month', Service.created_at)).order_by('period').all()
    
    elif group_by == "week":
        # Group by week
        cost_data = db.query(
            func.date_trunc('week', Service.created_at).label('period'),
            func.sum(Service.cost).label('total_cost'),
            func.count(Service.id).label('service_count')
        ).filter(
            and_(Service.created_at >= start_date, Service.created_at <= end_date)
        ).group_by(func.date_trunc('week', Service.created_at)).order_by('period').all()
    
    elif group_by == "day":
        # Group by day
        cost_data = db.query(
            func.date_trunc('day', Service.created_at).label('period'),
            func.sum(Service.cost).label('total_cost'),
            func.count(Service.id).label('service_count')
        ).filter(
            and_(Service.created_at >= start_date, Service.created_at <= end_date)
        ).group_by(func.date_trunc('day', Service.created_at)).order_by('period').all()
    
    elif group_by == "vehicle":
        # Group by vehicle
        cost_data = db.query(
            Vehicle.license_plate.label('period'),
            func.sum(Service.cost).label('total_cost'),
            func.count(Service.id).label('service_count')
        ).join(Service, Vehicle.id == Service.vehicle_id).filter(
            and_(Service.created_at >= start_date, Service.created_at <= end_date)
        ).group_by(Vehicle.license_plate).order_by(func.sum(Service.cost).desc()).all()
    
    elif group_by == "service_type":
        # Group by service type
        cost_data = db.query(
            Service.service_type.label('period'),
            func.sum(Service.cost).label('total_cost'),
            func.count(Service.id).label('service_count')
        ).filter(
            and_(Service.created_at >= start_date, Service.created_at <= end_date)
        ).group_by(Service.service_type).order_by(func.sum(Service.cost).desc()).all()
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "group_by": group_by,
        "total_cost": sum(data.total_cost for data in cost_data),
        "total_services": sum(data.service_count for data in cost_data),
        "cost_breakdown": [
            {
                "period": str(data.period),
                "total_cost": data.total_cost,
                "service_count": data.service_count,
                "average_cost": round(data.total_cost / data.service_count, 2) if data.service_count > 0 else 0
            } for data in cost_data
        ]
    }
