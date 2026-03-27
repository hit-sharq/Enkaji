# Lumyn Flow Setup & Deployment Guide

## 1. Database Migration

Run the SQL migration to create all Lumyn tables:

```bash
# Using Prisma
npx prisma migrate dev --name add_lumyn_flow
npx prisma db push
```

## 2. Environment Variables

Add these to `.env.local`:

```env
LUMYN_MAPBOX_API_KEY=your_mapbox_public_token
LUMYN_MAX_DELIVERY_RADIUS_KM=50
LUMYN_BASE_FEE=150
LUMYN_PER_KM_RATE=20
LUMYN_COMMISSION_PERCENT=20
LUMYN_ENABLE_CASH_PAYMENTS=true

EXPO_PUBLIC_LUMYN_API_URL=https://your-deployed-app.vercel.app
EXPO_PUBLIC_MAPBOX_API_KEY=your_mapbox_public_token
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

## 3. Backend Deployment

Your API is already in Next.js at `/app/api/lumyn/*`:

```bash
vercel deploy
```

## 4. Mobile App Setup

```bash
cd lumyn-flow-mobile
npm install --legacy-peer-deps
eas init          # Get EAS project ID
eas login
eas build --platform all   # First build
```

## 5. Testing Locally

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Mobile web
cd lumyn-flow-mobile && npx expo start --web --port 3001
```

## 6. Launch Checklist

### MVP Launch (Week 1-2)
- [ ] Database migrated
- [ ] Backend API deployed to Vercel
- [ ] Mobile app built for iOS & Android
- [ ] 5-10 beta drivers recruited
- [ ] Nairobi CBD coverage active
- [ ] Payment processing working (Pesapal)

### Phase 2 (Week 3-4)
- [ ] Enkaji integration enabled
- [ ] Sellers can opt-in to Lumyn
- [ ] Revenue sharing automated

---

**Status:** Ready for implementation
