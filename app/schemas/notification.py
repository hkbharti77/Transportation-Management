from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.notification import NotificationType, NotificationStatus, NotificationCategory

# Notification schemas
class NotificationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Notification title")
    message: str = Field(..., min_length=1, description="Notification message")
    notification_type: NotificationType = Field(..., description="Notification type")
    category: NotificationCategory = Field(..., description="Notification category")
    priority: str = Field(default="normal", description="Notification priority")

    @field_validator('notification_type', mode='before')
    def convert_notification_type_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator('category', mode='before')
    def convert_category_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class NotificationCreate(NotificationBase):
    user_id: int = Field(..., description="User ID")
    scheduled_at: Optional[datetime] = Field(None, description="Scheduled send time")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class NotificationUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    message: Optional[str] = Field(None, min_length=1)
    status: Optional[NotificationStatus] = None
    priority: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

    @field_validator('status', mode='before')
    def convert_status_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class NotificationResponse(NotificationBase):
    notification_id: int
    user_id: int
    status: NotificationStatus
    scheduled_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None
    retry_count: int
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Notification Template schemas
class NotificationTemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Template name")
    title_template: str = Field(..., min_length=1, max_length=255, description="Title template")
    message_template: str = Field(..., min_length=1, description="Message template")
    notification_type: NotificationType = Field(..., description="Notification type")
    category: NotificationCategory = Field(..., description="Notification category")
    is_active: bool = Field(default=True, description="Template status")

    @field_validator('notification_type', mode='before')
    def convert_notification_type_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator('category', mode='before')
    def convert_category_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class NotificationTemplateCreate(NotificationTemplateBase):
    variables: Optional[Dict[str, Any]] = Field(None, description="Template variables")

class NotificationTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    title_template: Optional[str] = Field(None, min_length=1, max_length=255)
    message_template: Optional[str] = Field(None, min_length=1)
    notification_type: Optional[NotificationType] = None
    category: Optional[NotificationCategory] = None
    is_active: Optional[bool] = None
    variables: Optional[Dict[str, Any]] = None

    @field_validator('notification_type', mode='before')
    def convert_notification_type_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator('category', mode='before')
    def convert_category_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class NotificationTemplateResponse(NotificationTemplateBase):
    template_id: int
    variables: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Notification Preference schemas
class NotificationPreferenceBase(BaseModel):
    notification_type: NotificationType = Field(..., description="Notification type")
    category: NotificationCategory = Field(..., description="Notification category")
    is_enabled: bool = Field(default=True, description="Preference status")

    @field_validator('notification_type', mode='before')
    def convert_notification_type_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator('category', mode='before')
    def convert_category_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class NotificationPreferenceCreate(NotificationPreferenceBase):
    user_id: int = Field(..., description="User ID")

class NotificationPreferenceUpdate(BaseModel):
    is_enabled: bool = Field(..., description="Preference status")

class NotificationPreferenceResponse(NotificationPreferenceBase):
    preference_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Broadcast Message schemas
class BroadcastMessageBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Broadcast title")
    message: str = Field(..., min_length=1, description="Broadcast message")
    notification_type: NotificationType = Field(..., description="Notification type")
    target_audience: str = Field(..., description="Target audience")

    @field_validator('notification_type', mode='before')
    def convert_notification_type_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class BroadcastMessageCreate(BroadcastMessageBase):
    scheduled_at: Optional[datetime] = Field(None, description="Scheduled send time")

class BroadcastMessageUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    message: Optional[str] = Field(None, min_length=1)
    notification_type: Optional[NotificationType] = None
    target_audience: Optional[str] = None
    scheduled_at: Optional[datetime] = None

    @field_validator('notification_type', mode='before')
    def convert_notification_type_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class BroadcastMessageResponse(BroadcastMessageBase):
    broadcast_id: int
    scheduled_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    total_recipients: int
    sent_count: int
    failed_count: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True

# Notification sending schemas
class SendNotificationRequest(BaseModel):
    user_ids: List[int] = Field(..., description="List of user IDs")
    template_name: Optional[str] = Field(None, description="Template name to use")
    title: Optional[str] = Field(None, description="Custom title (overrides template)")
    message: Optional[str] = Field(None, description="Custom message (overrides template)")
    notification_type: NotificationType = Field(..., description="Notification type")
    category: NotificationCategory = Field(..., description="Notification category")
    priority: str = Field(default="normal", description="Notification priority")
    scheduled_at: Optional[datetime] = Field(None, description="Scheduled send time")
    template_variables: Optional[Dict[str, Any]] = Field(None, description="Template variables")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

    @field_validator('notification_type', mode='before')
    def convert_notification_type_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator('category', mode='before')
    def convert_category_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class SendNotificationResponse(BaseModel):
    success: bool = Field(..., description="Send success status")
    notifications_created: int = Field(..., description="Number of notifications created")
    notifications_sent: int = Field(..., description="Number of notifications sent")
    failed_count: int = Field(..., description="Number of failed sends")
    errors: List[str] = Field(default=[], description="Error messages")

class NotificationDeliveryStatus(BaseModel):
    notification_id: int
    status: NotificationStatus
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    error_message: Optional[str] = None

    @field_validator('status', mode='before')
    def convert_status_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

# Notification filtering and search schemas
class NotificationFilter(BaseModel):
    user_id: Optional[int] = Field(None, description="Filter by user ID")
    notification_type: Optional[NotificationType] = Field(None, description="Filter by type")
    category: Optional[NotificationCategory] = Field(None, description="Filter by category")
    status: Optional[NotificationStatus] = Field(None, description="Filter by status")
    priority: Optional[str] = Field(None, description="Filter by priority")
    start_date: Optional[datetime] = Field(None, description="Start date filter")
    end_date: Optional[datetime] = Field(None, description="End date filter")
    is_read: Optional[bool] = Field(None, description="Filter by read status")

    @field_validator('notification_type', mode='before')
    def convert_notification_type_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator('category', mode='before')
    def convert_category_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator('status', mode='before')
    def convert_status_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    page: int
    size: int
    unread_count: int

# Notification statistics schemas
class NotificationStatistics(BaseModel):
    total_notifications: int = Field(..., description="Total notifications")
    sent_notifications: int = Field(..., description="Sent notifications")
    delivered_notifications: int = Field(..., description="Delivered notifications")
    failed_notifications: int = Field(..., description="Failed notifications")
    read_notifications: int = Field(..., description="Read notifications")
    delivery_rate: float = Field(..., description="Delivery rate percentage")
    read_rate: float = Field(..., description="Read rate percentage")
    notifications_by_type: Dict[str, int] = Field(..., description="Notifications by type")
    notifications_by_category: Dict[str, int] = Field(..., description="Notifications by category")

# Template rendering schemas
class TemplateRenderRequest(BaseModel):
    template_name: str = Field(..., description="Template name")
    variables: Dict[str, Any] = Field(..., description="Template variables")

class TemplateRenderResponse(BaseModel):
    title: str = Field(..., description="Rendered title")
    message: str = Field(..., description="Rendered message")
    variables_used: List[str] = Field(..., description="Variables used in template")
    missing_variables: List[str] = Field(..., description="Missing variables")

# Bulk operations schemas
class BulkNotificationRequest(BaseModel):
    user_ids: List[int] = Field(..., description="List of user IDs")
    template_name: str = Field(..., description="Template name")
    template_variables: Optional[Dict[str, Any]] = Field(None, description="Template variables")
    scheduled_at: Optional[datetime] = Field(None, description="Scheduled send time")

class BulkNotificationResponse(BaseModel):
    success: bool = Field(..., description="Bulk operation success")
    total_users: int = Field(..., description="Total users targeted")
    notifications_created: int = Field(..., description="Notifications created")
    failed_users: List[int] = Field(..., description="Failed user IDs")
    errors: List[str] = Field(..., description="Error messages")