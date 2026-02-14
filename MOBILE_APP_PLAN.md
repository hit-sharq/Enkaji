<!-- # Mobile App Implementation Plan - Enkaji Marketplace

## 1. Information Gathered

### System Architecture
- **Web Framework**: Next.js 14 with App Router
- **Authentication**: Clerk (requires Clerk React Native SDK)
- **Database**: PostgreSQL with Prisma ORM (shared)
- **Payments**: Pesapal (M-Pesa, Cards, Bank Transfers)
- **UI Components**: Radix UI + Tailwind CSS (shadcn/ui)

### Core Features (from schema)
- User roles: BUYER, SELLER, ARTISAN, ADMIN
- Products & Categories with CRUD
- Cart, Orders, Favorites
- Reviews & Ratings with moderation
- Seller/Artisan profiles with verification
- RFQ & Bulk Orders
- Blog & Newsletter
- Payment tracking with Pesapal

### API Endpoints (to consume from mobile)
- `/api/products` - Product CRUD
- `/api/categories` - Categories
- `/api/cart` - Cart management
- `/api/orders` - Order management
- `/api/favorites` - Favorites
- `/api/auth/*` - Auth checks
- `/api/pesapal/*` - Payments
- `/api/seller/*` - Seller features

---

## 2. Plan: Mobile App Structure

### Recommended Tech Stack
- **Framework**: React Native with Expo SDK 52
- **Navigation**: Expo Router (file-based like Next.js)
- **Auth**: Clerk Expo SDK
- **State Management**: React Context + Zustand
- **HTTP Client**: Axios or Fetch
- **UI**: React Native Paper (Material Design) or custom components
- **Database**: Same Prisma database via REST API

### Mobile App Directory Structure
```
enkaji-mobile/
├── app/                    # Expo Router pages (like Next.js app dir)
│   ├── (tabs)/             # Tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # Home/Shop
│   │   ├── search.tsx
│   │   ├── cart.tsx
│   │   ├── orders.tsx
│   │   └── profile.tsx
│   ├── (auth)/             # Auth screens
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── product/
│   │   └── [id].tsx
│   ├── checkout/
│   ├── seller/
│   │   ├── dashboard.tsx
│   │   └── products/
│   └── admin/
├── components/            # Reusable UI components
├── lib/                   # API client, utilities
│   ├── api.ts             # Axios/fetch wrapper
│   ├── auth.ts            # Auth helpers
│   └── store.ts           # Zustand stores
├── types/                 # TypeScript types (from web app)
└── package.json
```

---

## 3. Implementation Steps

### Phase 1: Project Setup
1. Initialize Expo project with TypeScript
2. Install dependencies (Clerk, Expo Router, Axios, etc.)
3. Configure app.json for Enkaji branding

### Phase 2: Authentication
1. Integrate Clerk Expo SDK
2. Create auth context/provider
3. Build sign-in/sign-up screens

### Phase 3: Core Shopping Features
1. Home screen with featured products
2. Product listing & search
3. Product detail screen
4. Cart functionality
5. Checkout flow with Pesapal

### Phase 4: User Features
1. User profile management
2. Order history & tracking
3. Favorites management
4. Reviews & ratings

### Phase 5: Seller Features
1. Seller dashboard
2. Product management (CRUD)
3. Order management
4. Earnings & payouts

### Phase 6: Admin Features (Optional)
1. Product approvals
2. User management
3. Analytics overview

---

## 4. Key Integration Points

### API Base URL
- Development: Your local Next.js server (e.g., `http://localhost:3000`)
- Production: Your Vercel deployed URL

### Authentication Flow
1. Mobile app uses Clerk React Native
2. On sign-in, Clerk provides token
3. Send token with API requests
4. Next.js API validates via Clerk

### Data Sync Strategy
- Mobile ↔ REST API ↔ Database
- No direct Prisma access (security)
- API returns JSON, mobile parses to TypeScript types

---

## 5. Dependencies to Install

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "@clerk/clerk-expo": "latest",
    "axios": "^1.7.0",
    "zustand": "^5.0.0",
    "react-native-paper": "^5.12.0",
    "@react-navigation/native": "^7.0.0",
    "react-native-safe-area-context": "5.0.0",
    "react-native-screens": "~4.0.0"
  }
}
```

---

## 6. Follow-up Actions Required

After approval:
1. Run `npx create-expo-app@latest enkaji-mobile --template tabs`
2. Install additional dependencies
3. Copy TypeScript types from web app
4. Create API client wrapper
5. Build screens following the plan
6. Test against local/production API -->
