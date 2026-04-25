<!-- # Fix Plan — Pesapal Auth & Order Totals Consistency

## Issue 1: Pesapal Auth Failed
- [x] 1.1 Add credential validation in `lib/pesapal.ts`
- [x] 1.2 Improve error handling in `getAccessToken()` to surface Pesapal's actual error field
- [x] 1.3 Add debug logging for environment mode and credential presence

## Issue 2: Inconsistent Order Totals
- [x] 2.1 Create shared `hooks/use-order-totals.ts` hook
- [x] 2.2 Update `components/cart/cart-summary.tsx` to use shared hook and enhanced shipping
- [x] 2.3 Update `components/checkout/order-summary.tsx` to use shared hook
- [x] 2.4 Update `components/checkout/checkout-form.tsx` to use shared hook and remove inline hardcoded summary
- [x] 2.5 Update `app/checkout/page.tsx` to pass consistent subtotal
- [x] 2.6 Update `app/api/checkout/initiate-payment/route.ts` to align totals with frontend
- [x] 2.7 Update `app/api/pesapal/ipn/route.ts` to create orders from checkout sessions
- [x] 2.8 Update `app/api/pesapal/callback/route.ts` to create orders from checkout sessions

## Issue 3: Revenue Calculation Accuracy
- [x] 3.1 Update `app/api/admin/stats/route.ts` to filter revenue by `paymentStatus: "PAID"` (already correct)
- [x] 3.2 Update mobile API client (`enkaji-mobile/lib/api.ts`) to support new checkout flow

## Follow-up
- [ ] Fix mobile checkout file (`enkaji-mobile/app/checkout.tsx`) — file got corrupted during editing, needs manual cleanup of JSX closing tags
- [ ] Test checkout flow end-to-end
- [ ] Verify shipping totals match across cart, checkout, and API -->
