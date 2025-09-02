from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class NotificationType(str, enum.Enum):
    SMS = "sms"
    EMAIL = "email"
    PUSH = "push"
    IN_APP = "in_app"

class NotificationStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    READ = "read"

class NotificationCategory(str, enum.Enum):
    BOOKING = "booking"
    DISPATCH = "dispatch"
    PAYMENT = "payment"
    SYSTEM = "system"
    MAINTENANCE = "maintenance"
    BROADCAST = "broadcast"

class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False)
    category = Column(Enum(NotificationCategory), nullable=False)
    status = Column(Enum(NotificationStatus), default=NotificationStatus.PENDING, nullable=False)
    priority = Column(String(20), default="normal", nullable=False)  # low, normal, high, urgent
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    notification_data = Column(JSON, nullable=True)  # Additional data like booking_id, trip_id, etc.
    retry_count = Column(Integer, default=0, nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")

class NotificationTemplate(Base):
    __tablename__ = "notification_templates"

    template_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    title_template = Column(String(255), nullable=False)
    message_template = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False)
    category = Column(Enum(NotificationCategory), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    variables = Column(JSON, nullable=True)  # Template variables
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    preference_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False)
    category = Column(Enum(NotificationCategory), nullable=False)
    is_enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="notification_preferences")

class BroadcastMessage(Base):
    __tablename__ = "broadcast_messages"

    broadcast_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False)
    target_audience = Column(String(100), nullable=False)  # all, drivers, customers, admins
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    total_recipients = Column(Integer, default=0, nullable=False)
    sent_count = Column(Integer, default=0, nullable=False)
    failed_count = Column(Integer, default=0, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    creator = relationship("User")
