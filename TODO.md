# Enkaji Project TODO

## Current Task: Fix Expo Web Errors & Product Loading on Web

### Step 1: Disable Web Push Notifications (remove VAPID error)
- [ ] Edit enkaji-mobile/lib/notifications.tsx: Wrap push token/backend/listeners in `if (Platform.OS !== 'web')`
- [ ] Edit enkaji-mobile/app.json: Remove `web.notification.vapidPublicKey`

### Step 2: Test Expo Web
- [ ] `cd enkaji-mobile && npx expo start --web` - Verify no VAPID/console errors

### Step 3: Investigate "Failed to load product" on web
- [ ] Identify failing component/hook (likely use-products, shop/search/product/[id])
- [ ] Check API base URL for web vs mobile
- [ ] Add mock data or platform-specific API

### Step 4: Next.js Prod Check
- [ ] `npm run build && npm run start` in root (test production)

Progress tracked here. Updates after each step.
