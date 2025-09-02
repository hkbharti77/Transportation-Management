from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class ReportType(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"

class MetricType(str, enum.Enum):
    BOOKINGS = "bookings"
    REVENUE = "revenue"
    TRUCK_UTILIZATION = "truck_utilization"
    DRIVER_PERFORMANCE = "driver_performance"
    MAINTENANCE = "maintenance"
    CUSTOMER_SATISFACTION = "customer_satisfaction"

class SystemHealth(Base):
    __tablename__ = "system_health"

    health_id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False)  # healthy, warning, critical
    response_time = Column(Float, nullable=True)  # in milliseconds
    error_count = Column(Integer, default=0, nullable=False)
    last_check = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    details = Column(JSON, nullable=True)  # Additional health metrics
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"

    snapshot_id = Column(Integer, primary_key=True, index=True)
    report_type = Column(Enum(ReportType), nullable=False)
    metric_type = Column(Enum(MetricType), nullable=False)
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    value = Column(Float, nullable=False)
    analytics_data = Column(JSON, nullable=True)  # Additional analytics data
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DashboardWidget(Base):
    __tablename__ = "dashboard_widgets"

    widget_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    widget_type = Column(String(50), nullable=False)  # chart, metric, table, etc.
    config = Column(JSON, nullable=False)  # Widget configuration
    position = Column(JSON, nullable=True)  # Position on dashboard
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User")

class UserActivity(Base):
    __tablename__ = "user_activities"

    activity_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=True)  # booking, payment, etc.
    resource_id = Column(Integer, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    activity_data = Column(JSON, nullable=True)  # Additional activity data
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User")

class SystemAlert(Base):
    __tablename__ = "system_alerts"

    alert_id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(50), nullable=False)  # error, warning, info
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False)  # low, medium, high, critical
    is_resolved = Column(Boolean, default=False, nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    alert_data = Column(JSON, nullable=True)  # Additional alert data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    resolver = relationship("User")

class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"

    metric_id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=True)  # ms, %, count, etc.
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    tags = Column(JSON, nullable=True)  # Additional tags for filtering
    created_at = Column(DateTime(timezone=True), server_default=func.now())
