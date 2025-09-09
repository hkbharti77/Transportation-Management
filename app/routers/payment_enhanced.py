from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import date
import json

from app.core.database import get_db
from app.services.payment_enhanced_service import PaymentEnhancedService
from app.schemas.payment_enhanced import (
    PaymentCreate, PaymentUpdate, PaymentResponse, PaymentListResponse,
    InvoiceCreate, InvoiceUpdate, InvoiceResponse, InvoiceListResponse,
    RefundRequest, RefundResponse, PaymentProcessRequest, PaymentProcessResponse,
    InvoiceGenerateRequest, InvoiceGenerateResponse, PDFGenerationRequest, PDFGenerationResponse,
    PaymentFilter, InvoiceFilter, PaymentStatistics, InvoiceStatistics,
    PaymentWebhook
)
from app.models.payment import PaymentMethod, PaymentStatus, InvoiceStatus

router = APIRouter(prefix="/payments", tags=["payments-enhanced"])

# Payment CRUD endpoints
@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new payment record.
    
    The system will:
    - Validate user exists
    - Generate unique transaction ID
    - Set initial status to pending
    """
    service = PaymentEnhancedService(db)
    return service.create_payment(payment_data)

@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db)
):
    """Get payment details by ID"""
    service = PaymentEnhancedService(db)
    payment = service.get_payment(payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    return payment

@router.get("/user/{user_id}", response_model=List[PaymentResponse])
def get_user_payments(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all payments for a specific user"""
    service = PaymentEnhancedService(db)
    return service.get_user_payments(user_id, skip=skip, limit=limit)

@router.get("/booking/{booking_id}", response_model=List[PaymentResponse])
def get_booking_payments(
    booking_id: int,
    db: Session = Depends(get_db)
):
    """Get all payments for a specific booking"""
    service = PaymentEnhancedService(db)
    return service.get_booking_payments(booking_id)

@router.put("/{payment_id}", response_model=PaymentResponse)
def update_payment(
    payment_id: int,
    payment_update: PaymentUpdate,
    db: Session = Depends(get_db)
):
    """Update payment details"""
    service = PaymentEnhancedService(db)
    return service.update_payment(payment_id, payment_update)

# Payment gateway integration endpoints
@router.post("/{payment_id}/process", response_model=PaymentProcessResponse)
def process_payment(
    payment_id: int,
    process_request: PaymentProcessRequest,
    db: Session = Depends(get_db)
):
    """
    Process payment through payment gateway.
    
    The system will:
    - Validate payment exists and is in pending status
    - Create gateway request with user details
    - Process through payment gateway
    - Update payment status based on gateway response
    """
    service = PaymentEnhancedService(db)
    return service.process_payment(payment_id, process_request.gateway_data)

@router.post("/webhook")
def process_webhook(
    webhook_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Process webhook from payment gateway.
    
    This endpoint receives payment status updates from the payment gateway.
    """
    service = PaymentEnhancedService(db)
    return service.process_webhook(webhook_data)

# Refund processing endpoints
@router.post("/refund", response_model=RefundResponse)
def process_refund(
    refund_request: RefundRequest,
    db: Session = Depends(get_db)
):
    """
    Process refund for a payment.
    
    The system will:
    - Validate payment exists and is in paid status
    - Check refund amount doesn't exceed payment amount
    - Process refund through payment gateway
    - Update payment status to refunded
    """
    service = PaymentEnhancedService(db)
    return service.process_refund(refund_request)

# Invoice management endpoints
@router.post("/invoices/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(
    invoice_data: InvoiceCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new invoice.
    
    The system will:
    - Validate user exists
    - Generate unique invoice number
    - Calculate totals from invoice items
    - Create invoice items
    """
    service = PaymentEnhancedService(db)
    return service.create_invoice(invoice_data)

@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    """Get invoice details by ID"""
    service = PaymentEnhancedService(db)
    invoice = service.get_invoice(invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    return invoice

@router.get("/invoices/user/{user_id}", response_model=List[InvoiceResponse])
def get_user_invoices(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all invoices for a specific user"""
    service = PaymentEnhancedService(db)
    return service.get_user_invoices(user_id, skip=skip, limit=limit)

@router.put("/invoices/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: int,
    invoice_update: InvoiceUpdate,
    db: Session = Depends(get_db)
):
    """Update invoice details"""
    service = PaymentEnhancedService(db)
    return service.update_invoice(invoice_id, invoice_update)

# Invoice generation endpoints
@router.post("/invoices/generate", response_model=InvoiceGenerateResponse)
def generate_invoice(
    request: InvoiceGenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Generate invoice from booking or other entities.
    
    The system will:
    - Create invoice items from request
    - Calculate totals and tax
    - Generate invoice with unique number
    """
    service = PaymentEnhancedService(db)
    invoice = service.generate_invoice_from_booking(request)
    return InvoiceGenerateResponse(
        invoice=invoice,
        pdf_url=None,  # Will be generated separately
        message="Invoice generated successfully"
    )

@router.post("/invoices/{invoice_id}/pdf", response_model=PDFGenerationResponse)
def generate_invoice_pdf(
    invoice_id: int,
    pdf_request: PDFGenerationRequest,
    db: Session = Depends(get_db)
):
    """
    Generate PDF for invoice.
    
    The system will:
    - Generate HTML invoice
    - Convert to PDF (or save as HTML for demo)
    - Update invoice with PDF path
    """
    service = PaymentEnhancedService(db)
    pdf_path = service.generate_invoice_pdf(invoice_id, pdf_request.template)
    return PDFGenerationResponse(
        success=True,
        pdf_url=f"/static/invoices/{pdf_path.split('/')[-1]}",
        file_size=None,
        message="PDF generated successfully"
    )

# Statistics and reporting endpoints
@router.get("/statistics/payments", response_model=PaymentStatistics)
def get_payment_statistics(
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    db: Session = Depends(get_db)
):
    """Get payment statistics"""
    service = PaymentEnhancedService(db)
    stats = service.get_payment_statistics(user_id)
    return PaymentStatistics(**stats)

@router.get("/statistics/invoices", response_model=InvoiceStatistics)
def get_invoice_statistics(
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    db: Session = Depends(get_db)
):
    """Get invoice statistics"""
    service = PaymentEnhancedService(db)
    stats = service.get_invoice_statistics(user_id)
    return InvoiceStatistics(**stats)

# Search and filter endpoints
@router.get("/search/", response_model=List[PaymentResponse])
def search_payments(
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    booking_id: Optional[int] = Query(None, description="Filter by booking ID"),
    status: Optional[PaymentStatus] = Query(None, description="Filter by payment status"),
    method: Optional[PaymentMethod] = Query(None, description="Filter by payment method"),
    start_date: Optional[date] = Query(None, description="Start date for filtering"),
    end_date: Optional[date] = Query(None, description="End date for filtering"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search and filter payments"""
    service = PaymentEnhancedService(db)
    # This would need to be implemented in the service layer for complex filtering
    if user_id:
        return service.get_user_payments(user_id, skip=skip, limit=limit)
    return []

@router.get("/invoices/search/", response_model=List[InvoiceResponse])
def search_invoices(
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    status: Optional[InvoiceStatus] = Query(None, description="Filter by invoice status"),
    start_date: Optional[date] = Query(None, description="Start date for filtering"),
    end_date: Optional[date] = Query(None, description="End date for filtering"),
    overdue: Optional[bool] = Query(None, description="Filter overdue invoices"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search and filter invoices"""
    service = PaymentEnhancedService(db)
    # This would need to be implemented in the service layer for complex filtering
    if user_id:
        return service.get_user_invoices(user_id, skip=skip, limit=limit)
    return []

# Payment status management endpoints
@router.put("/{payment_id}/status")
def update_payment_status(
    payment_id: int,
    status_update: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Update payment status manually"""
    service = PaymentEnhancedService(db)
    payment_update = PaymentUpdate(
        status=status_update.get("status"),
        gateway_response=json.dumps(status_update.get("gateway_response", {}))
    )
    return service.update_payment(payment_id, payment_update)

# Invoice status management endpoints
@router.put("/invoices/{invoice_id}/status")
def update_invoice_status(
    invoice_id: int,
    status_update: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Update invoice status"""
    service = PaymentEnhancedService(db)
    invoice_update = InvoiceUpdate(status=status_update.get("status"))
    return service.update_invoice(invoice_id, invoice_update)

# Payment methods endpoints
@router.get("/methods/", response_model=List[str])
def get_payment_methods():
    """Get available payment methods"""
    return [method.value for method in PaymentMethod]

# Payment statuses endpoints
@router.get("/statuses/", response_model=List[str])
def get_payment_statuses():
    """Get available payment statuses"""
    return [status.value for status in PaymentStatus]

# Invoice statuses endpoints
@router.get("/invoices/statuses/", response_model=List[str])
def get_invoice_statuses():
    """Get available invoice statuses"""
    return [status.value for status in InvoiceStatus]

# Bulk operations endpoints
@router.post("/bulk/create", response_model=List[PaymentResponse])
def create_bulk_payments(
    payments_data: List[PaymentCreate],
    db: Session = Depends(get_db)
):
    """Create multiple payments at once"""
    service = PaymentEnhancedService(db)
    payments = []
    for payment_data in payments_data:
        payment = service.create_payment(payment_data)
        payments.append(payment)
    return payments

@router.post("/invoices/bulk/create", response_model=List[InvoiceResponse])
def create_bulk_invoices(
    invoices_data: List[InvoiceCreate],
    db: Session = Depends(get_db)
):
    """Create multiple invoices at once"""
    service = PaymentEnhancedService(db)
    invoices = []
    for invoice_data in invoices_data:
        invoice = service.create_invoice(invoice_data)
        invoices.append(invoice)
    return invoices

# Export endpoints
@router.get("/export/payments")
def export_payments(
    format: str = Query("json", description="Export format (json, csv)"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    start_date: Optional[date] = Query(None, description="Start date"),
    end_date: Optional[date] = Query(None, description="End date"),
    db: Session = Depends(get_db)
):
    """Export payments data"""
    service = PaymentEnhancedService(db)
    if user_id:
        payments = service.get_user_payments(user_id, skip=0, limit=1000)
    else:
        payments = []
    
    if format.lower() == "csv":
        # Generate CSV format
        csv_data = "payment_id,user_id,amount,method,status,created_at\n"
        for payment in payments:
            csv_data += f"{payment.payment_id},{payment.user_id},{payment.amount},{payment.method.value},{payment.status.value},{payment.created_at}\n"
        return {"data": csv_data, "format": "csv"}
    else:
        # Return JSON format
        return {"data": payments, "format": "json"}

@router.get("/export/invoices")
def export_invoices(
    format: str = Query("json", description="Export format (json, csv)"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    start_date: Optional[date] = Query(None, description="Start date"),
    end_date: Optional[date] = Query(None, description="End date"),
    db: Session = Depends(get_db)
):
    """Export invoices data"""
    service = PaymentEnhancedService(db)
    if user_id:
        invoices = service.get_user_invoices(user_id, skip=0, limit=1000)
    else:
        invoices = []
    
    if format.lower() == "csv":
        # Generate CSV format
        csv_data = "invoice_id,user_id,invoice_number,total_amount,status,created_at\n"
        for invoice in invoices:
            csv_data += f"{invoice.invoice_id},{invoice.user_id},{invoice.invoice_number},{invoice.total_amount},{invoice.status.value},{invoice.created_at}\n"
        return {"data": csv_data, "format": "csv"}
    else:
        # Return JSON format
        return {"data": invoices, "format": "json"}

# Health check endpoint
@router.get("/health")
def payment_health_check():
    """Health check for payment system"""
    return {
        "status": "healthy",
        "service": "payment-enhanced",
        "timestamp": "2024-12-25T00:00:00Z"
    }
