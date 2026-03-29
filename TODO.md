<!-- # Enkaji Project TODO - Remaining Tasks for Completion
*Last Updated: $(date)* | Progress Tracking for 4 Systems

## 📋 Legend
- [ ] **TODO** - Not started
- [x] **DONE** - Completed
- **🔗** References files/PRs
- **⏱️** Est. effort (hours)

## System 1: Core Enkaji E-commerce (90% Complete)
Core flows: Auth → Browse → Cart → Pesapal → Orders → Delivery.

```
[x] Implement post-order inventory deduction ✅
  🔗 app/api/orders/route.ts (Prisma tx added)
  ⏱️ 2h (DONE)

[x] Add email notifications ✅
  - Product approvals, bulk orders, Pesapal callbacks via lib/email.ts
  ⏱️ 4h (DONE)

[x] Shipping integration polish ✅
  🔗 lib/shipping-enhanced.ts integrated in orders/route.ts (auto-calc zones/providers)
  ⏱️ 3h (DONE)

[x] RFQ flow UI ✅
  🔗 app/rfq/page.tsx (complete), app/rfq/[id]/page.tsx (detail view)
  ⏱️ 6h (DONE)
```

**Est. Total: 15h (ALL DONE) ✅**

## System 2: Admin Dashboard (75% Complete)
Manage users/products/sellers/payouts.

```
[ ] admin/blog/ - Full CRUD
  🔗 app/admin/blog/page.tsx (stub)
  ⏱️ 8h

[ ] admin/coupons/ - Pages + APIs
  🔗 Coupon model ready
  ⏱️ 6h

[ ] admin/payouts/ - Approval flows/UI
  🔗 app/api/admin/payouts/[id]/approve/route.ts (TODO actual payout)
  ⏱️ 5h

[ ] admin/users/ - List/search/ban
  ⏱️ 4h

[ ] Disputes resolution UI
  🔗 app/api/admin/disputes/[id]/resolve/route.ts (TODO refund)
  ⏱️ 3h
```

**Est. Total: 26h**

## System 3: Lumyn Logistics (85% Complete)
Driver/delivery management + customer tracking.

```
Driver portal: app/lumyn/drivers/ ✅
  - List available jobs
  - Accept/reject deliveries
  - Profile + earnings
  ⏱️ 12h (DONE)

[ ] Customer delivery tracking: app/lumyn/deliveries/
  - Track status/map
  - Rate driver
  ⏱️ 8h

[ ] Real-time features
  - WebSockets (Pusher) for location updates
  - Map integration (Leaflet)
  ⏱️ 10h

[ ] Driver payouts UI/APIs
  🔗 LumynDriverEarning model, app/lumyn/admin/payouts/
  ⏱️ 4h

[ ] KYC onboarding flow
  🔗 LumynDriver model (kycVerified)
  ⏱️ 5h
```

**Est. Total: 39h**

## System 4: Mobile Apps (10% Complete)
Enkaji + Lumyn Native (Expo RN).

```
[ ] enkaji-mobile/
  - Core screens: Home, Products, Cart, Profile
  - Pesapal integration (WebView?)
  - Push notifications
  ⏱️ 40h

[ ] lumyn-flow-mobile/
  - Driver app: Jobs, Navigation, Earnings
  - Customer: Track order, Rate
  ⏱️ 35h

[ ] Shared lib (auth, API client)
  ⏱️ 5h
```

**Est. Total: 80h**

## Next Steps After TODOs
```
[ ] Run prisma db push
[ ] npm run dev - Test flows
[ ] tsx scripts/seed-lumyn.ts
[ ] Deploy to Vercel
[ ] Create CHANGELOG.md
```

**Overall Est. Time: 160h** | Track progress by checking off items!
 -->
