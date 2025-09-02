# API routers
from .auth import router as auth_router
from .users import router as users_router
from .fleet import router as fleet_router
from .trips import router as trips_router
from .orders import router as orders_router
from .services import router as services_router
from .analytics import router as analytics_router
from .bookings import router as bookings_router
from .dispatches import router as dispatches_router

from .payment_enhanced import router as payment_enhanced_router
from .public_service import router as public_service_router
from .tracking import router as tracking_router
from .notifications import router as notifications_router
from .admin_dashboard import router as admin_dashboard_router
