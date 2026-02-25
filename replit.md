# Enkaji Trade Kenya

## Overview
Enkaji Trade Kenya is a B2B marketplace platform built with Next.js 14, connecting verified suppliers across Kenya. It features product listings, artisan profiles, seller dashboards, order management, reviews, bulk order requests, and payment integrations.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: Clerk (via `@clerk/nextjs`)
- **Styling**: Tailwind CSS + Radix UI components (shadcn/ui)
- **Payments**: Pesapal + Stripe
- **Image Storage**: Cloudinary + Vercel Blob
- **Email/Cache**: Redis

## Project Structure
- `app/` - Next.js App Router pages and API routes
- `components/` - Shared React components
- `lib/` - Utility functions and shared logic
- `hooks/` - Custom React hooks
- `prisma/` - Prisma schema and migrations
- `public/` - Static assets
- `styles/` - Global CSS
- `types/` - TypeScript type definitions
- `scripts/` - Utility scripts
- `enkaji-mobile/` - Mobile app directory

## Development
The app runs on port 5000 with `npm run dev -- --port 5000 --hostname 0.0.0.0`.

## Database
Uses Replit's built-in PostgreSQL. Run migrations with:
```
npx prisma migrate deploy
npx prisma generate
```

## Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string (auto-set by Replit)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `CLOUDINARY_*` - Cloudinary credentials for image upload
- `PESAPAL_*` - Pesapal payment gateway credentials
- `STRIPE_*` - Stripe payment credentials (optional)
- `REDIS_URL` - Redis connection URL (optional)

## Key Features
- B2B marketplace with product listings
- Seller and artisan registration/profiles
- Shopping cart, checkout, and order management
- Admin panel with approval workflows
- Blog, reviews, and testimonials
- Bulk order requests (RFQ system)
- Newsletter subscriptions
- Analytics dashboard

## Deployment
Configured for Replit Autoscale deployment. Build: `npx prisma generate && npm run build`. Run: `npm start`.
