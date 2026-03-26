# Enkaji Trade Kenya

## Overview
Enkaji Trade Kenya is a premier B2B marketplace platform built for the Kenyan market, connecting verified suppliers, artisans, and businesses across all 47 counties. It features product listings, artisan profiles, seller dashboards, order management, reviews, bulk order requests, and payment integrations.

## Tech Stack

### Web App (Root)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL via Prisma ORM (`@prisma/client` v6)
- **Auth**: Clerk (`@clerk/nextjs`)
- **Styling**: Tailwind CSS + Radix UI / shadcn/ui components
- **Payments**: Pesapal (M-Pesa + card) + Stripe
- **Image Storage**: Cloudinary + Vercel Blob
- **State/Cache**: Redis
- **Security**: next-secure-headers, CSRF, rate limiting

### Mobile App (`enkaji-mobile/`)
- **Framework**: Expo (~54.0.0) + Expo Router (file-based navigation)
- **Language**: TypeScript + React Native (0.81.5)
- **Auth**: Clerk (`@clerk/clerk-expo`) with `expo-secure-store` token cache
- **State**: Zustand (`lib/store.ts`)
- **Theme**: Brand colors in `lib/theme.ts` (primary maroon #8B2635, gold #EAB308)
- **HTTP**: Axios (`lib/api.ts`) — connects to web app backend
- **Payments**: Pesapal via WebView (`app/payment-webview.tsx`)

## Project Structure

### Web App
- `app/` — Next.js App Router pages and API routes
- `components/` — Shared React components (organized by domain)
- `lib/` — Utility functions (auth, db, pesapal, etc.)
- `prisma/` — Prisma schema and migrations
- `public/` — Static assets

### Mobile App (`enkaji-mobile/`)
- `app/_layout.tsx` — Root layout with ClerkProvider + all stack screen declarations
- `app/(auth)/` — Auth screens: sign-in, sign-up, verify-email, forgot-password
- `app/(tabs)/` — Tab navigation: Home, Explore/Search, Cart, Orders, Profile
- `app/product/[id].tsx` — Product detail with review submission modal
- `app/orders/[id].tsx` — Order detail with progress tracker and price summary
- `app/checkout.tsx` — Full checkout flow (shipping, payment selection, order creation)
- `app/payment-webview.tsx` — WebView for Pesapal payment completion
- `app/favorites.tsx` — Saved favourite products
- `app/notifications.tsx` — Notification feed
- `app/settings.tsx` — Account settings
- `app/help.tsx` — Help & Support
- `app/shipping-addresses.tsx` — Saved shipping addresses
- `app/become-seller.tsx` — Become a seller info screen (registration done via web)
- `app/seller/dashboard.tsx` — Seller analytics + quick actions
- `app/seller/products.tsx` — Seller product list (edit, toggle, delete)
- `app/seller/products/add.tsx` — Add new product form
- `app/seller/orders.tsx` — Customer orders with status tabs
- `app/seller/payouts.tsx` — Payout history + request payout modal
- `app/admin/index.tsx` — Admin panel
- `lib/api.ts` — Axios API client (with Bearer token auth)
- `lib/store.ts` — Zustand stores: auth, cart, products, orders, favorites, UI
- `lib/theme.ts` — Design tokens and common styles
- `types/index.ts` — Shared TypeScript interfaces

## Development

### Running Locally
- **Web**: `npm run dev` (port 5000)
- **Mobile**: `cd enkaji-mobile && node_modules/.bin/expo start --web --port 3001`

### Database
```bash
npx prisma generate
npx prisma db push       # Apply schema
npx prisma migrate deploy  # Run migrations
```

## Environment Variables Required

### Web App
- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `CLERK_SECRET_KEY` — Clerk secret key
- `NEXT_PUBLIC_APP_URL` — Public app URL (for Pesapal callbacks)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `PESAPAL_CONSUMER_KEY`, `PESAPAL_CONSUMER_SECRET`, `PESAPAL_API_URL`
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional)
- `REDIS_URL` (optional)

### Mobile App
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — Same Clerk app key as web
- `EXPO_PUBLIC_API_URL` — Web app URL (defaults to http://localhost:5000)

## Key Features
- App download page at `/download` with phone mockup, installation guide, and APK download button
- B2B/B2C marketplace with product listings, categories, and search
- Seller and artisan registration/profiles with admin approval
- Shopping cart (local + server-synced), checkout, and order management
- M-Pesa / card payments via Pesapal (with WebView on mobile)
- Admin panel with approval workflows and analytics
- Reviews, blog, testimonials, RFQ (bulk order requests)
- Newsletter subscriptions and contact form
- RBAC: BUYER, SELLER, ARTISAN, ADMIN, MODERATOR, FINANCE_MANAGER, etc.

## Deployment
Configured for Replit Autoscale. Build: `npx prisma generate && next build`. Run: `next start`.
