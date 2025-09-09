from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta
import uuid
import json
import os
from pathlib import Path

from app.models.payment import Payment, Invoice, InvoiceItem, PaymentMethod, PaymentStatus, InvoiceStatus
from app.models.user import User
from app.models.booking import Booking
from app.schemas.payment_enhanced import (
    PaymentCreate, PaymentUpdate, InvoiceCreate, InvoiceUpdate,
    PaymentGatewayRequest, PaymentGatewayResponse, RefundRequest,
    InvoiceGenerateRequest, PDFGenerationRequest
)
from fastapi import HTTPException, status
import requests

from app.core.config import settings

class PaymentGatewayService:
    """Payment gateway service with configurable settings"""
    
    def __init__(self):
        # Use environment variables or configuration for real deployment
        self.api_key = getattr(settings, 'PAYMENT_GATEWAY_API_KEY', "test_api_key_12345")
        self.secret_key = getattr(settings, 'PAYMENT_GATEWAY_SECRET_KEY', "test_secret_key_67890")
        self.base_url = getattr(settings, 'PAYMENT_GATEWAY_URL', "https://api.testgateway.com/v1")
        self.environment = getattr(settings, 'PAYMENT_GATEWAY_ENV', "sandbox")
    
    def create_payment(self, payment_request: PaymentGatewayRequest) -> PaymentGatewayResponse:
        """Create a payment request with the gateway"""
        # Generate realistic transaction IDs
        transaction_id = f"TXN_{uuid.uuid4().hex[:16].upper()}"
        gateway_reference = f"REF_{uuid.uuid4().hex[:12].upper()}"
        
        # In sandbox/test mode, simulate different payment scenarios
        if self.environment == "sandbox":
            # Simulate different payment method responses based on business logic
            if payment_request.payment_method == PaymentMethod.CASH:
                return PaymentGatewayResponse(
                    success=True,
                    transaction_id=transaction_id,
                    gateway_reference=gateway_reference,
                    status="completed",
                    message="Cash payment processed successfully",
                    redirect_url=None
                )
            elif payment_request.payment_method == PaymentMethod.UPI:
                return PaymentGatewayResponse(
                    success=True,
                    transaction_id=transaction_id,
                    gateway_reference=gateway_reference,
                    status="pending",
                    message="UPI payment initiated",
                    redirect_url=f"upi://pay?pa=merchant@upi&pn=Transportation&am={payment_request.amount}"
                )
            else:
                # For card payments, simulate redirect in sandbox
                return PaymentGatewayResponse(
                    success=True,
                    transaction_id=transaction_id,
                    gateway_reference=gateway_reference,
                    status="pending",
                    message="Payment gateway redirect required",
                    redirect_url=f"{self.base_url}/pay/{gateway_reference}"
                )
        else:
            # In production, make actual API call to payment gateway
            try:
                # This would be the actual gateway API integration
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "amount": payment_request.amount,
                    "currency": payment_request.currency,
                    "payment_method": payment_request.payment_method.value,
                    "customer_email": payment_request.customer_email,
                    "customer_name": payment_request.customer_name,
                    "description": payment_request.description,
                    "reference_id": payment_request.reference_id
                }
                
                # Note: In real implementation, make actual HTTP request
                # response = requests.post(f"{self.base_url}/payments", json=payload, headers=headers)
                
                # For now, return a realistic response structure
                return PaymentGatewayResponse(
                    success=True,
                    transaction_id=transaction_id,
                    gateway_reference=gateway_reference,
                    status="pending",
                    message="Payment initiated successfully",
                    redirect_url=f"{self.base_url}/pay/{gateway_reference}"
                )
            except Exception as e:
                return PaymentGatewayResponse(
                    success=False,
                    transaction_id=transaction_id,
                    gateway_reference=gateway_reference,
                    status="failed",
                    message=f"Payment gateway error: {str(e)}",
                    redirect_url=None
                )
    
    def process_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process webhook from payment gateway"""
        # Verify webhook signature for security
        signature = webhook_data.get("signature", "")
        if not self._verify_signature(webhook_data, signature):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature"
            )
        
        # Extract relevant data from webhook
        event_type = webhook_data.get("event_type", "")
        transaction_id = webhook_data.get("payment_id", "")
        payment_status = webhook_data.get("status", "")
        amount = webhook_data.get("amount", 0.0)
        gateway_reference = webhook_data.get("data", {}).get("gateway_reference", "")
        
        # Log webhook for audit purposes
        print(f"Processing webhook: {event_type} for transaction {transaction_id}")
        
        return {
            "success": True,
            "transaction_id": transaction_id,
            "status": payment_status,
            "amount": amount,
            "gateway_reference": gateway_reference,
            "event_type": event_type
        }
    
    def process_refund(self, payment_id: str, refund_amount: float) -> Dict[str, Any]:
        """Process refund through gateway"""
        refund_id = f"REF_{uuid.uuid4().hex[:16].upper()}"
        
        if self.environment == "sandbox":
            # Simulate refund processing in sandbox
            return {
                "success": True,
                "refund_id": refund_id,
                "payment_id": payment_id,
                "refund_amount": refund_amount,
                "status": "completed",
                "gateway_reference": f"REF_{uuid.uuid4().hex[:12].upper()}",
                "processed_at": datetime.utcnow().isoformat()
            }
        else:
            # In production, make actual API call for refund
            try:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "payment_id": payment_id,
                    "refund_amount": refund_amount,
                    "reason": "Customer requested refund"
                }
                
                # Note: In real implementation, make actual HTTP request
                # response = requests.post(f"{self.base_url}/refunds", json=payload, headers=headers)
                
                return {
                    "success": True,
                    "refund_id": refund_id,
                    "payment_id": payment_id,
                    "refund_amount": refund_amount,
                    "status": "processing",
                    "gateway_reference": f"REF_{uuid.uuid4().hex[:12].upper()}",
                    "processed_at": datetime.utcnow().isoformat()
                }
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Refund processing failed: {str(e)}"
                )
    
    def _verify_signature(self, data: Dict[str, Any], signature: str) -> bool:
        """Verify webhook signature for security"""
        if self.environment == "sandbox":
            # In sandbox, use simple signature validation
            return signature.startswith("sig_") and len(signature) > 10
        else:
            # In production, implement proper HMAC-SHA256 signature verification
            import hmac
            import hashlib
            
            try:
                # Create expected signature
                payload = json.dumps(data, sort_keys=True)
                expected_signature = hmac.new(
                    self.secret_key.encode('utf-8'),
                    payload.encode('utf-8'),
                    hashlib.sha256
                ).hexdigest()
                
                # Compare signatures securely
                return hmac.compare_digest(signature, f"sha256={expected_signature}")
            except Exception:
                return False

class PDFGeneratorService:
    """Service for generating PDF invoices with configurable settings"""
    
    def __init__(self):
        # Use configuration for paths
        self.templates_dir = Path(getattr(settings, 'INVOICE_TEMPLATES_DIR', 'templates/invoices'))
        self.output_dir = Path(getattr(settings, 'INVOICE_OUTPUT_DIR', 'static/invoices'))
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.company_name = getattr(settings, 'COMPANY_NAME', 'Transportation Services Inc.')
        self.company_address = getattr(settings, 'COMPANY_ADDRESS', '123 Business St, City, State 12345')
    
    def generate_invoice_pdf(self, invoice: Invoice, template: str = "default") -> str:
        """Generate PDF for invoice"""
        try:
            # Create a simple HTML invoice (in real implementation, use a proper PDF library)
            html_content = self._generate_invoice_html(invoice, template)
            
            # Generate unique filename
            filename = f"invoice_{invoice.invoice_number}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            file_path = self.output_dir / filename
            
            # Write HTML file (in real implementation, convert to PDF)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            return str(file_path)
        
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate PDF: {str(e)}"
            )
    
    def _generate_invoice_html(self, invoice: Invoice, template: str) -> str:
        """Generate HTML content for invoice with professional styling"""
        # Get invoice items for display
        items_html = ""
        for item in invoice.invoice_items:
            items_html += f"""
                    <tr>
                        <td>{item.description}</td>
                        <td style="text-align: center;">{item.quantity}</td>
                        <td style="text-align: right;">${item.unit_price:.2f}</td>
                        <td style="text-align: right;">{item.tax_rate:.1f}%</td>
                        <td style="text-align: right;">${item.tax_amount:.2f}</td>
                        <td style="text-align: right; font-weight: bold;">${item.total_price:.2f}</td>
                    </tr>
            """
        
        # Determine status color and message
        status_color = {
            InvoiceStatus.DRAFT: '#6c757d',
            InvoiceStatus.SENT: '#17a2b8',
            InvoiceStatus.PAID: '#28a745',
            InvoiceStatus.OVERDUE: '#dc3545',
            InvoiceStatus.CANCELLED: '#6c757d'
        }.get(invoice.status, '#6c757d')
        
        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice {invoice.invoice_number}</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 40px;
                    background-color: #f8f9fa;
                    color: #333;
                }}
                .invoice-container {{
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }}
                .header {{
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 3px solid #007bff;
                    padding-bottom: 30px;
                    margin-bottom: 30px;
                }}
                .company-info h1 {{
                    color: #007bff;
                    margin: 0;
                    font-size: 28px;
                }}
                .company-info p {{
                    margin: 5px 0;
                    color: #6c757d;
                }}
                .invoice-title {{
                    text-align: right;
                }}
                .invoice-title h2 {{
                    color: #333;
                    margin: 0;
                    font-size: 32px;
                }}
                .invoice-details {{
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin: 30px 0;
                }}
                .detail-section h3 {{
                    color: #007bff;
                    border-bottom: 1px solid #dee2e6;
                    padding-bottom: 10px;
                }}
                .detail-item {{
                    display: flex;
                    justify-content: space-between;
                    margin: 8px 0;
                }}
                .status {{
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 20px;
                    color: white;
                    background-color: {status_color};
                    font-weight: bold;
                    font-size: 12px;
                    text-transform: uppercase;
                }}
                .items-table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin: 30px 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }}
                .items-table th {{
                    background-color: #007bff;
                    color: white;
                    padding: 15px 12px;
                    text-align: left;
                    font-weight: 600;
                }}
                .items-table td {{
                    padding: 12px;
                    border-bottom: 1px solid #dee2e6;
                }}
                .items-table tr:hover {{
                    background-color: #f8f9fa;
                }}
                .totals {{
                    margin-left: auto;
                    width: 300px;
                    margin-top: 20px;
                }}
                .totals-table {{
                    width: 100%;
                    border-collapse: collapse;
                }}
                .totals-table td {{
                    padding: 8px 12px;
                    border-bottom: 1px solid #dee2e6;
                }}
                .totals-table .total-row {{
                    background-color: #007bff;
                    color: white;
                    font-weight: bold;
                    font-size: 18px;
                }}
                .footer {{
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #dee2e6;
                    color: #6c757d;
                    font-size: 14px;
                }}
                @media print {{
                    body {{ background: white; padding: 0; }}
                    .invoice-container {{ box-shadow: none; }}
                }}
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <div class="header">
                    <div class="company-info">
                        <h1>{self.company_name}</h1>
                        <p>{self.company_address}</p>
                        <p>Email: info@transportation.com | Phone: (555) 123-4567</p>
                    </div>
                    <div class="invoice-title">
                        <h2>INVOICE</h2>
                        <p><span class="status">{invoice.status.value.upper()}</span></p>
                    </div>
                </div>
                
                <div class="invoice-details">
                    <div class="detail-section">
                        <h3>Invoice Information</h3>
                        <div class="detail-item">
                            <span><strong>Invoice Number:</strong></span>
                            <span>{invoice.invoice_number}</span>
                        </div>
                        <div class="detail-item">
                            <span><strong>Issue Date:</strong></span>
                            <span>{invoice.created_at.strftime('%B %d, %Y')}</span>
                        </div>
                        <div class="detail-item">
                            <span><strong>Due Date:</strong></span>
                            <span>{invoice.due_date.strftime('%B %d, %Y') if invoice.due_date else 'N/A'}</span>
                        </div>
                        {f'''<div class="detail-item">
                            <span><strong>Paid Date:</strong></span>
                            <span>{invoice.paid_date.strftime('%B %d, %Y')}</span>
                        </div>''' if invoice.paid_date else ''}
                    </div>
                    
                    <div class="detail-section">
                        <h3>Billing Information</h3>
                        <div class="detail-item">
                            <span><strong>User ID:</strong></span>
                            <span>{invoice.user_id}</span>
                        </div>
                        {f'''<div class="detail-item">
                            <span><strong>Booking ID:</strong></span>
                            <span>{invoice.booking_id}</span>
                        </div>''' if invoice.booking_id else ''}
                        {f'''<div class="detail-item">
                            <span><strong>Order ID:</strong></span>
                            <span>{invoice.order_id}</span>
                        </div>''' if invoice.order_id else ''}
                        <div class="detail-item">
                            <span><strong>Currency:</strong></span>
                            <span>{invoice.currency}</span>
                        </div>
                    </div>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Unit Price</th>
                            <th style="text-align: right;">Tax Rate</th>
                            <th style="text-align: right;">Tax Amount</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                    </tbody>
                </table>
                
                <div class="totals">
                    <table class="totals-table">
                        <tr>
                            <td><strong>Subtotal:</strong></td>
                            <td style="text-align: right;">${invoice.subtotal:.2f}</td>
                        </tr>
                        <tr>
                            <td><strong>Tax Amount:</strong></td>
                            <td style="text-align: right;">${invoice.tax_amount:.2f}</td>
                        </tr>
                        <tr>
                            <td><strong>Discount:</strong></td>
                            <td style="text-align: right;">-${invoice.discount_amount:.2f}</td>
                        </tr>
                        <tr class="total-row">
                            <td><strong>TOTAL AMOUNT:</strong></td>
                            <td style="text-align: right;"><strong>${invoice.total_amount:.2f}</strong></td>
                        </tr>
                    </table>
                </div>
                
                {f'<div style="margin-top: 30px;"><h3>Notes:</h3><p style="background-color: #f8f9fa; padding: 15px; border-radius: 4px;">{invoice.notes}</p></div>' if invoice.notes else ''}
                
                <div class="footer">
                    <p><strong>Thank you for your business!</strong></p>
                    <p>This invoice was generated automatically on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}.</p>
                    <p>For questions regarding this invoice, please contact our billing department.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html

class PaymentEnhancedService:
    """Enhanced payment service with gateway integration and invoice management"""
    
    def __init__(self, db: Session):
        self.db = db
        self.gateway = PaymentGatewayService()
        self.pdf_generator = PDFGeneratorService()
    
    # Payment CRUD operations
    def create_payment(self, payment_data: PaymentCreate) -> Payment:
        """Create a new payment"""
        # Validate user exists
        user = self.db.query(User).filter(User.id == payment_data.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Generate transaction ID
        transaction_id = f"PAY_{uuid.uuid4().hex[:16].upper()}"
        
        payment = Payment(
            user_id=payment_data.user_id,
            booking_id=payment_data.booking_id,
            order_id=payment_data.order_id,
            trip_id=payment_data.trip_id,
            invoice_id=payment_data.invoice_id,
            amount=payment_data.amount,
            method=payment_data.method,
            status=PaymentStatus.PENDING,
            transaction_id=transaction_id,
            gateway_reference=payment_data.gateway_reference
        )
        
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        return payment
    
    def get_payment(self, payment_id: int) -> Optional[Payment]:
        """Get payment by ID"""
        return self.db.query(Payment).filter(Payment.payment_id == payment_id).first()
    
    def get_user_payments(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Payment]:
        """Get all payments for a user"""
        return self.db.query(Payment).filter(
            Payment.user_id == user_id
        ).order_by(desc(Payment.created_at)).offset(skip).limit(limit).all()
    
    def get_booking_payments(self, booking_id: int) -> List[Payment]:
        """Get all payments for a specific booking"""
        return self.db.query(Payment).filter(
            Payment.booking_id == booking_id
        ).order_by(desc(Payment.created_at)).all()
    
    def update_payment(self, payment_id: int, payment_update: PaymentUpdate) -> Payment:
        """Update payment details"""
        payment = self.get_payment(payment_id)
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        update_data = payment_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(payment, field, value)
        
        payment.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(payment)
        return payment
    
    # Payment gateway integration
    def process_payment(self, payment_id: int, gateway_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process payment through gateway"""
        payment = self.get_payment(payment_id)
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        if payment.status != PaymentStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment is not in pending status"
            )
        
        # Get user details for gateway
        user = self.db.query(User).filter(User.id == payment.user_id).first()
        
        # Create gateway request
        gateway_request = PaymentGatewayRequest(
            amount=payment.amount,
            currency="USD",
            payment_method=payment.method,
            customer_email=user.email if user else "customer@example.com",
            customer_name=user.full_name if user else "Customer",
            description=f"Payment for transaction {payment.transaction_id}",
            reference_id=payment.transaction_id
        )
        
        # Process through gateway
        gateway_response = self.gateway.create_payment(gateway_request)
        
        # Update payment with gateway response
        payment.status = PaymentStatus.PROCESSING if gateway_response.status == "pending" else PaymentStatus.PAID
        payment.gateway_reference = gateway_response.gateway_reference
        payment.gateway_response = json.dumps(gateway_response.dict())
        
        if gateway_response.status == "completed":
            payment.payment_time = datetime.utcnow()
            payment.status = PaymentStatus.PAID
        
        self.db.commit()
        self.db.refresh(payment)
        
        return {
            "success": gateway_response.success,
            "transaction_id": payment.transaction_id,
            "status": payment.status,
            "message": gateway_response.message,
            "redirect_url": gateway_response.redirect_url
        }
    
    def process_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process webhook from payment gateway"""
        gateway_response = self.gateway.process_webhook(webhook_data)
        
        # Find payment by gateway reference
        payment = self.db.query(Payment).filter(
            Payment.gateway_reference == gateway_response["gateway_reference"]
        ).first()
        
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        # Update payment status
        if gateway_response["status"] == "completed":
            payment.status = PaymentStatus.PAID
            payment.payment_time = datetime.utcnow()
        elif gateway_response["status"] == "failed":
            payment.status = PaymentStatus.FAILED
        
        payment.gateway_response = json.dumps(webhook_data)
        self.db.commit()
        
        return {"success": True, "payment_id": payment.payment_id}
    
    # Refund processing
    def process_refund(self, refund_request: RefundRequest) -> Dict[str, Any]:
        """Process refund for a payment"""
        payment = self.get_payment(refund_request.payment_id)
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        if payment.status != PaymentStatus.PAID:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment is not in paid status"
            )
        
        if refund_request.refund_amount > payment.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refund amount cannot exceed payment amount"
            )
        
        # Process refund through gateway
        gateway_refund = self.gateway.process_refund(
            payment.gateway_reference or payment.transaction_id,
            refund_request.refund_amount
        )
        
        # Update payment
        payment.status = PaymentStatus.REFUNDED
        payment.refund_time = datetime.utcnow()
        payment.refund_amount = refund_request.refund_amount
        payment.refund_reason = refund_request.refund_reason
        
        self.db.commit()
        
        return {
            "refund_id": gateway_refund["refund_id"],
            "payment_id": payment.payment_id,
            "refund_amount": refund_request.refund_amount,
            "refund_reason": refund_request.refund_reason,
            "status": "completed",
            "refund_time": payment.refund_time,
            "gateway_reference": gateway_refund["gateway_reference"]
        }
    
    # Invoice management
    def create_invoice(self, invoice_data: InvoiceCreate) -> Invoice:
        """Create a new invoice"""
        # Validate user exists
        user = self.db.query(User).filter(User.id == invoice_data.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Generate invoice number
        invoice_number = f"INV-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:8].upper()}"
        
        # Calculate totals
        subtotal = sum(item.unit_price * item.quantity for item in invoice_data.invoice_items)
        tax_amount = invoice_data.tax_amount
        total_amount = subtotal + tax_amount - invoice_data.discount_amount
        
        invoice = Invoice(
            user_id=invoice_data.user_id,
            booking_id=invoice_data.booking_id,
            order_id=invoice_data.order_id,
            trip_id=invoice_data.trip_id,
            invoice_number=invoice_number,
            total_amount=total_amount,
            subtotal=subtotal,
            tax_amount=tax_amount,
            discount_amount=invoice_data.discount_amount,
            currency=invoice_data.currency,
            status=InvoiceStatus.DRAFT,
            due_date=invoice_data.due_date,
            notes=invoice_data.notes,
            billing_address=invoice_data.billing_address,
            shipping_address=invoice_data.shipping_address
        )
        
        self.db.add(invoice)
        self.db.commit()
        self.db.refresh(invoice)
        
        # Create invoice items
        for item_data in invoice_data.invoice_items:
            item = InvoiceItem(
                invoice_id=invoice.invoice_id,
                description=item_data.description,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                total_price=item_data.unit_price * item_data.quantity,
                tax_rate=item_data.tax_rate,
                tax_amount=(item_data.unit_price * item_data.quantity) * (item_data.tax_rate / 100)
            )
            self.db.add(item)
        
        self.db.commit()
        self.db.refresh(invoice)
        return invoice
    
    def get_invoice(self, invoice_id: int) -> Optional[Invoice]:
        """Get invoice by ID"""
        return self.db.query(Invoice).filter(Invoice.invoice_id == invoice_id).first()
    
    def get_user_invoices(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Invoice]:
        """Get all invoices for a user"""
        return self.db.query(Invoice).filter(
            Invoice.user_id == user_id
        ).order_by(desc(Invoice.created_at)).offset(skip).limit(limit).all()
    
    def update_invoice(self, invoice_id: int, invoice_update: InvoiceUpdate) -> Invoice:
        """Update invoice details"""
        invoice = self.get_invoice(invoice_id)
        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        update_data = invoice_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(invoice, field, value)
        
        invoice.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(invoice)
        return invoice
    
    # Invoice generation
    def generate_invoice_from_booking(self, request: InvoiceGenerateRequest) -> Invoice:
        """Generate invoice from booking or other entities"""
        # Create invoice items from request
        invoice_items = []
        for item in request.items:
            invoice_item = InvoiceItemCreate(
                description=item.description,
                quantity=item.quantity,
                unit_price=item.unit_price,
                tax_rate=item.tax_rate
            )
            invoice_items.append(invoice_item)
        
        # Calculate totals
        subtotal = sum(item.unit_price * item.quantity for item in request.items)
        tax_amount = subtotal * (request.tax_rate / 100)
        total_amount = subtotal + tax_amount - request.discount_amount
        
        # Create invoice
        invoice_data = InvoiceCreate(
            user_id=request.user_id,
            booking_id=request.booking_id,
            order_id=request.order_id,
            trip_id=request.trip_id,
            total_amount=total_amount,
            subtotal=subtotal,
            tax_amount=tax_amount,
            discount_amount=request.discount_amount,
            currency="USD",
            due_date=request.due_date,
            notes=request.notes,
            invoice_items=invoice_items
        )
        
        return self.create_invoice(invoice_data)
    
    def generate_invoice_pdf(self, invoice_id: int, template: str = "default") -> str:
        """Generate PDF for invoice"""
        invoice = self.get_invoice(invoice_id)
        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        # Generate PDF
        pdf_path = self.pdf_generator.generate_invoice_pdf(invoice, template)
        
        # Update invoice with PDF path
        invoice.pdf_path = pdf_path
        self.db.commit()
        
        return pdf_path
    
    # Statistics and reporting
    def get_payment_statistics(self, user_id: Optional[int] = None) -> Dict[str, Any]:
        """Get payment statistics"""
        query = self.db.query(Payment)
        if user_id:
            query = query.filter(Payment.user_id == user_id)
        
        payments = query.all()
        
        total_payments = len(payments)
        total_amount = sum(p.amount for p in payments)
        successful_payments = len([p for p in payments if p.status == PaymentStatus.PAID])
        failed_payments = len([p for p in payments if p.status == PaymentStatus.FAILED])
        pending_payments = len([p for p in payments if p.status == PaymentStatus.PENDING])
        refunded_amount = sum(p.refund_amount or 0 for p in payments)
        
        # Payment methods distribution
        methods_distribution = {}
        for payment in payments:
            method = payment.method.value
            methods_distribution[method] = methods_distribution.get(method, 0) + 1
        
        return {
            "total_payments": total_payments,
            "total_amount": total_amount,
            "successful_payments": successful_payments,
            "failed_payments": failed_payments,
            "pending_payments": pending_payments,
            "refunded_amount": refunded_amount,
            "average_payment": total_amount / total_payments if total_payments > 0 else 0,
            "payment_methods_distribution": methods_distribution
        }
    
    def get_invoice_statistics(self, user_id: Optional[int] = None) -> Dict[str, Any]:
        """Get invoice statistics"""
        query = self.db.query(Invoice)
        if user_id:
            query = query.filter(Invoice.user_id == user_id)
        
        invoices = query.all()
        
        total_invoices = len(invoices)
        total_amount = sum(i.total_amount for i in invoices)
        paid_invoices = len([i for i in invoices if i.status == InvoiceStatus.PAID])
        overdue_invoices = len([i for i in invoices if i.status == InvoiceStatus.OVERDUE])
        pending_invoices = len([i for i in invoices if i.status == InvoiceStatus.SENT])
        total_tax_collected = sum(i.tax_amount for i in invoices)
        
        return {
            "total_invoices": total_invoices,
            "total_amount": total_amount,
            "paid_invoices": paid_invoices,
            "overdue_invoices": overdue_invoices,
            "pending_invoices": pending_invoices,
            "average_invoice": total_amount / total_invoices if total_invoices > 0 else 0,
            "total_tax_collected": total_tax_collected
        }
