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
- [x] 2.6 Update `app/api/shipping/calculate/route.ts` to align tax calc with frontend

## Follow-up
- [ ] Run type check / build to verify no errors
- [ ] Test checkout flow
- [ ] Verify shipping totals match across cart, checkout, and API
 --> -->
