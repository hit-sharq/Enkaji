# Payment Prompt System Name Integration

## Task
Make all payment prompts and email templates dynamically use the system name via centralized config.

## Steps
- [x] 1. Understand current hardcoded names across payment & email files
- [x] 2. Create plan for centralized app config
- [x] 3. Create `lib/app-config.ts` with centralized config
- [x] 4. Update `app/api/checkout/initiate-payment/route.ts` description
- [x] 5. Update `app/api/pesapal/submit-order/route.ts` description
- [x] 6. Update `app/api/pesapal/stk-push/route.ts` description
- [x] 7. Update `app/api/subscriptions/route.ts` description
- [x] 8. Update `app/api/seller/subscription/route.ts` description
- [x] 9. Update `app/api/seller/register/route.ts` descriptions
- [x] 10. Update `lib/email.ts` templates (FROM, subjects, footers, URLs)
- [x] 11. Update `app/api/pesapal/callback/route.ts` inline emails
- [x] 12. Update `app/api/pesapal/ipn/route.ts` (uses shared email functions)
- [x] 13. Verify no remaining hardcoded "Enkaji" references in payment descriptions

---

## What Was Done

### Created `lib/app-config.ts`
Centralized config with:
- `APP_NAME` — from `NEXT_PUBLIC_APP_NAME` env, fallback `"Enkaji Trade"`
- `APP_FULL_NAME` — derived as `${APP_NAME} Kenya`
- `APP_TAGLINE` — from `APP_TAGLINE` env
- `APP_URL` — from `NEXT_PUBLIC_APP_URL` env
- `EMAIL_FROM` — from `EMAIL_FROM` env, derived from app name
- `SUPPORT_EMAIL` — from `SUPPORT_EMAIL` env
- `SELLER_DASHBOARD_URL` and `SELLERS_URL` — derived from `APP_URL`

### Updated Payment Descriptions
- `app/api/checkout/initiate-payment/route.ts` — `"Order payment for N item(s) — Enkaji Trade"`
- `app/api/pesapal/submit-order/route.ts` — `"Order #XXXX — Enkaji Trade"`
- `app/api/pesapal/stk-push/route.ts` — `"Payment for order #XXXX — Enkaji Trade"`
- `app/api/subscriptions/route.ts` — `"Premium Seller Subscription — Enkaji Trade Kenya"`
- `app/api/seller/subscription/route.ts` — same
- `app/api/seller/register/route.ts` — same

### Updated Email Templates (`lib/email.ts`)
- `FROM` address now uses `appConfig.EMAIL_FROM`
- All email subjects use `appConfig.APP_NAME` or `appConfig.APP_FULL_NAME`
- All footers use `appConfig.APP_TAGLINE`
- All hardcoded URLs (`https://enkaji.co.ke/...`) replaced with `appConfig.*` URLs
- Support email uses `appConfig.SUPPORT_EMAIL`

### Updated Callback Routes
- `app/api/pesapal/callback/route.ts` — subscription activation email uses appConfig branding
- `app/api/pesapal/ipn/route.ts` — uses updated shared email functions

---

## Environment Variables
Optional `.env` variables to override defaults:
```
NEXT_PUBLIC_APP_NAME="Your Brand"
APP_TAGLINE="Your Tagline"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
EMAIL_FROM="Your Brand <noreply@yourdomain.com>"
SUPPORT_EMAIL="support@yourdomain.com"
```

If not set, everything falls back to `"Enkaji Trade"` defaults.
