from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.core.database import get_db
from app.services.notification_service import NotificationService
from app.schemas.notification import (
    NotificationCreate, NotificationUpdate, NotificationResponse,
    NotificationTemplateCreate, NotificationTemplateUpdate, NotificationTemplateResponse,
    SendNotificationRequest, SendNotificationResponse,
    BroadcastMessageCreate, BroadcastMessageResponse,
    NotificationFilter, NotificationListResponse,
)
from app.models.notification import NotificationStatus

router = APIRouter(prefix="/notifications", tags=["notifications"])

# Templates
@router.post("/templates", response_model=NotificationTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_template(payload: NotificationTemplateCreate, db: Session = Depends(get_db)):
    service = NotificationService(db)
    return service.create_template(payload)

@router.put("/templates/{template_id}", response_model=NotificationTemplateResponse)
def update_template(template_id: int, payload: NotificationTemplateUpdate, db: Session = Depends(get_db)):
    service = NotificationService(db)
    return service.update_template(template_id, payload)

# Notifications
@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(payload: NotificationCreate, db: Session = Depends(get_db)):
    service = NotificationService(db)
    return service.create_notification(payload)

@router.put("/{notification_id}", response_model=NotificationResponse)
def update_notification(notification_id: int, payload: NotificationUpdate, db: Session = Depends(get_db)):
    service = NotificationService(db)
    return service.update_notification(notification_id, payload)

@router.post("/{notification_id}/send")
def send_notification(notification_id: int, db: Session = Depends(get_db)):
    service = NotificationService(db)
    return service.send_notification_now(notification_id)

@router.post("/send", response_model=SendNotificationResponse)
def send_bulk(payload: SendNotificationRequest, db: Session = Depends(get_db)):
    service = NotificationService(db)
    return service.send_bulk(payload)

# Broadcast
@router.post("/broadcasts", response_model=BroadcastMessageResponse, status_code=status.HTTP_201_CREATED)
def create_broadcast(payload: BroadcastMessageCreate, created_by: int = Query(...), db: Session = Depends(get_db)):
    service = NotificationService(db)
    b = service.create_broadcast(payload, created_by)
    return BroadcastMessageResponse(
        broadcast_id=b.broadcast_id,
        title=b.title,
        message=b.message,
        notification_type=b.notification_type,
        target_audience=b.target_audience,
        scheduled_at=b.scheduled_at,
        sent_at=b.sent_at,
        total_recipients=b.total_recipients,
        sent_count=b.sent_count,
        failed_count=b.failed_count,
        created_by=b.created_by,
        created_at=b.created_at,
    )

@router.post("/broadcasts/{broadcast_id}/execute")
def execute_broadcast(broadcast_id: int, db: Session = Depends(get_db)):
    service = NotificationService(db)
    return service.execute_broadcast(broadcast_id)

# Listing and filtering (basic)
@router.get("/list", response_model=NotificationListResponse)
def list_notifications(
    user_id: Optional[int] = Query(None),
    status_filter: Optional[NotificationStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    q = db.query
    from app.models.notification import Notification
    query = db.query(Notification)
    if user_id:
        query = query.filter(Notification.user_id == user_id)
    if status_filter:
        query = query.filter(Notification.status == status_filter)
    total = query.count()
    items = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return NotificationListResponse(
        notifications=items,
        total=total,
        page=skip // limit if limit else 0,
        size=limit,
        unread_count=db.query(Notification).filter(Notification.status != NotificationStatus.READ).count()
    )

# Stats
@router.get("/stats")
def notification_stats(db: Session = Depends(get_db)):
    service = NotificationService(db)
    return service.get_statistics()
