# Enkaji Mobile App Completion TODO

## Priority: High (Buyer Shopping Flows)
- [ ] 1. Create `(tabs)/shop.tsx`: Categories list + product grid/search bar
- [ ] 2. Create `(tabs)/cart.tsx`: Cart list/totals/proceed to checkout
- [ ] 3. Create `(tabs)/home.tsx`: Hero banner + featured products/categories
- [ ] 4. Add category screen `categories/[slug].tsx`
- [ ] 5. Enhance profile `(tabs)/profile.tsx`: Orders, addresses, favorites, subscription status

## Priority: High (API & State)
- [ ] 6. Implement `lib/api.ts`: Hooks/services for /api/products, /api/cart, /api/categories, /api/favorites
- [ ] 7. Update `lib/store.ts`: Zustand slices for cart, products, user profile
- [ ] 8. Integrate Clerk auth in `(auth)/` and root _layout.tsx

## Priority: Medium (Components/UI)
- [ ] 9. Create `components/ui/ProductCard.tsx`, `CartItem.tsx`, `CategoryCard.tsx`, `SearchBar.tsx`
- [ ] 10. Add tab icons/labels in `(tabs)/_layout.tsx`
- [ ] 11. Add loading/error states with spinners/toasts

## Priority: Low (Advanced)
- [ ] 12. RFQ/Bulk Orders screens
- [ ] 13. Notifications integration
- [ ] 14. Offline caching
- [ ] 15. Full assets + EAS build/test

Progress: Mark [x] as completed. Test with `npx expo start` after each major step.
