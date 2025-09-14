# Payment API Integration Guide

## Overview

This document describes how the Payment API has been integrated into the Transportation Management dashboard. The integration follows the existing patterns used for other services like bookings, orders, and trips.

## API Endpoints

### 1. Create Payment
**POST** `http://localhost:8000/api/v1/payments/`

#### Request Body
```json
{
  "amount": 150,
  "method": "bank_transfer",
  "booking_id": 17,
  "order_id": 1,
  "trip_id": 3,
  "user_id": 3,
  "invoice_id": 9,
  "gateway_reference": "PAY-9A7X3B2C"
}
```

#### Response (201 Created)
```json
{
  "amount": 150,
  "method": "bank_transfer",
  "booking_id": 17,
  "order_id": 1,
  "trip_id": 3,
  "payment_id": 13,
  "user_id": 3,
  "invoice_id": 9,
  "status": "pending",
  "transaction_id": "PAY_8DBC04DF6FFE43F0",
  "gateway_reference": "PAY-9A7X3B2C",
  "payment_time": null,
  "refund_time": null,
  "refund_amount": null,
  "refund_reason": null,
  "created_at": "2025-09-11T06:26:19.306063+05:30",
  "updated_at": null
}
```

### 2. Get Payment by ID
**GET** `http://localhost:8000/api/v1/payments/{payment_id}`

#### Response (200 OK)
```json
{
  "amount": 150,
  "method": "bank_transfer",
  "booking_id": 17,
  "order_id": 1,
  "trip_id": 3,
  "payment_id": 13,
  "user_id": 3,
  "invoice_id": 9,
  "status": "pending",
  "transaction_id": "PAY_8DBC04DF6FFE43F0",
  "gateway_reference": "PAY-9A7X3B2C",
  "payment_time": null,
  "refund_time": null,
  "refund_amount": null,
  "refund_reason": null,
  "created_at": "2025-09-11T06:26:19.306063+05:30",
  "updated_at": null
}
```

### 3. Update Payment
**PUT** `http://localhost:8000/api/v1/payments/{payment_id}`

#### Request Body
```json
{
  "status": "pending",
  "transaction_id": "string",
  "gateway_reference": "string",
  "payment_time": "2025-09-11T01:09:28.013Z"
}
```

#### Response (200 OK)
```json
{
  "amount": 150,
  "method": "bank_transfer",
  "booking_id": 17,
  "order_id": 1,
  "trip_id": 3,
  "payment_id": 13,
  "user_id": 3,
  "invoice_id": 9,
  "status": "pending",
  "transaction_id": "string",
  "gateway_reference": "string",
  "payment_time": "2025-09-11T06:39:28.013000+05:30",
  "refund_time": null,
  "refund_amount": null,
  "refund_reason": null,
  "created_at": "2025-09-11T06:26:19.306063+05:30",
  "updated_at": "2025-09-11T01:09:45.876585+05:30"
}
```

## Available Payment Methods

The API supports the following payment methods:
- `cash` - Cash payments
- `card` - Credit or debit card payments
- `upi` - Unified Payments Interface (India)
- `wallet` - Digital wallet payments
- `bank_transfer` - Direct bank transfers
- `net_banking` - Internet banking payments
- `crypto` - Cryptocurrency payments

## Implementation Files

### 1. Payment Service (`src/services/paymentService.ts`)

A new service file has been created following the same pattern as other services:
- Authentication handling via JWT tokens
- Error handling for API responses
- CRUD operations for payments
- Filtering and pagination support
- Type safety with TypeScript interfaces

### 2. UI Components

#### Payment Management Dashboard (`src/app/(admin)/(ui-elements)/bookings/payments/page.tsx`)
- Lists all payments with filtering capabilities
- Shows payment statistics (total revenue, pending amounts, etc.)
- Allows viewing payment details
- Supports refund processing

#### Payment Detail Page (`src/app/(admin)/(ui-elements)/bookings/payments/[id]/page.tsx`)
- Detailed view of a specific payment
- Update form for modifying payment details
- Links to related entities (booking, order, trip, user, invoice)

#### Create Payment Form (`src/app/(admin)/(ui-elements)/bookings/create-payment/page.tsx`)
- Form for manually creating payments
- Validation for required fields
- Example data pre-filled for quick testing
- API endpoint documentation

#### API Test Pages
- Payment API Test (`src/app/(admin)/(ui-elements)/bookings/payment-endpoint/page.tsx`)
- Payment Detail API Test (`src/app/(admin)/(ui-elements)/bookings/payment-detail-endpoint/page.tsx`)

### 3. Navigation Integration

The new payment-related pages have been added to the sidebar navigation under "Booking Management":
- Payment Management
- Create Payment
- Payment API Test
- Payment Detail API Test

## Integration Points

The payment system can be integrated with existing workflows:

1. **Booking Confirmation**: Automatically create a payment when a booking is confirmed
2. **Order Processing**: Link payments to order fulfillment
3. **Trip Completion**: Process payments when trips are completed
4. **Manual Processing**: Admins can manually create payments for special cases

## Data Model

The payment entity includes the following fields:

- `payment_id`: Unique identifier
- `amount`: Payment amount
- `method`: Payment method (cash, card, upi, wallet, bank_transfer, net_banking, crypto)
- `status`: Current status (pending, completed, failed, refunded, processing)
- `transaction_id`: System-generated transaction ID
- `gateway_reference`: External payment gateway reference
- References to related entities (booking_id, order_id, trip_id, user_id, invoice_id)
- Audit fields (created_at, updated_at, payment_time, refund_time)
- Refund information (refund_amount, refund_reason)

## Best Practices

1. **Error Handling**: All API calls include proper error handling with user-friendly messages
2. **Authentication**: All requests include JWT authentication headers
3. **Validation**: Client-side validation for required fields before API calls
4. **Loading States**: Visual feedback during API operations
5. **Responsive Design**: All components work on mobile and desktop
6. **Type Safety**: TypeScript interfaces ensure data consistency

## Future Enhancements

1. **Webhook Integration**: Listen for payment status updates from payment gateways
2. **Refund Management**: Enhanced refund processing with approval workflows
3. **Payment Reports**: Detailed reporting on payment trends and analytics
4. **Multi-currency Support**: Handle payments in different currencies
5. **Receipt Generation**: Automated receipt generation for completed payments