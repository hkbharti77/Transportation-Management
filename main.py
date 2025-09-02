from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.core.config import settings
from app.routers import auth, orders, trips, services, analytics, users, fleet as fleet_router, bookings, dispatches, payment_enhanced, public_service as public_service_router, tracking as tracking_router, notifications as notifications_router, admin_dashboard
from app.models import user, vehicle, order, route, trip, trip_booking, payment, log, service, service_history, parts_inventory, parts_usage, maintenance_schedule, fleet as fleet_models, booking, dispatch, public_service, tracking as tracking_models, notification as notification_models, admin_dashboard as admin_models
from app.core.database import engine
import time

# Create database tables - use a single metadata to ensure proper foreign key relationships
from app.core.database import Base
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.project_name,
    version="1.0.0",
    description="Transportation Management System API",
    openapi_url=f"{settings.api_v1_str}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure this properly in production
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Include routers
app.include_router(auth.router, prefix=settings.api_v1_str)
app.include_router(users.router, prefix=settings.api_v1_str)
app.include_router(fleet_router.router, prefix=settings.api_v1_str)
app.include_router(orders.router, prefix=settings.api_v1_str)
app.include_router(trips.router, prefix=settings.api_v1_str)
app.include_router(services.router, prefix=settings.api_v1_str)
app.include_router(analytics.router, prefix=settings.api_v1_str)
app.include_router(bookings.router, prefix=settings.api_v1_str)
app.include_router(dispatches.router, prefix=settings.api_v1_str)
app.include_router(payment_enhanced.router, prefix=settings.api_v1_str)
app.include_router(public_service_router.router, prefix=settings.api_v1_str)
app.include_router(tracking_router.router, prefix=settings.api_v1_str)
app.include_router(notifications_router.router, prefix=settings.api_v1_str)
app.include_router(admin_dashboard.router, prefix=settings.api_v1_str)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Transportation Management System",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Transportation Management System...")
    print(f"📖 API Documentation: http://localhost:8000/docs")
    print(f"🔍 Alternative Docs: http://localhost:8000/redoc")
    print(f"🏥 Health Check: http://localhost:8000/health")
    print("=" * 50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info"
    )
