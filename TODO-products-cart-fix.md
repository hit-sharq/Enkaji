<!-- # Shop & Cart Bugs Fix Plan

## Status: Analysis Complete

**Issue 1: Shop No Products**
- Cause: API requires `isShopApproved: true` + `isActive: true`
- Files: app/api/products/route.ts, app/shop/page.tsx
- Plan: Change filter to `isActive: true` OR seed approved products

**Issue 2: Cart Delete Not Persisting**
- Cause: Context local state + localStorage, no server sync after DELETE
- Files: components/providers/cart-provider.tsx, components/cart/cart-items.tsx
- Plan: Add `refetchCart()` to context, call after DELETE

## Steps
1. [ ] Edit app/api/products/route.ts - remove `isShopApproved: true`
2. [ ] Add refetch to cart-provider.tsx 
3. [ ] Update cart-items.tsx delete handler to refetch
4. [ ] Test shop shows products
5. [ ] Test cart delete persists on refresh
6. [ ] Deploy

Current: Ready to edit -->
