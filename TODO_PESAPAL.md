<!-- # Pesapal v3 Payment Integration - Implementation Plan

## Current State Analysis

### What's Working:
- ✅ Basic Pesapal service library (`lib/pesapal.ts`)
- ✅ Submit order API (`app/api/pesapal/submit-order/route.ts`)
- ✅ Order status API (`app/api/pesapal/order-status/route.ts`)
- ✅ Callback handler (`app/api/pesapal/callback/route.ts`)
- ✅ Database models for payments (`PesapalPayment`, `PesapalIPN`)

### What's Missing:
- ❌ No Pesapal payment form component
- ❌ Checkout form doesn't have Pesapal as payment option
- ❌ No refund functionality
- ❌ No payment verification page
- ❌ No M-Pesa specific STK push integration
- ❌ No order confirmation page for Pesapal payments
- ❌ No admin payment management

---

## Implementation Plan

### Phase 1: Enhanced Pesapal Service (lib/pesapal.ts)
- [ ] Add refund functionality
- [ ] Add register IPN endpoint
- [ ] Add live/demo mode support
- [ ] Add better error handling
- [ ] Add type definitions for all responses

### Phase 2: API Endpoints
- [ ] Create `app/api/pesapal/refund/route.ts` - Refund processing
- [ ] Create `app/api/pesapal/ipn/route.ts` - IPN handler
- [ ] Enhance `app/api/pesapal/callback/route.ts` - Better state management
- [ ] Create `app/api/pesapal/verify/route.ts` - Payment verification

### Phase 3: UI Components
- [ ] Create `components/checkout/pesapal-payment-form.tsx`
- [ ] Update `components/checkout/checkout-form.tsx` - Add Pesapal option
- [ ] Create `components/checkout/payment-pending.tsx`
- [ ] Create `app/orders/[id]/payment/page.tsx` - Payment status page

### Phase 4: Integration
- [ ] Update checkout page to handle Pesapal redirect
- [ ] Add Pesapal to payment method validation
- [ ] Create success/failure pages
- [ ] Add admin payment management

---

## Detailed Implementation Steps

### Step 1: Enhanced Pesapal Service
```typescript
// lib/pesapal.ts - Add these methods:
- refundOrder(params) - Process refunds
- registerIPN(url, type) - Register callback URL
- getTransactionDetails(trackingId) - Get full transaction info
```

### Step 2: Refund API
```typescript
// app/api/pesapal/refund/route.ts
POST /api/pesapal/refund
- Requires admin authentication
- Processes refund to customer
- Updates order payment status
```

### Step 3: Pesapal Payment Form Component
```typescript
// components/checkout/pesapal-payment-form.tsx
- Select payment method (Card, M-Pesa, Bank)
- Show payment amount
- Handle redirect to Pesapal
- Show loading state
- Handle success/failure
```

### Step 4: Checkout Integration
```typescript
// Update checkout-form.tsx
- Add Pesapal to RadioGroup options
- Add handlePesapalPayment function
- Redirect to Pesapal or show inline form
```

### Step 5: Order Confirmation
```typescript
// app/orders/[id]/payment/page.tsx
- Check payment status
- Show success/failure message
- Allow retry if failed
- Link to order details
```

---

## File Changes Summary

### New Files to Create:
1. `lib/pesapal.ts` - Enhanced service
2. `app/api/pesapal/refund/route.ts` - Refund API
3. `app/api/pesapal/ipn/route.ts` - IPN handler
4. `app/api/pesapal/verify/route.ts` - Verification API
5. `components/checkout/pesapal-payment-form.tsx` - Payment UI
6. `components/checkout/payment-pending.tsx` - Pending state
7. `app/orders/[id]/payment/page.tsx` - Payment status page

### Files to Modify:
1. `components/checkout/checkout-form.tsx` - Add Pesapal option
2. `app/checkout/page.tsx` - Update checkout flow
3. `app/api/pesapal/callback/route.ts` - Enhance handling
4. `app/orders/[id]/page.tsx` - Update order details

---

## Testing Checklist
- [ ] Submit order and redirect to Pesapal
- [ ] Complete payment with test card
- [ ] Receive callback and update order status
- [ ] View payment success page
- [ ] Process refund (admin)
- [ ] Handle failed payment
- [ ] Retry payment

---

## Environment Variables Required
```env
PESAPAL_CONSUMER_KEY=your_consumer_key
PESAPAL_CONSUMER_SECRET=your_consumer_secret
PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3
PESAPAL_CALLBACK_URL=https://yourdomain.com/api/pesapal/callback
```
 -->
