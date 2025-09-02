# Pydantic schemas for request/response validation
from .user import User, UserCreate, UserUpdate, UserLogin, Token, TokenData, UserProfileUpdate
from .booking import (
    BookingBase, BookingCreate, BookingUpdate, BookingResponse, 
    BookingStatusUpdate, BookingListResponse
)
from .dispatch import (
    DispatchBase, DispatchCreate, DispatchUpdate, DispatchResponse,
    DispatchStatusUpdate, DispatchListResponse
)
from .fleet import Truck, TruckCreate, TruckUpdate, Fleet, FleetCreate, FleetUpdate, Driver, DriverCreate, DriverUpdate
from .trip import Trip, TripCreate, TripUpdate
from .order import Order, OrderCreate, OrderUpdate
from .service import Service, ServiceCreate, ServiceUpdate
from .parts import PartsInventory, PartsInventoryCreate, PartsInventoryUpdate
from .route import Route, RouteCreate, RouteUpdate
from .public_service import (
    PublicServiceBase, PublicServiceCreate, PublicServiceUpdate, PublicServiceResponse,
    TicketBase, TicketCreate, TicketUpdate, TicketResponse,
    SeatAvailability, ServiceAvailability, ServiceTimetable, ServiceTimetableResponse,
    PublicServiceFilter, TicketFilter, PublicServiceListResponse, TicketListResponse,
    TicketBookingRequest, TicketBookingResponse, ServiceStatistics,
    Stop, TimeSlot
)
from .payment_enhanced import (
    PaymentBase, PaymentCreate, PaymentUpdate, PaymentResponse,
    InvoiceBase, InvoiceCreate, InvoiceUpdate, InvoiceResponse,
    InvoiceItemBase, InvoiceItemCreate, InvoiceItemResponse,
    PaymentGatewayRequest, PaymentGatewayResponse,
    RefundRequest, RefundResponse,
    PaymentProcessRequest, PaymentProcessResponse,
    InvoiceGenerateRequest, InvoiceGenerateResponse,
    PaymentStatusUpdate, PaymentFilter, InvoiceFilter,
    PaymentListResponse, InvoiceListResponse,
    PaymentStatistics, InvoiceStatistics,
    PaymentWebhook, PDFGenerationRequest, PDFGenerationResponse
)
from .tracking import (
    LocationBase, LocationCreate, LocationUpdate, LocationResponse,
    TripLocationBase, TripLocationCreate, TripLocationResponse,
    GeofenceBase, GeofenceCreate, GeofenceUpdate, GeofenceResponse,
    GeofenceEventBase, GeofenceEventResponse,
    TruckLocationResponse, ETARequest, ETAResponse,
    TrackingFilter, LocationListResponse, TruckTrackingResponse,
    TrackingDashboardResponse, FleetStatusResponse
)
from .notification import (
    NotificationBase, NotificationCreate, NotificationUpdate, NotificationResponse,
    NotificationTemplateBase, NotificationTemplateCreate, NotificationTemplateUpdate, NotificationTemplateResponse,
    NotificationPreferenceBase, NotificationPreferenceCreate, NotificationPreferenceUpdate, NotificationPreferenceResponse,
    BroadcastMessageBase, BroadcastMessageCreate, BroadcastMessageUpdate, BroadcastMessageResponse,
    SendNotificationRequest, SendNotificationResponse, NotificationDeliveryStatus,
    NotificationFilter, NotificationListResponse, NotificationStatistics,
    TemplateRenderRequest, TemplateRenderResponse,
    BulkNotificationRequest, BulkNotificationResponse
)
from .admin_dashboard import (
    SystemHealthBase, SystemHealthResponse,
    AnalyticsSnapshotBase, AnalyticsSnapshotResponse,
    DashboardWidgetBase, DashboardWidgetCreate, DashboardWidgetUpdate, DashboardWidgetResponse,
    UserActivityBase, UserActivityResponse,
    SystemAlertBase, SystemAlertCreate, SystemAlertUpdate, SystemAlertResponse,
    PerformanceMetricBase, PerformanceMetricResponse,
    ReportRequest, ReportResponse,
    DashboardOverviewResponse, BookingAnalyticsResponse, TruckUtilizationResponse,
    DriverPerformanceResponse, RevenueReportResponse, MaintenanceOverviewResponse,
    UserAnalyticsResponse, BulkUserOperationRequest, BulkUserOperationResponse,
    SystemMetricsResponse, HealthCheckResponse,
    ExportRequest, ExportResponse, DashboardFilter, ChartDataResponse
)
