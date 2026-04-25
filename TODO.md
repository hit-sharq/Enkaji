<!-- # Fix Plan — Pesapal Auth & Order Totals Consistency

## Issue 1: Pesapal Auth Failed
- [x] 1.1 Add credential validation in `lib/pesapal.ts`
- [x] 1.2 Improve error handling in `getAccessToken()` to surface Pesapal's actual error field
- [x] 1.3 Add debug logging for environment mode and credential presence

## Issue 2: Inconsistent Order Totals
- [x] 2.1 Create shared `hooks/use-order-totals.ts` hook
- [ ] 2.2 Update `components/cart/cart-summary.tsx` to use shared hook and enhanced shipping
- [ ] 2.3 Update `components/checkout/order-summary.tsx` to use shared hook
- [ ] 2.4 Update `components/checkout/checkout-form.tsx` to use shared hook and remove inline hardcoded summary
- [ ] 2.5 Update `app/checkout/page.tsx` to pass consistent subtotal
- [ ] 2.6 Update `app/api/checkout/initiate-payment/route.ts` to align totals with frontend

## Mobile App Update System
- [x] 3.1 Create `/api/mobile/version` endpoint for version checking
- [x] 3.2 Create `useAppUpdates` hook for OTA + native update detection
- [x] 3.3 Create `UpdateBanner` component for in-app notifications
- [x] 3.4 Integrate update system into mobile app layout

## Follow-up
- [ ] Test checkout flow
- [ ] Verify shipping totals match across cart, checkout, and API
- [ ] Deploy web app with new API endpoints
- [ ] Build new APK with update system
- [ ] Update `NEXT_PUBLIC_APK_DOWNLOAD_URL` env var
 -->
