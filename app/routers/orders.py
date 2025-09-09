from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional, Dict, Any
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin, require_driver_or_admin
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.models.vehicle import Vehicle
from app.models.fleet import Driver
from app.models.route import Route
from app.schemas.order import OrderCreate, Order as OrderSchema, OrderUpdate, OrderAssignment
from app.models.log import Log
from datetime import datetime, timedelta

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=OrderSchema)
def create_order(
    order: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new transport order"""
    # Explicitly convert enum values to their string representations
    order_data = order.dict()
    order_data['cargo_type'] = order.cargo_type.value
    order_data['customer_id'] = current_user.id
    
    db_order = Order(**order_data)
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="create_order",
        resource_type="order",
        resource_id=db_order.id,
        details={"order_id": db_order.id}
    )
    db.add(log)
    db.commit()
    
    return db_order

@router.get("/", response_model=List[OrderSchema])
def get_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[OrderStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get orders with pagination and filtering"""
    query = db.query(Order)
    
    # Filter by status if provided
    if status:
        query = query.filter(Order.status == status)
    
    # Users can only see their own orders unless they're admin
    if current_user.role.value != "admin":
        query = query.filter(Order.customer_id == current_user.id)
    
    orders = query.offset(skip).limit(limit).all()
    return orders

# Analytics endpoints
@router.get("/analytics", response_model=Dict[str, Any])
def get_order_analytics(
    start_date: Optional[datetime] = Query(None, description="Start date for analytics"),
    end_date: Optional[datetime] = Query(None, description="End date for analytics"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get order analytics data (Admin only)"""
    
    # Set default date range if not provided
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
    
    query = db.query(Order).filter(
        and_(Order.created_at >= start_date, Order.created_at <= end_date)
    )
    
    # Total orders
    total_orders = query.count()
    
    # Orders by status
    status_counts = db.query(
        Order.status,
        func.count(Order.id).label('count')
    ).filter(
        and_(Order.created_at >= start_date, Order.created_at <= end_date)
    ).group_by(Order.status).all()
    
    # Orders by cargo type
    cargo_type_counts = db.query(
        Order.cargo_type,
        func.count(Order.id).label('count')
    ).filter(
        and_(Order.created_at >= start_date, Order.created_at <= end_date)
    ).group_by(Order.cargo_type).all()
    
    # Total revenue
    total_revenue = db.query(func.sum(Order.total_amount)).filter(
        and_(Order.created_at >= start_date, Order.created_at <= end_date)
    ).scalar() or 0
    
    # Average order value
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    # Completion rate
    completed_orders = query.filter(Order.status == OrderStatus.COMPLETED).count()
    completion_rate = (completed_orders / total_orders * 100) if total_orders > 0 else 0
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "summary": {
            "total_orders": total_orders,
            "completed_orders": completed_orders,
            "total_revenue": total_revenue,
            "average_order_value": round(avg_order_value, 2),
            "completion_rate": round(completion_rate, 2)
        },
        "by_status": [{
            "status": count.status.value,
            "count": count.count
        } for count in status_counts],
        "by_cargo_type": [{
            "cargo_type": count.cargo_type.value,
            "count": count.count
        } for count in cargo_type_counts]
    }

@router.get("/stats", response_model=Dict[str, Any])
def get_order_statistics(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get order statistics (Admin only)"""
    
    # Overall statistics
    total_orders = db.query(Order).count()
    pending_orders = db.query(Order).filter(Order.status == OrderStatus.PENDING).count()
    assigned_orders = db.query(Order).filter(Order.status == OrderStatus.ASSIGNED).count()
    in_progress_orders = db.query(Order).filter(Order.status == OrderStatus.IN_PROGRESS).count()
    completed_orders = db.query(Order).filter(Order.status == OrderStatus.COMPLETED).count()
    cancelled_orders = db.query(Order).filter(Order.status == OrderStatus.CANCELLED).count()
    
    # Recent orders (last 7 days)
    recent_date = datetime.now() - timedelta(days=7)
    recent_orders = db.query(Order).filter(Order.created_at >= recent_date).count()
    
    # Average delivery time for completed orders
    completed_orders_with_times = db.query(Order).filter(
        and_(
            Order.status == OrderStatus.COMPLETED,
            Order.actual_delivery_time.isnot(None)
        )
    ).all()
    
    if completed_orders_with_times:
        delivery_times = []
        for order in completed_orders_with_times:
            if order.pickup_time is not None and order.actual_delivery_time is not None:
                delivery_time = (order.actual_delivery_time - order.pickup_time).total_seconds() / 3600
                delivery_times.append(delivery_time)
        
        avg_delivery_time = sum(delivery_times) / len(delivery_times) if delivery_times else 0
    else:
        avg_delivery_time = 0
    
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "assigned_orders": assigned_orders,
        "in_progress_orders": in_progress_orders,
        "completed_orders": completed_orders,
        "cancelled_orders": cancelled_orders,
        "recent_orders_7_days": recent_orders,
        "average_delivery_time_hours": round(avg_delivery_time, 2),
        "completion_rate": round((completed_orders / total_orders * 100), 2) if total_orders > 0 else 0
    }

@router.get("/revenue", response_model=Dict[str, Any])
def get_revenue_analytics(
    start_date: Optional[datetime] = Query(None, description="Start date for revenue analytics"),
    end_date: Optional[datetime] = Query(None, description="End date for revenue analytics"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get revenue analytics (Admin only)"""
    
    # Set default date range if not provided
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
    
    # Total revenue
    total_revenue = db.query(func.sum(Order.total_amount)).filter(
        and_(Order.created_at >= start_date, Order.created_at <= end_date)
    ).scalar() or 0
    
    # Revenue by status
    revenue_by_status = db.query(
        Order.status,
        func.sum(Order.total_amount).label('revenue')
    ).filter(
        and_(Order.created_at >= start_date, Order.created_at <= end_date)
    ).group_by(Order.status).all()
    
    # Revenue by cargo type
    revenue_by_cargo_type = db.query(
        Order.cargo_type,
        func.sum(Order.total_amount).label('revenue')
    ).filter(
        and_(Order.created_at >= start_date, Order.created_at <= end_date)
    ).group_by(Order.cargo_type).all()
    
    # Daily revenue trend (last 30 days)
    daily_revenue = db.query(
        func.date(Order.created_at).label('date'),
        func.sum(Order.total_amount).label('revenue')
    ).filter(
        and_(Order.created_at >= start_date, Order.created_at <= end_date)
    ).group_by(func.date(Order.created_at)).order_by('date').all()
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "total_revenue": total_revenue,
        "revenue_by_status": [{
            "status": rev.status.value,
            "revenue": rev.revenue or 0
        } for rev in revenue_by_status],
        "revenue_by_cargo_type": [{
            "cargo_type": rev.cargo_type.value,
            "revenue": rev.revenue or 0
        } for rev in revenue_by_cargo_type],
        "daily_revenue_trend": [{
            "date": rev.date.isoformat(),
            "revenue": rev.revenue or 0
        } for rev in daily_revenue]
    }

@router.get("/routes/popular", response_model=List[Dict[str, Any]])
def get_popular_routes(
    limit: int = Query(10, ge=1, le=50, description="Number of popular routes to return"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get popular routes based on order frequency (Admin only)"""
    
    # Get popular pickup-drop location combinations
    popular_routes = db.query(
        Order.pickup_location,
        Order.drop_location,
        func.count(Order.id).label('order_count'),
        func.sum(Order.total_amount).label('total_revenue'),
        func.avg(Order.total_amount).label('avg_revenue')
    ).group_by(
        Order.pickup_location,
        Order.drop_location
    ).order_by(
        func.count(Order.id).desc()
    ).limit(limit).all()
    
    return [{
        "pickup_location": route.pickup_location,
        "drop_location": route.drop_location,
        "order_count": route.order_count,
        "total_revenue": route.total_revenue or 0,
        "average_revenue": round(route.avg_revenue or 0, 2)
    } for route in popular_routes]

@router.get("/{order_id}", response_model=OrderSchema)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific order by ID"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has access to this order
    # Fix: Use database query for checking customer access
    if current_user.role.value != "admin":
        customer_order = db.query(Order).filter(
            Order.id == order_id,
            Order.customer_id == current_user.id
        ).first()
        
        if not customer_order:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    return order

@router.put("/{order_id}/assign", response_model=OrderSchema)
def assign_order(
    order_id: int,
    assignment: OrderAssignment,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Assign a vehicle and driver to an order (Admin only)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Validate that order status is PENDING using database query
    pending_order = db.query(Order).filter(
        Order.id == order_id,
        Order.status == OrderStatus.PENDING
    ).first()
    
    if not pending_order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order cannot be assigned in current status"
        )
    
    # Validate that vehicle exists
    vehicle = db.query(Vehicle).filter(Vehicle.id == assignment.vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with ID {assignment.vehicle_id} not found"
        )
    
    # Validate that driver exists
    driver = db.query(Driver).filter(Driver.id == assignment.driver_id).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Driver with ID {assignment.driver_id} not found"
        )
    
    # Update order using setattr for SQLAlchemy 2.0 compatibility
    setattr(order, 'vehicle_id', assignment.vehicle_id)
    setattr(order, 'driver_id', assignment.driver_id)
    setattr(order, 'status', OrderStatus.ASSIGNED)
    
    db.commit()
    db.refresh(order)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="assign_order",
        resource_type="order",
        resource_id=order.id,
        details={"vehicle_id": assignment.vehicle_id, "driver_id": assignment.driver_id}
    )
    db.add(log)
    db.commit()
    
    return order

@router.put("/{order_id}/status", response_model=OrderSchema)
def update_order_status(
    order_id: int,
    status_update: OrderStatus,
    current_user: User = Depends(require_driver_or_admin),
    db: Session = Depends(get_db)
):
    """Update order status (Driver or Admin only)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Drivers can only update orders assigned to them
    # Fix: Use database query for checking driver access
    if current_user.role.value == "driver":
        driver_order = db.query(Order).filter(
            Order.id == order_id,
            Order.driver_id == current_user.driver_profile.id
        ).first()
        
        if not driver_order:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    setattr(order, 'status', status_update.value)  # Use the string value directly
    
    # Set actual delivery time if completing
    if status_update == OrderStatus.COMPLETED:
        setattr(order, 'actual_delivery_time', datetime.utcnow())
    
    db.commit()
    db.refresh(order)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="update_order_status",
        resource_type="order",
        resource_id=order.id,
        details={"new_status": status_update.value}
    )
    db.add(log)
    db.commit()
    
    return order

@router.put("/{order_id}", response_model=OrderSchema)
def update_order(
    order_id: int,
    order_update: OrderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update order information"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has access to this order
    # Fix: Use database query for checking customer access
    if current_user.role.value != "admin":
        customer_order = db.query(Order).filter(
            Order.id == order_id,
            Order.customer_id == current_user.id
        ).first()
        
        if not customer_order:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    # Update order fields
    update_data = order_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        # Handle enum fields explicitly
        if field == 'cargo_type' and hasattr(value, 'value'):
            setattr(order, field, value.value)
        elif field == 'status' and hasattr(value, 'value'):
            setattr(order, field, value.value)
        else:
            setattr(order, field, value)
    
    setattr(order, 'updated_at', datetime.utcnow())
    db.commit()
    db.refresh(order)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="update_order",
        resource_type="order",
        resource_id=order.id,
        details={"updated_fields": list(update_data.keys())}
    )
    db.add(log)
    db.commit()
    
    return order

@router.delete("/{order_id}", response_model=dict)
def delete_order(
    order_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete order (Admin only)"""
    # Check if order exists
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if order can be deleted (only pending or cancelled orders) using database query
    deletable_order = db.query(Order).filter(
        Order.id == order_id,
        Order.status.in_([OrderStatus.PENDING, OrderStatus.CANCELLED])
    ).first()
    
    if not deletable_order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending or cancelled orders can be deleted"
        )
    
    # Log the action before deletion
    log = Log(
        user_id=current_user.id,
        action="delete_order",
        resource_type="order",
        resource_id=order.id,
        details={"order_id": order.id, "status": order.status.value}
    )
    db.add(log)
    
    db.delete(order)
    db.commit()
    
    return {"message": "Order deleted successfully"}

@router.put("/{order_id}/approve", response_model=OrderSchema)
def approve_order(
    order_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Approve pending order (Admin only)"""
    # Validate that order exists and status is PENDING using database query
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.status == OrderStatus.PENDING
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found or not in pending status"
        )
    
    setattr(order, 'status', OrderStatus.ASSIGNED)
    setattr(order, 'updated_at', datetime.utcnow())
    db.commit()
    db.refresh(order)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="approve_order",
        resource_type="order",
        resource_id=order.id,
        details={"order_id": order.id}
    )
    db.add(log)
    db.commit()
    
    return order

@router.put("/{order_id}/reject", response_model=OrderSchema)
def reject_order(
    order_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Reject pending order (Admin only)"""
    # Validate that order exists and status is PENDING using database query
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.status == OrderStatus.PENDING
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found or not in pending status"
        )
    
    setattr(order, 'status', OrderStatus.CANCELLED)
    setattr(order, 'updated_at', datetime.utcnow())
    db.commit()
    db.refresh(order)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="reject_order",
        resource_type="order",
        resource_id=order.id,
        details={"order_id": order.id}
    )
    db.add(log)
    db.commit()
    
    return order

@router.put("/{order_id}/cancel", response_model=OrderSchema)
def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has access to this order
    # Fix: Use database query for checking customer access
    if current_user.role.value != "admin":
        customer_order = db.query(Order).filter(
            Order.id == order_id,
            Order.customer_id == current_user.id
        ).first()
        
        if not customer_order:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    # Only certain statuses can be cancelled - check using database query
    cancellable_order = db.query(Order).filter(
        Order.id == order_id,
        Order.status.notin_([OrderStatus.COMPLETED, OrderStatus.CANCELLED])
    ).first()
    
    if not cancellable_order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed or already cancelled orders cannot be cancelled"
        )
    
    setattr(order, 'status', OrderStatus.CANCELLED)
    setattr(order, 'updated_at', datetime.utcnow())
    db.commit()
    db.refresh(order)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="cancel_order",
        resource_type="order",
        resource_id=order.id,
        details={"order_id": order.id}
    )
    db.add(log)
    db.commit()
    
    return order

@router.put("/{order_id}/complete", response_model=OrderSchema)
def complete_order(
    order_id: int,
    current_user: User = Depends(require_driver_or_admin),
    db: Session = Depends(get_db)
):
    """Mark order as completed"""
    # Check if order exists
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Drivers can only complete orders assigned to them
    # Fix: Use database query for checking driver access
    if current_user.role.value == "driver":
        driver_order = db.query(Order).filter(
            Order.id == order_id,
            Order.driver_id == current_user.driver_profile.id
        ).first()
        
        if not driver_order:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    # Only in-progress orders can be completed - check using database query
    in_progress_order = db.query(Order).filter(
        Order.id == order_id,
        Order.status == OrderStatus.IN_PROGRESS
    ).first()
    
    if not in_progress_order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only in-progress orders can be completed"
        )
    
    setattr(order, 'status', OrderStatus.COMPLETED)
    setattr(order, 'actual_delivery_time', datetime.utcnow())
    setattr(order, 'updated_at', datetime.utcnow())
    db.commit()
    db.refresh(order)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="complete_order",
        resource_type="order",
        resource_id=order.id,
        details={"order_id": order.id, "completion_time": order.actual_delivery_time.isoformat()}
    )
    db.add(log)
    db.commit()
    
    return order

