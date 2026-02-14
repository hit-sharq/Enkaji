<!-- # Payout Functionality Implementation Plan

## Information Gathered:
- API endpoints already exist:
  - `GET /api/seller/payouts` - Get seller payouts
  - `POST /api/seller/payouts/request` - Request payout
  - `GET /api/admin/payouts` - Get all payout requests for admin
  - `POST /api/admin/payouts/[id]/approve` - Approve/reject payout

## Plan:

### Step 1: Add Earnings & Payouts Tab to Seller Dashboard
- Add new tab to seller-dashboard.tsx
- Show seller earnings stats (total earned, pending, paid)
- List all payout requests and their status
- Add "Request Payout" button that opens a modal/form

### Step 2: Add Payouts Tab to Admin Dashboard
- Add new tab to admin-dashboard.tsx
- Show pending payout requests with approve/reject buttons
- Show payout history and stats

## Dependent Files to Edit:
- `components/dashboard/seller-dashboard.tsx` - Add earnings/payouts tab
- `components/dashboard/admin-dashboard.tsx` - Add payouts management tab

## Followup Steps:
- Test payout request flow
- Verify admin can approve/reject payouts
 -->
