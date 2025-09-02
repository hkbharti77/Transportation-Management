from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin, require_driver_or_admin
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.schemas.order import OrderCreate, Order as OrderSchema, OrderUpdate, OrderAssignment
from app.models.log import Log
from datetime import datetime

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=OrderSchema)
def create_order(
    order: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new transport order"""
    db_order = Order(
        **order.dict(),
        customer_id=current_user.id
    )
    
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
    if current_user.role.value != "admin" and order.customer_id != current_user.id:
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
    
    if order.status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order cannot be assigned in current status"
        )
    
    # Update order
    order.vehicle_id = assignment.vehicle_id
    order.driver_id = assignment.driver_id
    order.status = OrderStatus.ASSIGNED
    
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
    if current_user.role.value == "driver" and order.driver_id != current_user.driver_profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    order.status = status_update
    
    # Set actual delivery time if completing
    if status_update == OrderStatus.COMPLETED:
        order.actual_delivery_time = datetime.utcnow()
    
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
