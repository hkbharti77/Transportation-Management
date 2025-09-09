from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from app.models.payment import PaymentMethod, PaymentStatus, InvoiceStatus

# Payment Gateway schemas
class PaymentGatewayRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Payment amount")
    currency: str = Field(default="USD", description="Payment currency")
    payment_method: PaymentMethod = Field(..., description="Payment method")
    customer_email: str = Field(..., description="Customer email")
    customer_name: str = Field(..., description="Customer name")
    description: str = Field(..., description="Payment description")
    reference_id: str = Field(..., description="Reference ID for tracking")

    @field_validator('payment_method', mode='before')
    def convert_payment_method_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class PaymentGatewayResponse(BaseModel):
    success: bool = Field(..., description="Payment success status")
    transaction_id: str = Field(..., description="Gateway transaction ID")
    gateway_reference: str = Field(..., description="Gateway reference number")
    status: str = Field(..., description="Gateway status")
    message: str = Field(..., description="Gateway response message")
    redirect_url: Optional[str] = Field(None, description="Redirect URL for payment")
    payment_data: Optional[Dict[str, Any]] = Field(None, description="Additional payment data")

# Payment schemas
class PaymentBase(BaseModel):
    amount: float = Field(..., gt=0, description="Payment amount")
    method: PaymentMethod = Field(..., description="Payment method")
    booking_id: Optional[int] = Field(None, description="Associated booking ID")
    order_id: Optional[int] = Field(None, description="Associated order ID")
    trip_id: Optional[int] = Field(None, description="Associated trip ID")

    @field_validator('method', mode='before')
    def convert_method_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class PaymentCreate(PaymentBase):
    user_id: int = Field(..., description="User ID")
    invoice_id: Optional[int] = Field(None, description="Associated invoice ID")
    gateway_reference: Optional[str] = Field(None, description="Payment gateway reference")

class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = Field(None, description="Payment status")
    transaction_id: Optional[str] = Field(None, description="Transaction ID")
    gateway_reference: Optional[str] = Field(None, description="Gateway reference")
    payment_time: Optional[datetime] = Field(None, description="Payment time")
    gateway_response: Optional[str] = Field(None, description="Gateway response")

    @field_validator('status', mode='before')
    def convert_status_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class PaymentResponse(PaymentBase):
    payment_id: int
    user_id: int
    invoice_id: Optional[int] = None
    status: PaymentStatus
    transaction_id: Optional[str] = None
    gateway_reference: Optional[str] = None
    payment_time: Optional[datetime] = None
    refund_time: Optional[datetime] = None
    refund_amount: Optional[float] = None
    refund_reason: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Invoice Item schemas
class InvoiceItemBase(BaseModel):
    description: str = Field(..., description="Item description")
    quantity: int = Field(..., gt=0, description="Item quantity")
    unit_price: float = Field(..., gt=0, description="Unit price")
    tax_rate: float = Field(default=0.0, ge=0, description="Tax rate percentage")

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItemResponse(InvoiceItemBase):
    item_id: int
    invoice_id: int
    total_price: float
    tax_amount: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Invoice schemas
class InvoiceBase(BaseModel):
    total_amount: float = Field(..., gt=0, description="Total invoice amount")
    subtotal: float = Field(..., gt=0, description="Subtotal amount")
    tax_amount: float = Field(default=0.0, ge=0, description="Tax amount")
    discount_amount: float = Field(default=0.0, ge=0, description="Discount amount")
    currency: str = Field(default="USD", description="Currency code")
    booking_id: Optional[int] = Field(None, description="Associated booking ID")
    order_id: Optional[int] = Field(None, description="Associated order ID")
    trip_id: Optional[int] = Field(None, description="Associated trip ID")

class InvoiceCreate(InvoiceBase):
    user_id: int = Field(..., description="User ID")
    due_date: Optional[datetime] = Field(None, description="Invoice due date")
    notes: Optional[str] = Field(None, description="Invoice notes")
    billing_address: Optional[str] = Field(None, description="Billing address")
    shipping_address: Optional[str] = Field(None, description="Shipping address")
    invoice_items: List[InvoiceItemCreate] = Field(..., description="Invoice items")

class InvoiceUpdate(BaseModel):
    status: Optional[InvoiceStatus] = Field(None, description="Invoice status")
    due_date: Optional[datetime] = Field(None, description="Due date")
    paid_date: Optional[datetime] = Field(None, description="Paid date")
    notes: Optional[str] = Field(None, description="Invoice notes")
    billing_address: Optional[str] = Field(None, description="Billing address")
    shipping_address: Optional[str] = Field(None, description="Shipping address")

    @field_validator('status', mode='before')
    def convert_status_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class InvoiceResponse(InvoiceBase):
    invoice_id: int
    user_id: int
    invoice_number: str
    status: InvoiceStatus
    due_date: Optional[datetime] = None
    paid_date: Optional[datetime] = None
    pdf_path: Optional[str] = None
    notes: Optional[str] = None
    billing_address: Optional[str] = None
    shipping_address: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    invoice_items: List[InvoiceItemResponse] = []
    
    class Config:
        from_attributes = True

# Refund schemas
class RefundRequest(BaseModel):
    payment_id: int = Field(..., description="Payment ID to refund")
    refund_amount: float = Field(..., gt=0, description="Refund amount")
    refund_reason: str = Field(..., description="Reason for refund")
    partial_refund: bool = Field(default=False, description="Is this a partial refund")

class RefundResponse(BaseModel):
    refund_id: str = Field(..., description="Refund ID")
    payment_id: int = Field(..., description="Original payment ID")
    refund_amount: float = Field(..., description="Refund amount")
    refund_reason: str = Field(..., description="Refund reason")
    status: str = Field(..., description="Refund status")
    refund_time: datetime = Field(..., description="Refund time")
    gateway_reference: Optional[str] = Field(None, description="Gateway refund reference")

# Payment processing schemas
class PaymentProcessRequest(BaseModel):
    payment_id: int = Field(..., description="Payment ID to process")
    gateway_data: Optional[Dict[str, Any]] = Field(None, description="Gateway specific data")

class PaymentProcessResponse(BaseModel):
    success: bool = Field(..., description="Processing success")
    transaction_id: str = Field(..., description="Transaction ID")
    status: PaymentStatus = Field(..., description="Payment status")
    message: str = Field(..., description="Processing message")
    redirect_url: Optional[str] = Field(None, description="Redirect URL if needed")

    @field_validator('status', mode='before')
    def convert_status_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

# Invoice generation schemas
class InvoiceGenerateRequest(BaseModel):
    booking_id: Optional[int] = Field(None, description="Booking ID")
    order_id: Optional[int] = Field(None, description="Order ID")
    trip_id: Optional[int] = Field(None, description="Trip ID")
    user_id: int = Field(..., description="User ID")
    items: List[InvoiceItemCreate] = Field(..., description="Invoice items")
    tax_rate: float = Field(default=0.0, ge=0, description="Tax rate percentage")
    discount_amount: float = Field(default=0.0, ge=0, description="Discount amount")
    due_date: Optional[datetime] = Field(None, description="Due date")
    notes: Optional[str] = Field(None, description="Invoice notes")

class InvoiceGenerateResponse(BaseModel):
    invoice: InvoiceResponse = Field(..., description="Generated invoice")
    pdf_url: Optional[str] = Field(None, description="PDF download URL")
    message: str = Field(..., description="Generation message")

# Payment status update schemas
class PaymentStatusUpdate(BaseModel):
    payment_id: int = Field(..., description="Payment ID")
    status: PaymentStatus = Field(..., description="New status")
    gateway_response: Optional[str] = Field(None, description="Gateway response")

    @field_validator('status', mode='before')
    def convert_status_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

# Filter and search schemas
class PaymentFilter(BaseModel):
    user_id: Optional[int] = Field(None, description="Filter by user ID")
    booking_id: Optional[int] = Field(None, description="Filter by booking ID")
    status: Optional[PaymentStatus] = Field(None, description="Filter by payment status")
    method: Optional[PaymentMethod] = Field(None, description="Filter by payment method")
    start_date: Optional[date] = Field(None, description="Start date for filtering")
    end_date: Optional[date] = Field(None, description="End date for filtering")

    @field_validator('status', mode='before')
    def convert_status_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator('method', mode='before')
    def convert_method_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class InvoiceFilter(BaseModel):
    user_id: Optional[int] = Field(None, description="Filter by user ID")
    status: Optional[InvoiceStatus] = Field(None, description="Filter by invoice status")
    start_date: Optional[date] = Field(None, description="Start date for filtering")
    end_date: Optional[date] = Field(None, description="End date for filtering")
    overdue: Optional[bool] = Field(None, description="Filter overdue invoices")

    @field_validator('status', mode='before')
    def convert_status_to_lowercase(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

# Response schemas
class PaymentListResponse(BaseModel):
    payments: List[PaymentResponse]
    total: int
    page: int
    size: int

class InvoiceListResponse(BaseModel):
    invoices: List[InvoiceResponse]
    total: int
    page: int
    size: int

# Payment statistics
class PaymentStatistics(BaseModel):
    total_payments: int = Field(..., description="Total number of payments")
    total_amount: float = Field(..., description="Total payment amount")
    successful_payments: int = Field(..., description="Number of successful payments")
    failed_payments: int = Field(..., description="Number of failed payments")
    pending_payments: int = Field(..., description="Number of pending payments")
    refunded_amount: float = Field(..., description="Total refunded amount")
    average_payment: float = Field(..., description="Average payment amount")
    payment_methods_distribution: Dict[str, int] = Field(..., description="Payment methods distribution")

# Invoice statistics
class InvoiceStatistics(BaseModel):
    total_invoices: int = Field(..., description="Total number of invoices")
    total_amount: float = Field(..., description="Total invoice amount")
    paid_invoices: int = Field(..., description="Number of paid invoices")
    overdue_invoices: int = Field(..., description="Number of overdue invoices")
    pending_invoices: int = Field(..., description="Number of pending invoices")
    average_invoice: float = Field(..., description="Average invoice amount")
    total_tax_collected: float = Field(..., description="Total tax collected")

# Webhook schemas for payment gateway integration
class PaymentWebhook(BaseModel):
    event_type: str = Field(..., description="Webhook event type")
    payment_id: str = Field(..., description="Payment ID from gateway")
    status: str = Field(..., description="Payment status from gateway")
    amount: float = Field(..., description="Payment amount")
    currency: str = Field(..., description="Payment currency")
    timestamp: datetime = Field(..., description="Event timestamp")
    signature: str = Field(..., description="Webhook signature for verification")
    data: Dict[str, Any] = Field(..., description="Additional webhook data")

# PDF generation schemas
class PDFGenerationRequest(BaseModel):
    invoice_id: int = Field(..., description="Invoice ID to generate PDF for")
    template: Optional[str] = Field(default="default", description="PDF template to use")

class PDFGenerationResponse(BaseModel):
    success: bool = Field(..., description="PDF generation success")
    pdf_url: str = Field(..., description="PDF download URL")
    file_size: Optional[int] = Field(None, description="PDF file size in bytes")
    message: str = Field(..., description="Generation message")