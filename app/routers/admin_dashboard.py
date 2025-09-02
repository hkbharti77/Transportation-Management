from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, date

from app.core.database import get_db
from app.schemas.admin_dashboard import (
    DashboardOverviewResponse, ReportRequest, ReportResponse,
    BookingAnalyticsResponse, TruckUtilizationResponse,
    DriverPerformanceResponse, RevenueReportResponse, MaintenanceOverviewResponse,
    UserAnalyticsResponse, SystemMetricsResponse, HealthCheckResponse
)

router = APIRouter(prefix="/admin", tags=["admin-dashboard"])

@router.get("/overview", response_model=DashboardOverviewResponse)
def overview(db: Session = Depends(get_db)):
    # Dummy data aggregation (replace with real queries)
    return DashboardOverviewResponse(
        total_users=1000,
        active_users_today=123,
        total_bookings=5421,
        bookings_today=57,
        total_revenue=125432.50,
        revenue_today=2345.67,
        total_trucks=120,
        active_trucks=85,
        system_health=[],
        recent_alerts=[]
    )

@router.post("/reports", response_model=ReportResponse)
def generate_report(payload: ReportRequest, db: Session = Depends(get_db)):
    # Dummy generator
    now = datetime.utcnow()
    return ReportResponse(
        report_id=f"RPT-{now.strftime('%Y%m%d%H%M%S')}",
        report_type=payload.report_type,
        metric_type=payload.metric_type,
        period_start=datetime.combine(payload.start_date, datetime.min.time()),
        period_end=datetime.combine(payload.end_date, datetime.max.time()),
        data=[{"label": "Sample", "value": 100}],
        summary={"total": 100},
        generated_at=now
    )

@router.get("/analytics/bookings", response_model=BookingAnalyticsResponse)
def booking_analytics(db: Session = Depends(get_db)):
    return BookingAnalyticsResponse(
        total_bookings=5421,
        completed_bookings=4800,
        cancelled_bookings=321,
        pending_bookings=300,
        booking_trends=[],
        top_routes=[],
        booking_by_status={"completed": 4800, "cancelled": 321, "pending": 300},
        revenue_by_period=[]
    )

@router.get("/analytics/truck-utilization", response_model=TruckUtilizationResponse)
def truck_utilization(db: Session = Depends(get_db)):
    return TruckUtilizationResponse(
        total_trucks=120,
        active_trucks=85,
        maintenance_trucks=10,
        idle_trucks=25,
        utilization_rate=78.5,
        average_trip_duration=3.2,
        total_distance=125432.1,
        fuel_consumption=5432.2,
        utilization_by_truck=[]
    )

@router.get("/analytics/driver-performance", response_model=DriverPerformanceResponse)
def driver_performance(db: Session = Depends(get_db)):
    return DriverPerformanceResponse(
        total_drivers=200,
        active_drivers=150,
        average_rating=4.4,
        total_trips=22000,
        completed_trips=21500,
        on_time_deliveries=20500,
        performance_by_driver=[],
        rating_distribution={}
    )

@router.get("/analytics/revenue", response_model=RevenueReportResponse)
def revenue_reports(db: Session = Depends(get_db)):
    return RevenueReportResponse(
        total_revenue=125432.50,
        revenue_today=2345.67,
        revenue_this_week=14567.33,
        revenue_this_month=54321.77,
        revenue_trends=[],
        revenue_by_service={},
        top_customers=[],
        payment_methods={}
    )

@router.get("/maintenance/overview", response_model=MaintenanceOverviewResponse)
def maintenance_overview(db: Session = Depends(get_db)):
    return MaintenanceOverviewResponse(
        total_maintenance=230,
        scheduled_maintenance=120,
        emergency_maintenance=15,
        completed_maintenance=95,
        maintenance_cost=45210.75,
        average_repair_time=6.4,
        maintenance_by_type={},
        upcoming_maintenance=[]
    )

@router.get("/users/analytics", response_model=UserAnalyticsResponse)
def user_analytics(db: Session = Depends(get_db)):
    return UserAnalyticsResponse(
        total_users=1000,
        new_users_today=12,
        new_users_this_week=78,
        new_users_this_month=250,
        active_users=345,
        user_growth=[],
        users_by_role={},
        top_users=[]
    )

@router.get("/system/metrics", response_model=SystemMetricsResponse)
def system_metrics(db: Session = Depends(get_db)):
    return SystemMetricsResponse(
        cpu_usage=34.5,
        memory_usage=62.1,
        disk_usage=70.2,
        active_connections=124,
        response_time=120.5,
        error_rate=0.6,
        uptime="12 days 4:32:10",
        last_backup=None
    )

@router.get("/system/health", response_model=List[HealthCheckResponse])
def system_health(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    return [
        HealthCheckResponse(service_name="api", status="healthy", response_time=110.3, last_check=now, details=None),
        HealthCheckResponse(service_name="db", status="healthy", response_time=35.7, last_check=now, details=None)
    ]
