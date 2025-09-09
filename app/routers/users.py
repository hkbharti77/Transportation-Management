from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin, require_role
from app.core.security import get_password_hash, verify_password
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, User as UserSchema, UserUpdate, UserProfileUpdate
from app.models.log import Log
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[UserSchema])
def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get users with pagination and filtering (Admin only)"""
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/me", response_model=UserSchema)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.put("/me", response_model=UserSchema)
def update_current_user_profile(
    profile_update: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    # Update allowed fields
    if profile_update.name is not None:
        current_user.name = profile_update.name
    if profile_update.phone is not None:
        current_user.phone = profile_update.phone
    
    db.commit()
    db.refresh(current_user)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="update_profile",
        resource_type="user",
        resource_id=current_user.id,
        details={"updated_fields": list(profile_update.dict(exclude_unset=True).keys())}
    )
    db.add(log)
    db.commit()
    
    return current_user

@router.put("/me/password")
def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change current user password"""
    # Verify current password
    if not verify_password(current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.password_hash = get_password_hash(new_password)
    db.commit()
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="change_password",
        resource_type="user",
        resource_id=current_user.id,
        details={"password_changed": True}
    )
    db.add(log)
    db.commit()
    
    return {"message": "Password changed successfully"}

# Role-specific endpoints
@router.get("/drivers", response_model=List[UserSchema])
def get_drivers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all drivers"""
    query = db.query(User).filter(User.role == UserRole.DRIVER)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    drivers = query.offset(skip).limit(limit).all()
    
    # Convert to schema objects to avoid relationship serialization issues
    driver_schemas = []
    for driver in drivers:
        driver_data = {
            "id": driver.id,
            "name": driver.name,
            "email": driver.email,
            "phone": driver.phone,
            "role": driver.role,
            "is_active": driver.is_active,
            "created_at": driver.created_at,
            "updated_at": driver.updated_at
        }
        driver_schemas.append(UserSchema(**driver_data))
    
    return driver_schemas

@router.get("/customers", response_model=List[UserSchema])
def get_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all customers (Admin only)"""
    customers = db.query(User).filter(User.role == UserRole.CUSTOMER).offset(skip).limit(limit).all()
    
    # Convert to schema objects to avoid relationship serialization issues
    customer_schemas = []
    for customer in customers:
        customer_data = {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "role": customer.role,
            "is_active": customer.is_active,
            "created_at": customer.created_at,
            "updated_at": customer.updated_at
        }
        customer_schemas.append(UserSchema(**customer_data))
    
    return customer_schemas

@router.get("/transporters", response_model=List[UserSchema])
def get_transporters(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all transporters (Admin only)"""
    transporters = db.query(User).filter(User.role == UserRole.TRANSPORTER).offset(skip).limit(limit).all()
    
    # Convert to schema objects to avoid relationship serialization issues
    transporter_schemas = []
    for transporter in transporters:
        transporter_data = {
            "id": transporter.id,
            "name": transporter.name,
            "email": transporter.email,
            "phone": transporter.phone,
            "role": transporter.role,
            "is_active": transporter.is_active,
            "created_at": transporter.created_at,
            "updated_at": transporter.updated_at
        }
        transporter_schemas.append(UserSchema(**transporter_data))
    
    return transporter_schemas

@router.get("/{user_id}", response_model=UserSchema)
def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user by ID (Admin or own profile)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check access permissions
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return user

@router.put("/{user_id}", response_model=UserSchema)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update user (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="update_user",
        resource_type="user",
        resource_id=user_id,
        details={"updated_fields": list(user_update.dict(exclude_unset=True).keys())}
    )
    db.add(log)
    db.commit()
    
    return user

@router.put("/{user_id}/activate")
def activate_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Activate/deactivate user (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = not user.is_active
    status_text = "activated" if user.is_active else "deactivated"
    
    db.commit()
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="toggle_user_status",
        resource_type="user",
        resource_id=user_id,
        details={"new_status": status_text}
    )
    db.add(log)
    db.commit()
    
    return {"message": f"User {status_text} successfully"}

@router.put("/{user_id}/role")
def change_user_role(
    user_id: int,
    new_role: UserRole,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Change user role (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    old_role = user.role
    user.role = new_role
    
    db.commit()
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="change_user_role",
        resource_type="user",
        resource_id=user_id,
        details={"old_role": old_role.value, "new_role": new_role.value}
    )
    db.add(log)
    db.commit()
    
    return {"message": f"User role changed from {old_role.value} to {new_role.value}"}

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete user (Admin only)"""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Soft delete - just deactivate
    user.is_active = False
    db.commit()
    
    # Log the action
    log = Log(
        user_id=current_user.id,
        action="delete_user",
        resource_type="user",
        resource_id=user_id,
        details={"deleted_user_email": user.email}
    )
    db.add(log)
    db.commit()
    
    return {"message": "User deactivated successfully"}
