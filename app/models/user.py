from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    TRANSPORTER = "transporter"
    DRIVER = "driver"
    CUSTOMER = "customer"
    PUBLIC_SERVICE_MANAGER = "public_service_manager"
    PUBLIC_USER = "public_user"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.PUBLIC_USER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    driver_profile = relationship("Driver", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="customer")
    payments = relationship("Payment", back_populates="user")
    invoices = relationship("Invoice", back_populates="user")
    logs = relationship("Log", back_populates="user")
    bookings = relationship("Booking", back_populates="user")
    tickets = relationship("Ticket", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    notification_preferences = relationship("NotificationPreference", back_populates="user")
