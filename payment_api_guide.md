# Payment API Endpoints Guide

This document provides detailed information on how to use all the payment-related API endpoints in the Transportation Management System.

## Base URL
```
http://localhost:8000/api/v1/payments
```

## 1. Process Webhook
**Endpoint**: `POST /webhook`  
**Purpose**: Receive payment status updates from external payment gateways

### Request Body:
```json
{
  "event_type": "payment.completed",
  "payment_id": "TXN_1234567890ABCDEF",
  "status": "completed",
  "amount": 150.00,
  "currency": "USD",
  "timestamp": "2025-09-11T16:30:00Z",
  "signature": "sig_webhook_signature_123",
  "data": {
    "gateway_reference": "REF_1234567890AB",
    "transaction_id": "TXN_1234567890ABCDEF"
  }
}
```

### Response:
```json
{
  "success": true,
  "payment_id": 17
}
```

### Example Usage:
```bash
curl -X POST http://localhost:8000/api/v1/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "payment.completed",
    "payment_id": "TXN_1234567890ABCDEF",
    "status": "completed",
    "amount": 150.00,
    "currency": "USD",
    "timestamp": "2025-09-11T16:30:00Z",
    "signature": "sig_webhook_signature_123",
    "data": {
      "gateway_reference": "REF_1234567890AB",
      "transaction_id": "TXN_1234567890ABCDEF"
    }
  }'
```

## 2. Process Refund
**Endpoint**: `POST /refund`  
**Purpose**: Process refund for a payment

### Request Body:
```json
{
  "payment_id": 17,
  "refund_amount": 50.00,
  "refund_reason": "Customer requested partial refund",
  "partial_refund": true
}
```

### Response:
```json
{
  "refund_id": "REF_1234567890ABCDEF",
  "payment_id": 17,
  "refund_amount": 50.00,
  "refund_reason": "Customer requested partial refund",
  "status": "completed",
  "refund_time": "2025-09-11T16:30:00Z",
  "gateway_reference": "REF_1234567890AB"
}
```

### Example Usage:
```bash
curl -X POST http://localhost:8000/api/v1/payments/refund \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": 17,
    "refund_amount": 50.00,
    "refund_reason": "Customer requested partial refund",
    "partial_refund": true
  }'
```

## 3. Create Invoice
**Endpoint**: `POST /invoices/`  
**Purpose**: Create a new invoice

### Request Body:
```json
{
  "user_id": 1,
  "total_amount": 200.00,
  "subtotal": 180.00,
  "tax_amount": 20.00,
  "discount_amount": 0.00,
  "currency": "USD",
  "booking_id": 1,
  "due_date": "2025-10-11T16:30:00Z",
  "notes": "Transportation service invoice",
  "billing_address": "123 Main St, City, State 12345",
  "shipping_address": "123 Main St, City, State 12345",
  "invoice_items": [
    {
      "description": "Cargo Transportation Service",
      "quantity": 1,
      "unit_price": 150.00,
      "tax_rate": 10.0
    },
    {
      "description": "Express Delivery Fee",
      "quantity": 1,
      "unit_price": 30.00,
      "tax_rate": 10.0
    }
  ]
}
```

### Response:
```json
{
  "user_id": 1,
  "booking_id": 1,
  "invoice_number": "INV-202509-1234ABCD",
  "total_amount": 200.00,
  "subtotal": 180.00,
  "tax_amount": 20.00,
  "discount_amount": 0.00,
  "currency": "USD",
  "status": "draft",
  "due_date": "2025-10-11T16:30:00Z",
  "paid_date": null,
  "pdf_path": null,
  "notes": "Transportation service invoice",
  "billing_address": "123 Main St, City, State 12345",
  "shipping_address": "123 Main St, City, State 12345",
  "created_at": "2025-09-11T16:30:00Z",
  "updated_at": null,
  "invoice_items": [
    {
      "description": "Cargo Transportation Service",
      "quantity": 1,
      "unit_price": 150.00,
      "tax_rate": 10.0,
      "item_id": 1,
      "invoice_id": 1,
      "total_price": 150.00,
      "tax_amount": 15.00,
      "created_at": "2025-09-11T16:30:00Z"
    },
    {
      "description": "Express Delivery Fee",
      "quantity": 1,
      "unit_price": 30.00,
      "tax_rate": 10.0,
      "item_id": 2,
      "invoice_id": 1,
      "total_price": 30.00,
      "tax_amount": 3.00,
      "created_at": "2025-09-11T16:30:00Z"
    }
  ],
  "invoice_id": 1
}
```

### Example Usage:
```bash
curl -X POST http://localhost:8000/api/v1/payments/invoices/ \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "total_amount": 200.00,
    "subtotal": 180.00,
    "tax_amount": 20.00,
    "discount_amount": 0.00,
    "currency": "USD",
    "booking_id": 1,
    "due_date": "2025-10-11T16:30:00Z",
    "notes": "Transportation service invoice",
    "billing_address": "123 Main St, City, State 12345",
    "shipping_address": "123 Main St, City, State 12345",
    "invoice_items": [
      {
        "description": "Cargo Transportation Service",
        "quantity": 1,
        "unit_price": 150.00,
        "tax_rate": 10.0
      },
      {
        "description": "Express Delivery Fee",
        "quantity": 1,
        "unit_price": 30.00,
        "tax_rate": 10.0
      }
    ]
  }'
```

## 4. Get User Invoices
**Endpoint**: `GET /invoices/user/{user_id}`  
**Purpose**: Get all invoices for a specific user

### Response:
```json
[
  {
    "user_id": 1,
    "booking_id": 1,
    "invoice_number": "INV-202509-1234ABCD",
    "total_amount": 200.00,
    "subtotal": 180.00,
    "tax_amount": 20.00,
    "discount_amount": 0.00,
    "currency": "USD",
    "status": "draft",
    "due_date": "2025-10-11T16:30:00Z",
    "paid_date": null,
    "pdf_path": null,
    "notes": "Transportation service invoice",
    "billing_address": "123 Main St, City, State 12345",
    "shipping_address": "123 Main St, City, State 12345",
    "created_at": "2025-09-11T16:30:00Z",
    "updated_at": null,
    "invoice_items": [
      {
        "description": "Cargo Transportation Service",
        "quantity": 1,
        "unit_price": 150.00,
        "tax_rate": 10.0,
        "item_id": 1,
        "invoice_id": 1,
        "total_price": 150.00,
        "tax_amount": 15.00,
        "created_at": "2025-09-11T16:30:00Z"
      }
    ],
    "invoice_id": 1
  }
]
```

### Example Usage:
```bash
curl -X GET http://localhost:8000/api/v1/payments/invoices/user/1
```

## 5. Generate Invoice
**Endpoint**: `POST /invoices/generate`  
**Purpose**: Generate invoice from booking or other entities

### Request Body:
```json
{
  "user_id": 1,
  "booking_id": 1,
  "items": [
    {
      "description": "Transportation Service",
      "quantity": 1,
      "unit_price": 100.00,
      "tax_rate": 8.5
    },
    {
      "description": "Fuel Surcharge",
      "quantity": 1,
      "unit_price": 15.00,
      "tax_rate": 8.5
    }
  ],
  "tax_rate": 8.5,
  "discount_amount": 10.00,
  "due_date": "2025-09-26T16:30:00Z",
  "notes": "Generated from booking #1"
}
```

### Response:
```json
{
  "invoice": {
    "user_id": 1,
    "booking_id": 1,
    "invoice_number": "INV-202509-5678EFGH",
    "total_amount": 104.77,
    "subtotal": 105.00,
    "tax_amount": 8.92,
    "discount_amount": 10.00,
    "currency": "USD",
    "status": "draft",
    "due_date": "2025-09-26T16:30:00Z",
    "paid_date": null,
    "pdf_path": null,
    "notes": "Generated from booking #1",
    "billing_address": null,
    "shipping_address": null,
    "created_at": "2025-09-11T16:30:00Z",
    "updated_at": null,
    "invoice_items": [
      {
        "description": "Transportation Service",
        "quantity": 1,
        "unit_price": 100.00,
        "tax_rate": 8.5,
        "item_id": 3,
        "invoice_id": 2,
        "total_price": 100.00,
        "tax_amount": 8.50,
        "created_at": "2025-09-11T16:30:00Z"
      },
      {
        "description": "Fuel Surcharge",
        "quantity": 1,
        "unit_price": 15.00,
        "tax_rate": 8.5,
        "item_id": 4,
        "invoice_id": 2,
        "total_price": 15.00,
        "tax_amount": 1.28,
        "created_at": "2025-09-11T16:30:00Z"
      }
    ],
    "invoice_id": 2
  },
  "pdf_url": null,
  "message": "Invoice generated successfully"
}
```

### Example Usage:
```bash
curl -X POST http://localhost:8000/api/v1/payments/invoices/generate \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "booking_id": 1,
    "items": [
      {
        "description": "Transportation Service",
        "quantity": 1,
        "unit_price": 100.00,
        "tax_rate": 8.5
      },
      {
        "description": "Fuel Surcharge",
        "quantity": 1,
        "unit_price": 15.00,
        "tax_rate": 8.5
      }
    ],
    "tax_rate": 8.5,
    "discount_amount": 10.00,
    "due_date": "2025-09-26T16:30:00Z",
    "notes": "Generated from booking #1"
  }'
```

## 6. Generate Invoice PDF
**Endpoint**: `POST /invoices/{invoice_id}/pdf`  
**Purpose**: Generate PDF for invoice

### Request Body:
```json
{
  "invoice_id": 2,
  "template": "default"
}
```

### Response:
```json
{
  "success": true,
  "pdf_url": "/static/invoices/invoice_INV-202509-5678EFGH_20250911_163000.html",
  "file_size": null,
  "message": "PDF generated successfully"
}
```

### Example Usage:
```bash
curl -X POST http://localhost:8000/api/v1/payments/invoices/2/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_id": 2,
    "template": "default"
  }'
```

## 7. Get Payment Statistics
**Endpoint**: `GET /statistics/payments`  
**Purpose**: Get payment statistics

### Response:
```json
{
  "total_payments": 5,
  "total_amount": 750.00,
  "successful_payments": 4,
  "failed_payments": 1,
  "pending_payments": 0,
  "refunded_amount": 50.00,
  "average_payment": 150.00,
  "payment_methods_distribution": {
    "card": 3,
    "cash": 1,
    "upi": 1
  }
}
```

### Example Usage:
```bash
curl -X GET http://localhost:8000/api/v1/payments/statistics/payments
```

## 8. Get Invoice Statistics
**Endpoint**: `GET /statistics/invoices`  
**Purpose**: Get invoice statistics

### Response:
```json
{
  "total_invoices": 2,
  "total_amount": 304.77,
  "paid_invoices": 0,
  "overdue_invoices": 0,
  "pending_invoices": 2,
  "average_invoice": 152.39,
  "total_tax_collected": 28.92
}
```

### Example Usage:
```bash
curl -X GET http://localhost:8000/api/v1/payments/statistics/invoices
```

## 9. Search Payments
**Endpoint**: `GET /search/`  
**Purpose**: Search and filter payments

### Response:
```json
[
  {
    "user_id": 1,
    "booking_id": 1,
    "amount": 150.00,
    "method": "card",
    "status": "paid",
    "transaction_id": "PAY_1234567890ABCDEF",
    "gateway_reference": "REF_1234567890AB",
    "payment_time": "2025-09-11T16:30:00Z",
    "refund_time": null,
    "refund_amount": null,
    "refund_reason": null,
    "created_at": "2025-09-11T16:30:00Z",
    "updated_at": null,
    "payment_id": 17
  }
]
```

### Example Usage:
```bash
curl -X GET "http://localhost:8000/api/v1/payments/search/?user_id=1&status=paid&method=card"
```

## 10. Search Invoices
**Endpoint**: `GET /invoices/search/`  
**Purpose**: Search and filter invoices

### Response:
```json
[
  {
    "user_id": 1,
    "booking_id": 1,
    "invoice_number": "INV-202509-1234ABCD",
    "total_amount": 200.00,
    "subtotal": 180.00,
    "tax_amount": 20.00,
    "discount_amount": 0.00,
    "currency": "USD",
    "status": "draft",
    "due_date": "2025-10-11T16:30:00Z",
    "paid_date": null,
    "pdf_path": null,
    "notes": "Transportation service invoice",
    "billing_address": "123 Main St, City, State 12345",
    "shipping_address": "123 Main St, City, State 12345",
    "created_at": "2025-09-11T16:30:00Z",
    "updated_at": null,
    "invoice_items": [
      {
        "description": "Cargo Transportation Service",
        "quantity": 1,
        "unit_price": 150.00,
        "tax_rate": 10.0,
        "item_id": 1,
        "invoice_id": 1,
        "total_price": 150.00,
        "tax_amount": 15.00,
        "created_at": "2025-09-11T16:30:00Z"
      }
    ],
    "invoice_id": 1
  }
]
```

### Example Usage:
```bash
curl -X GET "http://localhost:8000/api/v1/payments/invoices/search/?user_id=1&status=draft"
```

## 11. Update Payment Status
**Endpoint**: `PUT /{payment_id}/status`  
**Purpose**: Update payment status manually

### Request Body:
```json
{
  "status": "paid",
  "gateway_response": "{\"status\":\"completed\",\"message\":\"Payment completed successfully\"}"
}
```

### Response:
```json
{
  "user_id": 1,
  "booking_id": 1,
  "amount": 150.00,
  "method": "card",
  "status": "paid",
  "transaction_id": "PAY_1234567890ABCDEF",
  "gateway_reference": "REF_1234567890AB",
  "payment_time": "2025-09-11T16:30:00Z",
  "refund_time": null,
  "refund_amount": null,
  "refund_reason": null,
  "created_at": "2025-09-11T16:30:00Z",
  "updated_at": "2025-09-11T16:35:00Z",
  "payment_id": 17
}
```

### Example Usage:
```bash
curl -X PUT http://localhost:8000/api/v1/payments/17/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "paid",
    "gateway_response": "{\"status\":\"completed\",\"message\":\"Payment completed successfully\"}"
  }'
```

## 12. Update Invoice Status
**Endpoint**: `PUT /invoices/{invoice_id}/status`  
**Purpose**: Update invoice status

### Request Body:
```json
{
  "status": "sent"
}
```

### Response:
```json
{
  "user_id": 1,
  "booking_id": 1,
  "invoice_number": "INV-202509-1234ABCD",
  "total_amount": 200.00,
  "subtotal": 180.00,
  "tax_amount": 20.00,
  "discount_amount": 0.00,
  "currency": "USD",
  "status": "sent",
  "due_date": "2025-10-11T16:30:00Z",
  "paid_date": null,
  "pdf_path": null,
  "notes": "Transportation service invoice",
  "billing_address": "123 Main St, City, State 12345",
  "shipping_address": "123 Main St, City, State 12345",
  "created_at": "2025-09-11T16:30:00Z",
  "updated_at": "2025-09-11T16:35:00Z",
  "invoice_items": [
    {
      "description": "Cargo Transportation Service",
      "quantity": 1,
      "unit_price": 150.00,
      "tax_rate": 10.0,
      "item_id": 1,
      "invoice_id": 1,
      "total_price": 150.00,
      "tax_amount": 15.00,
      "created_at": "2025-09-11T16:30:00Z"
    }
  ],
  "invoice_id": 1
}
```

### Example Usage:
```bash
curl -X PUT http://localhost:8000/api/v1/payments/invoices/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "sent"
  }'
```

## 13. Get Payment Methods
**Endpoint**: `GET /methods/`  
**Purpose**: Get available payment methods

### Response:
```json
[
  "cash",
  "card",
  "upi",
  "wallet",
  "bank_transfer",
  "net_banking",
  "crypto"
]
```

### Example Usage:
```bash
curl -X GET http://localhost:8000/api/v1/payments/methods/
```

## 14. Get Payment Statuses
**Endpoint**: `GET /statuses/`  
**Purpose**: Get available payment statuses

### Response:
```json
[
  "pending",
  "processing",
  "paid",
  "failed",
  "refunded",
  "cancelled",
  "expired"
]
```

### Example Usage:
```bash
curl -X GET http://localhost:8000/api/v1/payments/statuses/
```

## 15. Get Invoice Statuses
**Endpoint**: `GET /invoices/statuses/`  
**Purpose**: Get available invoice statuses

### Response:
```json
[
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled"
]
```

### Example Usage:
```bash
curl -X GET http://localhost:8000/api/v1/payments/invoices/statuses/
```

## 16. Create Bulk Payments
**Endpoint**: `POST /bulk/create`  
**Purpose**: Create multiple payments at once

### Request Body:
```json
[
  {
    "user_id": 1,
    "amount": 25.00,
    "method": "cash",
    "booking_id": 3
  },
  {
    "user_id": 2,
    "amount": 45.00,
    "method": "upi",
    "booking_id": 4
  }
]
```

### Response:
```json
[
  {
    "user_id": 1,
    "booking_id": 3,
    "amount": 25.00,
    "method": "cash",
    "status": "pending",
    "transaction_id": "PAY_1234567890ABC1",
    "gateway_reference": null,
    "payment_time": null,
    "refund_time": null,
    "refund_amount": null,
    "refund_reason": null,
    "created_at": "2025-09-11T16:30:00Z",
    "updated_at": null,
    "payment_id": 18
  },
  {
    "user_id": 2,
    "booking_id": 4,
    "amount": 45.00,
    "method": "upi",
    "status": "pending",
    "transaction_id": "PAY_1234567890ABC2",
    "gateway_reference": null,
    "payment_time": null,
    "refund_time": null,
    "refund_amount": null,
    "refund_reason": null,
    "created_at": "2025-09-11T16:30:00Z",
    "updated_at": null,
    "payment_id": 19
  }
]
```

### Example Usage:
```bash
curl -X POST http://localhost:8000/api/v1/payments/bulk/create \
  -H "Content-Type: application/json" \
  -d '[
    {
      "user_id": 1,
      "amount": 25.00,
      "method": "cash",
      "booking_id": 3
    },
    {
      "user_id": 2,
      "amount": 45.00,
      "method": "upi",
      "booking_id": 4
    }
  ]'
```

## 17. Create Bulk Invoices
**Endpoint**: `POST /invoices/bulk/create`  
**Purpose**: Create multiple invoices at once

### Request Body:
```json
[
  {
    "user_id": 1,
    "total_amount": 50.00,
    "subtotal": 45.00,
    "tax_amount": 5.00,
    "discount_amount": 0.00,
    "currency": "USD",
    "booking_id": 5,
    "invoice_items": [
      {
        "description": "Service Fee",
        "quantity": 1,
        "unit_price": 45.00,
        "tax_rate": 10.0
      }
    ]
  }
]
```

### Response:
```json
[
  {
    "user_id": 1,
    "booking_id": 5,
    "invoice_number": "INV-202509-9012IJKL",
    "total_amount": 50.00,
    "subtotal": 45.00,
    "tax_amount": 5.00,
    "discount_amount": 0.00,
    "currency": "USD",
    "status": "draft",
    "due_date": null,
    "paid_date": null,
    "pdf_path": null,
    "notes": null,
    "billing_address": null,
    "shipping_address": null,
    "created_at": "2025-09-11T16:30:00Z",
    "updated_at": null,
    "invoice_items": [
      {
        "description": "Service Fee",
        "quantity": 1,
        "unit_price": 45.00,
        "tax_rate": 10.0,
        "item_id": 5,
        "invoice_id": 3,
        "total_price": 45.00,
        "tax_amount": 4.50,
        "created_at": "2025-09-11T16:30:00Z"
      }
    ],
    "invoice_id": 3
  }
]
```

### Example Usage:
```bash
curl -X POST http://localhost:8000/api/v1/payments/invoices/bulk/create \
  -H "Content-Type: application/json" \
  -d '[
    {
      "user_id": 1,
      "total_amount": 50.00,
      "subtotal": 45.00,
      "tax_amount": 5.00,
      "discount_amount": 0.00,
      "currency": "USD",
      "booking_id": 5,
      "invoice_items": [
        {
          "description": "Service Fee",
          "quantity": 1,
          "unit_price": 45.00,
          "tax_rate": 10.0
        }
      ]
    }
  ]'
```

## 18. Export Payments
**Endpoint**: `GET /export/payments`  
**Purpose**: Export payments data

### Response (JSON):
```json
{
  "data": [
    {
      "user_id": 1,
      "booking_id": 1,
      "amount": 150.00,
      "method": "card",
      "status": "paid",
      "transaction_id": "PAY_1234567890ABCDEF",
      "gateway_reference": "REF_1234567890AB",
      "payment_time": "2025-09-11T16:30:00Z",
      "refund_time": null,
      "refund_amount": null,
      "refund_reason": null,
      "created_at": "2025-09-11T16:30:00Z",
      "updated_at": null,
      "payment_id": 17
    }
  ],
  "format": "json"
}
```

### Response (CSV):
```json
{
  "data": "payment_id,user_id,amount,method,status,created_at\n17,1,150.0,card,paid,2025-09-11 16:30:00\n",
  "format": "csv"
}
```

### Example Usage:
```bash
# JSON format
curl -X GET "http://localhost:8000/api/v1/payments/export/payments?format=json&user_id=1"

# CSV format
curl -X GET "http://localhost:8000/api/v1/payments/export/payments?format=csv&user_id=1"
```

## 19. Export Invoices
**Endpoint**: `GET /export/invoices`  
**Purpose**: Export invoices data

### Response (JSON):
```json
{
  "data": [
    {
      "user_id": 1,
      "booking_id": 1,
      "invoice_number": "INV-202509-1234ABCD",
      "total_amount": 200.00,
      "subtotal": 180.00,
      "tax_amount": 20.00,
      "discount_amount": 0.00,
      "currency": "USD",
      "status": "draft",
      "due_date": "2025-10-11T16:30:00Z",
      "paid_date": null,
      "pdf_path": null,
      "notes": "Transportation service invoice",
      "billing_address": "123 Main St, City, State 12345",
      "shipping_address": "123 Main St, City, State 12345",
      "created_at": "2025-09-11T16:30:00Z",
      "updated_at": null,
      "invoice_items": [],
      "invoice_id": 1
    }
  ],
  "format": "json"
}
```

### Example Usage:
```bash
# JSON format
curl -X GET "http://localhost:8000/api/v1/payments/export/invoices?format=json&user_id=1"

# CSV format
curl -X GET "http://localhost:8000/api/v1/payments/export/invoices?format=csv&user_id=1"
```

## 20. Get Payment
**Endpoint**: `GET /{payment_id}`  
**Purpose**: Get payment details by ID

### Response:
```json
{
  "user_id": 1,
  "booking_id": 1,
  "amount": 150.00,
  "method": "card",
  "status": "paid",
  "transaction_id": "PAY_1234567890ABCDEF",
  "gateway_reference": "REF_1234567890AB",
  "payment_time": "2025-09-11T16:30:00Z",
  "refund_time": null,
  "refund_amount": null,
  "refund_reason": null,
  "created_at": "2025-09-11T16:30:00Z",
  "updated_at": "2025-09-11T16:35:00Z",
  "payment_id": 17
}
```

### Example Usage:
```bash
curl -X GET http://localhost:8000/api/v1/payments/17
```

## 21. Update Payment
**Endpoint**: `PUT /{payment_id}`  
**Purpose**: Update payment details

### Request Body:
```json
{
  "status": "refunded",
  "refund_amount": 150.00,
  "refund_reason": "Customer requested full refund"
}
```

### Response:
```json
{
  "user_id": 1,
  "booking_id": 1,
  "amount": 150.00,
  "method": "card",
  "status": "refunded",
  "transaction_id": "PAY_1234567890ABCDEF",
  "gateway_reference": "REF_1234567890AB",
  "payment_time": "2025-09-11T16:30:00Z",
  "refund_time": "2025-09-11T16:40:00Z",
  "refund_amount": 150.00,
  "refund_reason": "Customer requested full refund",
  "created_at": "2025-09-11T16:30:00Z",
  "updated_at": "2025-09-11T16:40:00Z",
  "payment_id": 17
}
```

### Example Usage:
```bash
curl -X PUT http://localhost:8000/api/v1/payments/17 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "refunded",
    "refund_amount": 150.00,
    "refund_reason": "Customer requested full refund"
  }'
```

## 22. Process Payment
**Endpoint**: `POST /{payment_id}/process`  
**Purpose**: Process payment through payment gateway

### Request Body:
```json
{
  "gateway_data": {
    "card_number": "4111111111111111",
    "expiry": "12/25",
    "cvv": "123"
  }
}
```

### Response:
```json
{
  "success": true,
  "transaction_id": "PAY_1234567890ABCDEF",
  "status": "processing",
  "message": "Payment gateway redirect required",
  "redirect_url": "https://api.testgateway.com/v1/pay/REF_1234567890AB"
}
```

### Example Usage:
```bash
curl -X POST http://localhost:8000/api/v1/payments/17/process \
  -H "Content-Type: application/json" \
  -d '{
    "gateway_data": {
      "card_number": "4111111111111111",
      "expiry": "12/25",
      "cvv": "123"
    }
  }'
```

## 23. Get Invoice
**Endpoint**: `GET /invoices/{invoice_id}`  
**Purpose**: Get invoice details by ID

### Response:
```json
{
  "user_id": 1,
  "booking_id": 1,
  "invoice_number": "INV-202509-1234ABCD",
  "total_amount": 200.00,
  "subtotal": 180.00,
  "tax_amount": 20.00,
  "discount_amount": 0.00,
  "currency": "USD",
  "status": "draft",
  "due_date": "2025-10-11T16:30:00Z",
  "paid_date": null,
  "pdf_path": null,
  "notes": "Transportation service invoice",
  "billing_address": "123 Main St, City, State 12345",
  "shipping_address": "123 Main St, City, State 12345",
  "created_at": "2025-09-11T16:30:00Z",
  "updated_at": null,
  "invoice_items": [
    {
      "description": "Cargo Transportation Service",
      "quantity": 1,
      "unit_price": 150.00,
      "tax_rate": 10.0,
      "item_id": 1,
      "invoice_id": 1,
      "total_price": 150.00,
      "tax_amount": 15.00,
      "created_at": "2025-09-11T16:30:00Z"
    }
  ],
  "invoice_id": 1
}
```

### Example Usage:
```bash
curl -X GET http://localhost:8000/api/v1/payments/invoices/1
```

## 24. Update Invoice
**Endpoint**: `PUT /invoices/{invoice_id}`  
**Purpose**: Update invoice details

### Request Body:
```json
{
  "status": "sent",
  "notes": "Invoice sent to customer"
}
```

### Response:
```json
{
  "user_id": 1,
  "booking_id": 1,
  "invoice_number": "INV-202509-1234ABCD",
  "total_amount": 200.00,
  "subtotal": 180.00,
  "tax_amount": 20.00,
  "discount_amount": 0.00,
  "currency": "USD",
  "status": "sent",
  "due_date": "2025-10-11T16:30:00Z",
  "paid_date": null,
  "pdf_path": null,
  "notes": "Invoice sent to customer",
  "billing_address": "123 Main St, City, State 12345",
  "shipping_address": "123 Main St, City, State 12345",
  "created_at": "2025-09-11T16:30:00Z",
  "updated_at": "2025-09-11T16:45:00Z",
  "invoice_items": [
    {
      "description": "Cargo Transportation Service",
      "quantity": 1,
      "unit_price": 150.00,
      "tax_rate": 10.0,
      "item_id": 1,
      "invoice_id": 1,
      "total_price": 150.00,
      "tax_amount": 15.00,
      "created_at": "2025-09-11T16:30:00Z"
    }
  ],
  "invoice_id": 1
}
```

### Example Usage:
```bash
curl -X PUT http://localhost:8000/api/v1/payments/invoices/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "sent",
    "notes": "Invoice sent to customer"
  }'
```