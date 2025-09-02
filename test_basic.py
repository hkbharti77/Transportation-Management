#!/usr/bin/env python3
"""
Basic test to verify the application structure
"""

def test_imports():
    """Test that all modules can be imported"""
    try:
        from app.core.config import settings
        from app.core.database import Base, engine
        from app.models.user import User, UserRole
        from app.models.vehicle import Vehicle, VehicleType
        from app.models.order import Order, OrderStatus
        from app.schemas.user import UserCreate
        from app.routers.auth import router as auth_router
        print("✅ All imports successful!")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_config():
    """Test configuration loading"""
    try:
        from app.core.config import settings
        assert hasattr(settings, 'database_url')
        assert hasattr(settings, 'secret_key')
        print("✅ Configuration loaded successfully!")
        return True
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False

def test_models():
    """Test database models"""
    try:
        from app.models.user import User
        from app.models.vehicle import Vehicle
        from app.models.order import Order
        
        # Check if models have required attributes
        assert hasattr(User, '__tablename__')
        assert hasattr(Vehicle, '__tablename__')
        assert hasattr(Order, '__tablename__')
        
        print("✅ Database models are properly defined!")
        return True
    except Exception as e:
        print(f"❌ Model error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Running basic tests...")
    print("=" * 40)
    
    tests = [
        test_imports,
        test_config,
        test_models
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 40)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The application is ready to run.")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
