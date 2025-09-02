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

class PaymentGatewayService:
    """Dummy payment gateway service for demonstration"""
    
    def __init__(self):
        self.api_key = "dummy_api_key_12345"
        self.secret_key = "dummy_secret_key_67890"
        self.base_url = "https://api.dummygateway.com/v1"
    
    def create_payment(self, payment_request: PaymentGatewayRequest) -> PaymentGatewayResponse:
        """Create a payment request with the gateway"""
        # Simulate gateway API call
        transaction_id = f"TXN_{uuid.uuid4().hex[:16].upper()}"
        gateway_reference = f"REF_{uuid.uuid4().hex[:12].upper()}"
        
        # Simulate different payment method responses
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
            # For card payments, simulate redirect
            return PaymentGatewayResponse(
                success=True,
                transaction_id=transaction_id,
                gateway_reference=gateway_reference,
                status="pending",
                message="Payment gateway redirect required",
                redirect_url=f"https://payment.gateway.com/pay/{gateway_reference}"
            )
    
    def process_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process webhook from payment gateway"""
        # Verify webhook signature (dummy verification)
        signature = webhook_data.get("signature", "")
        if not self._verify_signature(webhook_data, signature):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature"
            )
        
        return {
            "success": True,
            "transaction_id": webhook_data.get("payment_id"),
            "status": webhook_data.get("status"),
            "amount": webhook_data.get("amount"),
            "gateway_reference": webhook_data.get("reference_id")
        }
    
    def process_refund(self, payment_id: str, refund_amount: float) -> Dict[str, Any]:
        """Process refund through gateway"""
        refund_id = f"REF_{uuid.uuid4().hex[:16].upper()}"
        return {
            "success": True,
            "refund_id": refund_id,
            "payment_id": payment_id,
            "refund_amount": refund_amount,
            "status": "completed",
            "gateway_reference": f"REF_{uuid.uuid4().hex[:12].upper()}"
        }
    
    def _verify_signature(self, data: Dict[str, Any], signature: str) -> bool:
        """Verify webhook signature (dummy implementation)"""
        # In real implementation, verify HMAC signature
        return signature.startswith("sig_")

class PDFGeneratorService:
    """Service for generating PDF invoices"""
    
    def __init__(self):
        self.templates_dir = Path("templates/invoices")
        self.output_dir = Path("static/invoices")
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
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
        """Generate HTML content for invoice"""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice {invoice.invoice_number}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                .header {{ text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }}
                .invoice-details {{ margin: 20px 0; }}
                .items-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                .items-table th, .items-table td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                .total {{ text-align: right; margin-top: 20px; }}
                .status {{ color: {'green' if invoice.status == InvoiceStatus.PAID else 'red'}; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>TRANSPORTATION SERVICES</h1>
                <h2>INVOICE</h2>
            </div>
            
            <div class="invoice-details">
                <p><strong>Invoice Number:</strong> {invoice.invoice_number}</p>
                <p><strong>Date:</strong> {invoice.created_at.strftime('%Y-%m-%d')}</p>
                <p><strong>Status:</strong> <span class="status">{invoice.status.value.upper()}</span></p>
                <p><strong>Due Date:</strong> {invoice.due_date.strftime('%Y-%m-%d') if invoice.due_date else 'N/A'}</p>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Tax</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
        """
        
        for item in invoice.invoice_items:
            html += f"""
                    <tr>
                        <td>{item.description}</td>
                        <td>{item.quantity}</td>
                        <td>${item.unit_price:.2f}</td>
                        <td>${item.tax_amount:.2f}</td>
                        <td>${item.total_price:.2f}</td>
                    </tr>
            """
        
        html += f"""
                </tbody>
            </table>
            
            <div class="total">
                <p><strong>Subtotal:</strong> ${invoice.subtotal:.2f}</p>
                <p><strong>Tax:</strong> ${invoice.tax_amount:.2f}</p>
                <p><strong>Discount:</strong> ${invoice.discount_amount:.2f}</p>
                <p><strong>Total Amount:</strong> ${invoice.total_amount:.2f}</p>
            </div>
            
            {f'<p><strong>Notes:</strong> {invoice.notes}</p>' if invoice.notes else ''}
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
