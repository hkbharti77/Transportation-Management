from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from app.models.admin_dashboard import ReportType, MetricType

# System Health schemas
class SystemHealthBase(BaseModel):
    service_name: str = Field(..., description="Service name")
    status: str = Field(..., description="Health status")
    response_time: Optional[float] = Field(None, description="Response time in ms")
    error_count: int = Field(default=0, description="Error count")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional details")

class SystemHealthResponse(SystemHealthBase):
    health_id: int
    last_check: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Analytics schemas
class AnalyticsSnapshotBase(BaseModel):
    report_type: ReportType = Field(..., description="Report type")
    metric_type: MetricType = Field(..., description="Metric type")
    period_start: datetime = Field(..., description="Period start")
    period_end: datetime = Field(..., description="Period end")
    value: float = Field(..., description="Metric value")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class AnalyticsSnapshotResponse(AnalyticsSnapshotBase):
    snapshot_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Widget schemas
class DashboardWidgetBase(BaseModel):
    name: str = Field(..., description="Widget name")
    widget_type: str = Field(..., description="Widget type")
    config: Dict[str, Any] = Field(..., description="Widget configuration")
    position: Optional[Dict[str, Any]] = Field(None, description="Position on dashboard")
    is_active: bool = Field(default=True, description="Widget status")

class DashboardWidgetCreate(DashboardWidgetBase):
    created_by: int = Field(..., description="Creator user ID")

class DashboardWidgetUpdate(BaseModel):
    name: Optional[str] = None
    widget_type: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    position: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class DashboardWidgetResponse(DashboardWidgetBase):
    widget_id: int
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# User Activity schemas
class UserActivityBase(BaseModel):
    action: str = Field(..., description="User action")
    resource_type: Optional[str] = Field(None, description="Resource type")
    resource_id: Optional[int] = Field(None, description="Resource ID")
    ip_address: Optional[str] = Field(None, description="IP address")
    user_agent: Optional[str] = Field(None, description="User agent")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class UserActivityResponse(UserActivityBase):
    activity_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# System Alert schemas
class SystemAlertBase(BaseModel):
    alert_type: str = Field(..., description="Alert type")
    title: str = Field(..., description="Alert title")
    message: str = Field(..., description="Alert message")
    severity: str = Field(..., description="Alert severity")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class SystemAlertCreate(SystemAlertBase):
    pass

class SystemAlertUpdate(BaseModel):
    alert_type: Optional[str] = None
    title: Optional[str] = None
    message: Optional[str] = None
    severity: Optional[str] = None
    is_resolved: Optional[bool] = None
    resolved_by: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class SystemAlertResponse(SystemAlertBase):
    alert_id: int
    is_resolved: bool
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Performance Metric schemas
class PerformanceMetricBase(BaseModel):
    metric_name: str = Field(..., description="Metric name")
    metric_value: float = Field(..., description="Metric value")
    unit: Optional[str] = Field(None, description="Metric unit")
    tags: Optional[Dict[str, Any]] = Field(None, description="Metric tags")

class PerformanceMetricResponse(PerformanceMetricBase):
    metric_id: int
    timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Report schemas
class ReportRequest(BaseModel):
    report_type: ReportType = Field(..., description="Report type")
    metric_type: MetricType = Field(..., description="Metric type")
    start_date: date = Field(..., description="Start date")
    end_date: date = Field(..., description="End date")
    filters: Optional[Dict[str, Any]] = Field(None, description="Additional filters")

class ReportResponse(BaseModel):
    report_id: str = Field(..., description="Report ID")
    report_type: ReportType
    metric_type: MetricType
    period_start: datetime
    period_end: datetime
    data: List[Dict[str, Any]] = Field(..., description="Report data")
    summary: Dict[str, Any] = Field(..., description="Report summary")
    generated_at: datetime

# Dashboard schemas
class DashboardOverviewResponse(BaseModel):
    total_users: int = Field(..., description="Total users")
    active_users_today: int = Field(..., description="Active users today")
    total_bookings: int = Field(..., description="Total bookings")
    bookings_today: int = Field(..., description="Bookings today")
    total_revenue: float = Field(..., description="Total revenue")
    revenue_today: float = Field(..., description="Revenue today")
    total_trucks: int = Field(..., description="Total trucks")
    active_trucks: int = Field(..., description="Active trucks")
    system_health: List[SystemHealthResponse] = Field(..., description="System health")
    recent_alerts: List[SystemAlertResponse] = Field(..., description="Recent alerts")

class BookingAnalyticsResponse(BaseModel):
    total_bookings: int = Field(..., description="Total bookings")
    completed_bookings: int = Field(..., description="Completed bookings")
    cancelled_bookings: int = Field(..., description="Cancelled bookings")
    pending_bookings: int = Field(..., description="Pending bookings")
    booking_trends: List[Dict[str, Any]] = Field(..., description="Booking trends")
    top_routes: List[Dict[str, Any]] = Field(..., description="Top routes")
    booking_by_status: Dict[str, int] = Field(..., description="Bookings by status")
    revenue_by_period: List[Dict[str, Any]] = Field(..., description="Revenue by period")

class TruckUtilizationResponse(BaseModel):
    total_trucks: int = Field(..., description="Total trucks")
    active_trucks: int = Field(..., description="Active trucks")
    maintenance_trucks: int = Field(..., description="Trucks in maintenance")
    idle_trucks: int = Field(..., description="Idle trucks")
    utilization_rate: float = Field(..., description="Utilization rate")
    average_trip_duration: float = Field(..., description="Average trip duration")
    total_distance: float = Field(..., description="Total distance")
    fuel_consumption: float = Field(..., description="Fuel consumption")
    utilization_by_truck: List[Dict[str, Any]] = Field(..., description="Utilization by truck")

class DriverPerformanceResponse(BaseModel):
    total_drivers: int = Field(..., description="Total drivers")
    active_drivers: int = Field(..., description="Active drivers")
    average_rating: float = Field(..., description="Average rating")
    total_trips: int = Field(..., description="Total trips")
    completed_trips: int = Field(..., description="Completed trips")
    on_time_deliveries: int = Field(..., description="On-time deliveries")
    performance_by_driver: List[Dict[str, Any]] = Field(..., description="Performance by driver")
    rating_distribution: Dict[str, int] = Field(..., description="Rating distribution")

class RevenueReportResponse(BaseModel):
    total_revenue: float = Field(..., description="Total revenue")
    revenue_today: float = Field(..., description="Revenue today")
    revenue_this_week: float = Field(..., description="Revenue this week")
    revenue_this_month: float = Field(..., description="Revenue this month")
    revenue_trends: List[Dict[str, Any]] = Field(..., description="Revenue trends")
    revenue_by_service: Dict[str, float] = Field(..., description="Revenue by service")
    top_customers: List[Dict[str, Any]] = Field(..., description="Top customers")
    payment_methods: Dict[str, float] = Field(..., description="Payment methods")

class MaintenanceOverviewResponse(BaseModel):
    total_maintenance: int = Field(..., description="Total maintenance records")
    scheduled_maintenance: int = Field(..., description="Scheduled maintenance")
    emergency_maintenance: int = Field(..., description="Emergency maintenance")
    completed_maintenance: int = Field(..., description="Completed maintenance")
    maintenance_cost: float = Field(..., description="Total maintenance cost")
    average_repair_time: float = Field(..., description="Average repair time")
    maintenance_by_type: Dict[str, int] = Field(..., description="Maintenance by type")
    upcoming_maintenance: List[Dict[str, Any]] = Field(..., description="Upcoming maintenance")

# User Management schemas
class UserAnalyticsResponse(BaseModel):
    total_users: int = Field(..., description="Total users")
    new_users_today: int = Field(..., description="New users today")
    new_users_this_week: int = Field(..., description="New users this week")
    new_users_this_month: int = Field(..., description="New users this month")
    active_users: int = Field(..., description="Active users")
    user_growth: List[Dict[str, Any]] = Field(..., description="User growth")
    users_by_role: Dict[str, int] = Field(..., description="Users by role")
    top_users: List[Dict[str, Any]] = Field(..., description="Top users")

class BulkUserOperationRequest(BaseModel):
    operation: str = Field(..., description="Operation type")
    user_ids: List[int] = Field(..., description="User IDs")
    data: Optional[Dict[str, Any]] = Field(None, description="Operation data")

class BulkUserOperationResponse(BaseModel):
    success: bool = Field(..., description="Operation success")
    total_users: int = Field(..., description="Total users")
    processed_users: int = Field(..., description="Processed users")
    failed_users: List[int] = Field(..., description="Failed user IDs")
    errors: List[str] = Field(..., description="Error messages")

# System Monitoring schemas
class SystemMetricsResponse(BaseModel):
    cpu_usage: float = Field(..., description="CPU usage percentage")
    memory_usage: float = Field(..., description="Memory usage percentage")
    disk_usage: float = Field(..., description="Disk usage percentage")
    active_connections: int = Field(..., description="Active connections")
    response_time: float = Field(..., description="Average response time")
    error_rate: float = Field(..., description="Error rate percentage")
    uptime: str = Field(..., description="System uptime")
    last_backup: Optional[datetime] = Field(None, description="Last backup time")

class HealthCheckResponse(BaseModel):
    service_name: str = Field(..., description="Service name")
    status: str = Field(..., description="Health status")
    response_time: float = Field(..., description="Response time")
    last_check: datetime = Field(..., description="Last check time")
    details: Optional[Dict[str, Any]] = Field(None, description="Health details")

# Export schemas
class ExportRequest(BaseModel):
    report_type: str = Field(..., description="Report type")
    format: str = Field(default="json", description="Export format")
    filters: Optional[Dict[str, Any]] = Field(None, description="Export filters")
    date_range: Optional[Dict[str, date]] = Field(None, description="Date range")

class ExportResponse(BaseModel):
    export_id: str = Field(..., description="Export ID")
    download_url: str = Field(..., description="Download URL")
    file_size: int = Field(..., description="File size in bytes")
    expires_at: datetime = Field(..., description="Expiration time")

# Filter schemas
class DashboardFilter(BaseModel):
    date_range: Optional[Dict[str, date]] = Field(None, description="Date range")
    user_id: Optional[int] = Field(None, description="Filter by user")
    truck_id: Optional[int] = Field(None, description="Filter by truck")
    driver_id: Optional[int] = Field(None, description="Filter by driver")
    status: Optional[str] = Field(None, description="Filter by status")
    category: Optional[str] = Field(None, description="Filter by category")

# Chart data schemas
class ChartDataResponse(BaseModel):
    chart_type: str = Field(..., description="Chart type")
    title: str = Field(..., description="Chart title")
    data: List[Dict[str, Any]] = Field(..., description="Chart data")
    options: Optional[Dict[str, Any]] = Field(None, description="Chart options")
