from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

from app.models.notification import (
    Notification, NotificationTemplate, NotificationPreference,
    BroadcastMessage, NotificationType, NotificationStatus,
    NotificationCategory
)
from app.models.user import User
from app.schemas.notification import (
    NotificationCreate, NotificationUpdate,
    NotificationTemplateCreate, NotificationTemplateUpdate,
    SendNotificationRequest, NotificationDeliveryStatus,
    BroadcastMessageCreate
)
from fastapi import HTTPException, status

class NotificationChannel:
    def send_sms(self, phone: str, message: str) -> bool:
        return True

    def send_email(self, email: str, subject: str, message: str) -> bool:
        return True

    def send_push(self, user_id: int, title: str, message: str) -> bool:
        return True

class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.channel = NotificationChannel()

    # Templates
    def create_template(self, data: NotificationTemplateCreate) -> NotificationTemplate:
        template = NotificationTemplate(
            name=data.name,
            title_template=data.title_template,
            message_template=data.message_template,
            notification_type=data.notification_type,
            category=data.category,
            is_active=True,
            variables=data.variables
        )
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        return template

    def update_template(self, template_id: int, data: NotificationTemplateUpdate) -> NotificationTemplate:
        template = self.db.query(NotificationTemplate).filter(NotificationTemplate.template_id == template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        for k, v in data.dict(exclude_unset=True).items():
            setattr(template, k, v)
        self.db.commit()
        self.db.refresh(template)
        return template

    def render_template(self, name: str, variables: Dict[str, Any]) -> Dict[str, str]:
        template = self.db.query(NotificationTemplate).filter(
            and_(NotificationTemplate.name == name, NotificationTemplate.is_active == True)
        ).first()
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        title = template.title_template.format(**variables)
        message = template.message_template.format(**variables)
        return {"title": title, "message": message}

    # Notifications
    def create_notification(self, data: NotificationCreate) -> Notification:
        user = self.db.query(User).filter(User.id == data.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        notif = Notification(
            user_id=data.user_id,
            title=data.title,
            message=data.message,
            notification_type=data.notification_type,
            category=data.category,
            status=NotificationStatus.PENDING,
            priority=data.priority,
            scheduled_at=data.scheduled_at,
            metadata=data.metadata
        )
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return notif

    def update_notification(self, notification_id: int, data: NotificationUpdate) -> Notification:
        notif = self.db.query(Notification).filter(Notification.notification_id == notification_id).first()
        if not notif:
            raise HTTPException(status_code=404, detail="Notification not found")
        for k, v in data.dict(exclude_unset=True).items():
            setattr(notif, k, v)
        self.db.commit()
        self.db.refresh(notif)
        return notif

    def send_notification_now(self, notification_id: int) -> NotificationDeliveryStatus:
        notif = self.db.query(Notification).filter(Notification.notification_id == notification_id).first()
        if not notif:
            raise HTTPException(status_code=404, detail="Notification not found")
        user = self.db.query(User).filter(User.id == notif.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        success = False
        if notif.notification_type == NotificationType.SMS and user.phone:
            success = self.channel.send_sms(user.phone, notif.message)
        elif notif.notification_type == NotificationType.EMAIL and user.email:
            success = self.channel.send_email(user.email, notif.title, notif.message)
        elif notif.notification_type in [NotificationType.PUSH, NotificationType.IN_APP]:
            success = self.channel.send_push(user.id, notif.title, notif.message)
        notif.sent_at = datetime.utcnow()
        notif.status = NotificationStatus.SENT if success else NotificationStatus.FAILED
        self.db.commit()
        return NotificationDeliveryStatus(
            notification_id=notif.notification_id,
            status=notif.status,
            sent_at=notif.sent_at,
            delivered_at=None,
            read_at=None,
            error_message=None if success else "Delivery failed"
        )

    def send_bulk(self, req: SendNotificationRequest) -> Dict[str, Any]:
        created, sent, failed = 0, 0, 0
        errors: List[str] = []
        for user_id in req.user_ids:
            title = req.title or ""
            message = req.message or ""
            if req.template_name:
                try:
                    rendered = self.render_template(req.template_name, req.template_variables or {})
                    title = title or rendered["title"]
                    message = message or rendered["message"]
                except Exception as e:
                    errors.append(f"Template render failed for user {user_id}: {e}")
                    failed += 1
                    continue
            notif = self.create_notification(NotificationCreate(
                user_id=user_id,
                title=title,
                message=message,
                notification_type=req.notification_type,
                category=req.category,
                priority=req.priority,
                scheduled_at=req.scheduled_at,
                metadata=req.metadata
            ))
            created += 1
            # For demo, send immediately if not scheduled
            if not req.scheduled_at:
                status_resp = self.send_notification_now(notif.notification_id)
                sent += 1 if status_resp.status in [NotificationStatus.SENT, NotificationStatus.DELIVERED] else 0
        return {
            "success": failed == 0,
            "notifications_created": created,
            "notifications_sent": sent,
            "failed_count": failed,
            "errors": errors
        }

    # Broadcasts
    def create_broadcast(self, data: BroadcastMessageCreate, created_by: int) -> BroadcastMessage:
        b = BroadcastMessage(
            title=data.title,
            message=data.message,
            notification_type=data.notification_type,
            target_audience=data.target_audience,
            scheduled_at=data.scheduled_at,
            created_by=created_by
        )
        self.db.add(b)
        self.db.commit()
        self.db.refresh(b)
        return b

    def execute_broadcast(self, broadcast_id: int) -> Dict[str, Any]:
        b = self.db.query(BroadcastMessage).filter(BroadcastMessage.broadcast_id == broadcast_id).first()
        if not b:
            raise HTTPException(status_code=404, detail="Broadcast not found")
        # Determine audience
        query = self.db.query(User)
        if b.target_audience == "drivers":
            query = query.filter(User.role == "driver")
        elif b.target_audience == "customers":
            query = query.filter(User.role == "customer")
        elif b.target_audience == "admins":
            query = query.filter(User.role == "admin")
        users = query.all()
        b.total_recipients = len(users)
        sent = 0
        failed = 0
        for user in users:
            notif = self.create_notification(NotificationCreate(
                user_id=user.id,
                title=b.title,
                message=b.message,
                notification_type=b.notification_type,
                category=NotificationCategory.BROADCAST,
                priority="high"
            ))
            status_resp = self.send_notification_now(notif.notification_id)
            if status_resp.status in [NotificationStatus.SENT, NotificationStatus.DELIVERED]:
                sent += 1
            else:
                failed += 1
        b.sent_count = sent
        b.failed_count = failed
        b.sent_at = datetime.utcnow()
        self.db.commit()
        return {"broadcast_id": b.broadcast_id, "sent": sent, "failed": failed}

    # Stats
    def get_statistics(self) -> Dict[str, Any]:
        total = self.db.query(Notification).count()
        sent = self.db.query(Notification).filter(Notification.status == NotificationStatus.SENT).count()
        delivered = self.db.query(Notification).filter(Notification.status == NotificationStatus.DELIVERED).count()
        failed = self.db.query(Notification).filter(Notification.status == NotificationStatus.FAILED).count()
        read = self.db.query(Notification).filter(Notification.status == NotificationStatus.READ).count()
        by_type = {
            t.value: self.db.query(Notification).filter(Notification.notification_type == t).count()
            for t in NotificationType
        }
        by_category = {
            c.value: self.db.query(Notification).filter(Notification.category == c).count()
            for c in NotificationCategory
        }
        delivery_rate = (delivered / total * 100) if total else 0.0
        read_rate = (read / total * 100) if total else 0.0
        return {
            "total_notifications": total,
            "sent_notifications": sent,
            "delivered_notifications": delivered,
            "failed_notifications": failed,
            "read_notifications": read,
            "delivery_rate": delivery_rate,
            "read_rate": read_rate,
            "notifications_by_type": by_type,
            "notifications_by_category": by_category
        }
