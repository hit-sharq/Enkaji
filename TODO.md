<!-- # Fix Plan — Pesapal Auth & Order Totals Consistency

## Issue 1: Pesapal Auth Failed
- [x] 1.1 Add credential validation in `lib/pesapal.ts`
- [x] 1.2 Improve error handling in `getAccessToken()` to surface Pesapal's actual error field
- [x] 1.3 Add debug logging for environment mode and credential presence

## Issue 2: Inconsistent Order Totals (Web)
- [x] 2.1 Create shared `hooks/use-order-totals.ts` hook
- [x] 2.2 Update `components/cart/cart-summary.tsx` to use shared hook and enhanced shipping
- [x] 2.3 Update `components/checkout/order-summary.tsx` to use shared hook
- [x] 2.4 Update `components/checkout/checkout-form.tsx` to use shared hook and remove inline hardcoded summary
- [x] 2.5 Update `app/checkout/page.tsx` to pass consistent subtotal
- [x] 2.6 Update `app/api/shipping/calculate/route.ts` to align tax calc with frontend

## Issue 3: Mobile App Checkout
- [x] 3.1 Add `totalWeight` to mobile cart store (`enkaji-mobile/lib/store.ts`)
- [x] 3.2 Add `calculateShipping` API method to mobile client (`enkaji-mobile/lib/api.ts`)
- [x] 3.3 Update mobile checkout to call shipping API instead of hardcoded `totalPrice > 5000 ? 0 : 500`
- [x] 3.4 Remove `Math.round()` from mobile tax to match web
- [x] 3.5 Show shipping loading indicator in mobile checkout UI

## Issue 4: Use Current Location (Web Checkout)
- [x] 4.1 Add `isLocating` state with loading indicator on the button
- [x] 4.2 Add controlled `shippingAddressLine` state and wire to Address input
- [x] 4.3 Add controlled `shippingZipCode` state and wire to ZIP input
- [x] 4.4 Fix geolocation callback to fill ALL fields: address, city, state, zip, country
- [x] 4.5 Add error handling for browsers without geolocation support
- [x] 4.6 Add specific error messages for geolocation permission errors (denied/unavailable/timeout)
- [x] 4.7 Add `Accept-Language` header to Nominatim request for consistent responses
- [x] 4.8 Add `enableHighAccuracy: false` and 10s timeout for faster/better location retrieval

## Issue 5: Reviews & Favorites
- [x] 5.1 Fix Reviews API (`app/api/reviews/route.ts`) to handle `sortBy` param (newest/oldest/highest/lowest/helpful)
- [x] 5.2 Fix Reviews API to handle `search` param (searches title and comment fields)
- [x] 5.3 Add DELETE handler to Favorites API (`app/api/favorites/route.ts`) for mobile app compatibility

## Issue 6: Dedicated IPN Endpoint
- [x] 6.1 Create `app/api/pesapal/ipn/route.ts` to match `PESAPAL_IPN_URL` in production

## Follow-up
- [ ] Run `npx prisma generate` to regenerate Prisma Client types (resolves TS errors in IPN route)
- [ ] Run type check / build to verify no errors
- [ ] Test checkout flow on web
- [ ] Test checkout flow on mobile app
- [ ] Verify shipping totals match across cart, checkout, and API
- [ ] Test review sorting and search on product pages
- [ ] Test favorites add/remove on both web and mobile
 --> --> --> -->
