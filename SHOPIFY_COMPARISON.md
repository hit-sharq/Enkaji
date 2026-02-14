<!-- # Enkaji - Shopify Comparison & Revenue Strategy

## Executive Summary

Enkaji is a well-structured B2B marketplace with strong foundations. To compete with Shopify-style multi-vendor marketplaces, several features need to be implemented. This document outlines the current state, gaps, and monetization strategies.

---

## ✅ What's Already Implemented

### Core E-commerce Features
- ✅ User Authentication (Clerk)
- ✅ Product Management (CRUD, categories, inventory)
- ✅ Shopping Cart
- ✅ Checkout & Payment Processing (Pesapal + M-Pesa)
- ✅ Order Management
- ✅ Seller Profiles & Verification
- ✅ Artisan Profiles
- ✅ Categories & Filtering
- ✅ Search Functionality
- ✅ Reviews & Ratings System
- ✅ Favorites/Wishlist
- ✅ Bulk Orders
- ✅ RFQ (Request for Quotes)
- ✅ Blog/Content Management
- ✅ Newsletter Subscriptions
- ✅ Contact Forms
- ✅ FAQ System
- ✅ Testimonials
- ✅ Admin Dashboard
- ✅ Mobile App (React Native/Expo)
- ✅ Shipping Calculations (weight-based, COD fees)
- ✅ Refund Management

### Technical Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL (Prisma ORM)
- Clerk Authentication
- Pesapal Payment Gateway
- Cloudinary (Media)
- Vercel Deployment

---

## ❌ What's Missing (Shopify-Like Features)

### Critical (Must Have)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Multi-Vendor Storefronts** | Each seller gets their own branded storefront/URL | HIGH |
| **Discount Codes/Coupons** | Create and manage promotional codes | HIGH |
| **Product Bundles** | Group products together with special pricing | HIGH |
| **Advanced SEO** | Meta tags, OpenGraph, sitemaps, structured data | HIGH |
| **Abandoned Cart Recovery** | Emails to recover incomplete purchases | HIGH |
| **Inventory Alerts** | Low stock notifications for sellers | HIGH |
| **Seller Analytics** | Sales reports, traffic analytics, conversion tracking | HIGH |

### Important (Should Have)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Loyalty Points System** | Reward customers for purchases | MEDIUM |
| **Gift Cards** | Digital gift cards for purchases | MEDIUM |
| **Product Recommendations** | AI-powered "you may also like" | MEDIUM |
| **Live Chat Support** | Real-time customer support widget | MEDIUM |
| **Advanced Reporting** | Sales, inventory, customer reports | MEDIUM |
| **Email Marketing Integration** | Klaviyo/Mailchimp integration | MEDIUM |
| **Waitlist** | Notify users when out-of-stock items return | MEDIUM |

### Nice to Have

| Feature | Description | Priority |
|---------|-------------|----------|
| **Multi-language Support** | Swahili, English | LOW |
| **Currency Conversion** | KES, USD, EUR | LOW |
| **POS Integration** | Point of sale for physical stores | LOW |
| **Dropshipping Tools** | Supplier integration | LOW |
| **Auction Mode** | Bidding system for products | LOW |
| **Blog Monetization** | Sponsored content | LOW |

---

## 💰 Revenue & Monetization Strategy

### Current Revenue Streams

#### 1. **Commission/Platform Fees** (Primary)
```typescript
// Current implementation in SellerPayout model
// 5% platform commission on each sale
platformFee: Decimal // Platform commission (5%)
processingFee: Decimal // Payment processing fee
```
- **Suggested**: 5-15% commission on each transaction
- **Implementation**: Automatically deducted from seller payouts

#### 2. **Subscription Plans**
```typescript
enum SubscriptionPlan {
  BASIC      // Free - limited products
  PREMIUM    // KES 2,000/month - more products + features
  ENTERPRISE // Custom pricing
}
```
- Basic: Up to 20 products
- Premium: Up to 100 products + analytics + featured listings
- Enterprise: Unlimited + API access + dedicated support

#### 3. **Listing Fees**
- First 20 products: Free
- Additional products: KES 50/product/month

#### 4. **Verified Seller Badges**
- Verification fee: KES 1,000 (one-time)
- Includes: Verified badge, priority support, better search ranking

#### 5. **Featured Listings**
- Homepage featured: KES 500/day
- Category featured: KES 200/day
- Search results top: KES 100/day

#### 6. **Advertising/Sponsored Products**
- Pay-per-click ads in search results
- Sponsored product slots on category pages
- Banner ads on homepage

### Proposed Revenue Features

#### 7. **Premium Search & Discovery**
- Featured products in search
- Category sponsorship
- Brand pages (premium)

#### 8. **Transaction Fees**
- Cash on Delivery: +2% fee
- Cross-border transactions: +1.5% fee
- Instant payouts: KES 100 fee

#### 9. **Value-Added Services**
- Professional product photography: KES 500/product
- SEO optimization service: KES 2,000/product
- Store setup assistance: KES 5,000 one-time
- Marketing consultation: KES 10,000/month

#### 10. **B2B Specific Revenue**
- Trade shows & events listing
- RFQ premium placement
- Wholesale directory
- Import/Export documentation service

---

## 📋 Implementation Roadmap

### Phase 1: Core Revenue (Week 1-4)

1. **Multi-Vendor Storefronts**
   - Create `/sellers/[id]` dynamic routes
   - Custom storefront pages per seller
   - Seller subdomain support (seller.enkaji.co.ke)

2. **Discount Codes System**
   - Database model for coupons
   - API for creating/managing codes
   - Apply at checkout

3. **Commission Tracking**
   - Enhanced payout system
   - Automatic fee calculation
   - Seller wallet system

### Phase 2: Growth Features (Week 5-12)

4. **Product Bundles**
5. **Gift Cards**
6. **Loyalty Points**
7. **Abandoned Cart Emails**
8. **Advanced Analytics Dashboard**

### Phase 3: Scale (Week 13-24)

9. **AI Recommendations**
10. **Live Chat Support**
11. **Multi-language (Swahili)**
12. **Mobile App Enhancements**

---

## 🛠️ Immediate Action Items

### This Week
1. ☐ Implement coupon/discount code system
2. ☐ Create seller storefront pages
3. ☐ Add commission tracking to orders
4. ☐ Build seller analytics dashboard

### This Month
5. ☐ Launch subscription plans
6. ☐ Implement product bundles
7. ☐ Add abandoned cart recovery
8. ☐ Enhanced SEO optimization

---

## 📊 Estimated Revenue Potential

| Revenue Stream | Monthly Potential (KES) |
|----------------|-------------------------|
| Commission (5% on 10M GMV) | 500,000 |
| Subscription Plans | 200,000 |
| Featured Listings | 100,000 |
| Verified Badges | 50,000 |
| Advertising | 75,000 |
| **Total** | **925,000/month** |

*Based on projected 10M KES monthly GMV*

---

## 🔧 Technical Implementation Notes

### Database Extensions Needed
```prisma
model Coupon {
  id          String   @id @default(cuid())
  code        String   @unique
  type        CouponType // PERCENTAGE, FIXED
  value       Decimal
  minOrder    Decimal?
  maxUses     Int?
  usedCount   Int      @default(0)
  validFrom   DateTime
  validUntil  DateTime
  isActive    Boolean  @default(true)
  // applicable to specific categories/sellers or all
}

model SellerWallet {
  id          String   @id @default(cuid())
  sellerId    String
  balance     Decimal  @default(0)
  pending     Decimal  @default(0)
  currency    String   @default("KES")
}

model Bundle {
  id          String   @id @default(cuid())
  name        String
  description String?
  products    BundleProduct[]
  price       Decimal  // Bundle price (usually discounted)
  discount    Decimal  // Discount percentage
  isActive    Boolean  @default(true)
}
```

---

## Conclusion

Enkaji has excellent foundations for a Shopify-like marketplace. The immediate focus should be:
1. **Multi-vendor storefronts** - The core marketplace experience
2. **Discount/promotion system** - Drive sales
3. **Revenue infrastructure** - Commissions, subscriptions, fees

The system can generate significant revenue through commissions, subscriptions, and value-added services while providing excellent value to Kenyan businesses.
 -->
