# Performance Optimizations

This document outlines performance improvements implemented in Enkaji for both web and mobile.

## Mobile (Expo)

### 1. Skeleton Loaders
All screens show shimmering skeleton placeholders while loading data, improving perceived performance.

**Components:**
- `components/ui/skeleton.tsx` - Generic skeleton with fade animation
- `components/product/product-card.tsx` - Memoized product card with lazy image loading

### 2. FlatList Optimizations
- `components/ui/optimized-flatlist.tsx` - Memoized list with:
  - `initialNumToRender`: Only renders visible items
  - `windowSize`: Controls render window size
  - `removeClippedSubviews`: Unmounts off-screen items (Android)
  - `viewabilityConfig`: Tracks visible items for analytics

**Usage:**
```tsx
import { OptimizedFlatList } from '@/components/ui/optimized-flatlist'

<OptimizedFlatList
  data={products}
  renderItem={({ item }) => <ProductCard item={item} />}
  getKey={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={6}
/>
```

### 3. Image Optimization
- Future: Switch to `expo-image` for progressive loading, caching, and priority hints
- Current: Basic `react-native` Image with `progressiveRenderingEnabled={true}`

### 4. Code Splitting (Expo Router)
Expo Router uses file-based routing which automatically code-splits by route. Heavy screens (seller dashboard, admin) are separate bundles loaded only when navigated to.

### 5. Animation Performance
- All animations use `react-native-reanimated` (runs on UI thread)
- Worklets ensure animations don't block JS thread
- Staggered animations with `useStaggerAnimation` hook

## Web (Next.js)

### 1. Bundle Splitting
Dynamic imports for route-level code splitting:

```tsx
// routes/seller/products/page.tsx
const SellerProducts = dynamic(() => import('@/components/seller/products'), {
  loading: () => <ProductCardSkeleton />,
  ssr: false,
})
```

### 2. Image Optimization
Next.js Image component:
```tsx
import Image from 'next/image'

<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={300}
  priority={index < 4} // Prioritize first 4 images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 3. Font Optimization
`next/font` with `Inter` (preload + subset optimization) already configured in `layout.tsx`.

### 4. Database Query Optimization
- Prisma queries use `select` to fetch only needed fields
- `include` optimization for relationships
- Pagination to limit result sets (`take: 20 max`)

### 5. Caching (Redis)
API responses cached at Vercel edge:
- Product listings: 5 min (`stale-while-revalidate`)
- Static pages: 1 hour
- Categories: 1 hour

### 6. Analytics Batching
PostHog events batched and sent asynchronously to avoid blocking UI (configurable in `lib/analytics.ts`).

## Recommendations for Future

1. **Enable Web Vitals monitoring** to track LCP, FID, CLS
2. **Implement service worker** for offline PWAs
3. **Add resource hints** (`preconnect`, `dns-prefetch`) for critical third-party domains
4. **Compress images** automatically during upload (using `sharp`)
5. **Virtualize long lists** (>100 items) with `FlashList` on mobile
6. **Memoize expensive calculations** with `useMemo`/`useCallback`
7. **Profile React components** with React DevTools Profiler

## Metrics to Monitor

| Metric | Target | Tool |
|--------|---------|------|
| Mobile app startup | < 2s | Expo EAS Build metrics |
| Web LCP | < 2.5s | PageSpeed Insights |
| Time to Interactive | < 3.5s | Lighthouse |
| API response time | < 200ms | Vercel Analytics |
| First contentful paint | < 1.5s | Web Vitals |
