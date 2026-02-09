<!-- # Pesapal v3 Payment Integration - Implementation Checklist

## Phase 1: Enhanced Pesapal Service ✅ COMPLETED
- [x] 1.1 Enhance lib/pesapal.ts - Add refund functionality
- [x] 1.2 Add registerIPN method
- [x] 1.3 Add getTransactionDetails method
- [x] 1.4 Add better error handling & types
- [x] 1.5 Add demo/live mode support
- [x] 1.6 Create lib/pesapal-helpers.ts

## Phase 2: API Endpoints ✅ COMPLETED
- [x] 2.1 Create app/api/pesapal/refund/route.ts
- [x] 2.2 Create app/api/pesapal/verify/route.ts
- [x] 2.3 Enhance app/api/pesapal/callback/route.ts
- [x] 2.4 Create app/api/pesapal/stk-push/route.ts (M-Pesa)

## Phase 3: UI Components ✅ COMPLETED
- [x] 3.1 Create components/checkout/pesapal-payment-form.tsx
- [x] 3.2 Create components/checkout/payment-pending.tsx
- [x] 3.3 Update components/checkout/checkout-form.tsx

## Phase 4: Database Schema ✅ COMPLETED
- [x] 4.1 Add PesapalRefund model
- [x] 4.2 Add RefundMethod and RefundStatus enums
- [x] 4.3 Fix PesapalIPN model

## Phase 5: Post-Implementation
- [ ] 5.1 Run `npx prisma generate` to update Prisma client
- [ ] 5.2 Run `npx prisma db push` to update database schema
- [ ] 5.3 Test order submission
- [ ] 5.4 Test payment completion
- [ ] 5.5 Test refund functionality
- [ ] 5.6 Configure environment variables

## Environment Variables Required
```env
PESAPAL_CONSUMER_KEY=your_consumer_key
PESAPAL_CONSUMER_SECRET=your_consumer_secret
PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3
PESAPAL_CALLBACK_URL=https://yourdomain.com/api/pesapal/callback
```

## API Endpoints Created
- `POST /api/pesapal/submit-order` - Submit order for payment
- `GET /api/pesapal/callback` - Handle payment callback
- `POST /api/pesapal/callback` - Handle IPN notifications
- `GET /api/pesapal/verify` - Verify payment status
- `POST /api/pesapal/refund` - Process refunds (admin)
- `POST /api/pesapal/stk-push` - Initiate M-Pesa STK Push
 -->
