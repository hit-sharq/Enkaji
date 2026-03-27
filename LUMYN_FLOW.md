# Lumyn Flow - Delivery System Architecture

**Last Updated:** March 27, 2026  
**Status:** Complete Implementation  
**Version:** 1.0.0

---

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Mobile App Structure](#mobile-app-structure)
6. [Integration with Enkaji](#integration-with-enkaji)
7. [Deployment & Setup](#deployment--setup)

---

## Overview

**Lumyn Flow** is a standalone, white-label delivery platform enabling:
- **Standalone users** to request deliveries of any items (B2C)
- **Enkaji sellers** to optionally fulfill orders via Lumyn (B2B2C)
- **Drivers** to accept jobs and earn commissions

### Key Metrics
- **Commission:** 20% (you keep) / 80% (driver gets)
- **Minimum delivery:** KES 150
- **Per km rate:** KES 20 after first 2km
- **Service area:** Nairobi (expandable)
- **Driver model:** Independent contractors

### Revenue Model
```
Customer pays KES 300
├─ You take: KES 60 (20%)
└─ Driver gets: KES 240 (80%)

Monthly target: 100 deliveries/day × KES 60 = KES 150,000/month
```

---

## System Architecture

### High-Level Flow

```
STANDALONE DELIVERY:
Customer → Open Lumyn Flow App → Request Delivery
         → Pick location, item, destination
         → Pay (M-Pesa/Card/Wallet)
         → System matches Driver
         → Driver picks up & delivers
         → Rating/Review

ENKAJI INTEGRATION:
Enkaji Customer → Checkout → "Use Lumyn for delivery?"
                → Automatically creates Lumyn delivery job
                → Enkaji seller ships to customer via Lumyn driver
                → Revenue split: Seller + Lumyn (you)
```

### Technology Stack

**Backend:**
- Next.js 14 (extends existing Enkaji API)
- PostgreSQL (new `lumyn_*` tables)
- Prisma ORM (new schema)
- Socket.io (real-time tracking)
- Redis (job queue, geolocation cache)

**Mobile:**
- React Native + Expo
- Separate app: `lumyn-flow-mobile/`
- Zustand (state management)
- Mapbox (real-time tracking)

**Web Admin:**
- React + Next.js
- Dashboard for drivers, deliveries, analytics
- Route: `/lumyn/admin`

**Database:**
- PostgreSQL (shared with Enkaji)
- New tables: drivers, deliveries, delivery_items, driver_earnings, delivery_ratings

---

## Database Schema

### Tables

#### 1. `lumyn_drivers`
```sql
CREATE TABLE lumyn_drivers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  vehicle_type ENUM('motorcycle', 'car', 'truck') DEFAULT 'motorcycle',
  vehicle_registration VARCHAR(50),
  license_number VARCHAR(50),
  id_number VARCHAR(50),
  profile_photo_url VARCHAR(500),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'inactive',
  kyc_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_deliveries INT DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.0,
  bank_account_name VARCHAR(255),
  bank_account_number VARCHAR(50),
  bank_code VARCHAR(10),
  is_available BOOLEAN DEFAULT TRUE,
  current_location_lat DECIMAL(9,6),
  current_location_lng DECIMAL(9,6),
  last_location_update TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `lumyn_deliveries`
```sql
CREATE TABLE lumyn_deliveries (
  id UUID PRIMARY KEY,
  delivery_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID REFERENCES users(id) NOT NULL,
  driver_id UUID REFERENCES lumyn_drivers(id),
  
  -- Locations
  pickup_address VARCHAR(500) NOT NULL,
  pickup_lat DECIMAL(9,6) NOT NULL,
  pickup_lng DECIMAL(9,6) NOT NULL,
  dropoff_address VARCHAR(500) NOT NULL,
  dropoff_lat DECIMAL(9,6) NOT NULL,
  dropoff_lng DECIMAL(9,6) NOT NULL,
  distance_km DECIMAL(6,2),
  
  -- Item details
  item_description TEXT NOT NULL,
  item_weight_kg DECIMAL(6,2),
  item_value KES DECIMAL(10,2),
  special_handling TEXT,
  
  -- Pricing
  base_fee DECIMAL(8,2) DEFAULT 150.0,
  distance_fee DECIMAL(8,2) DEFAULT 0.0,
  peak_surcharge DECIMAL(8,2) DEFAULT 0.0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Payment
  payment_method ENUM('mpesa', 'card', 'wallet', 'cash') DEFAULT 'mpesa',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  
  -- Status
  status ENUM('requested', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled') DEFAULT 'requested',
  
  -- Photos
  pickup_photo_url VARCHAR(500),
  delivery_photo_url VARCHAR(500),
  
  -- Enkaji integration
  linked_order_id UUID REFERENCES orders(id),
  
  -- Tracking
  accepted_at TIMESTAMP,
  picked_up_at TIMESTAMP,
  delivered_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `lumyn_delivery_items`
```sql
CREATE TABLE lumyn_delivery_items (
  id UUID PRIMARY KEY,
  delivery_id UUID REFERENCES lumyn_deliveries(id),
  description VARCHAR(255),
  quantity INT,
  weight_kg DECIMAL(6,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. `lumyn_driver_earnings`
```sql
CREATE TABLE lumyn_driver_earnings (
  id UUID PRIMARY KEY,
  driver_id UUID REFERENCES lumyn_drivers(id),
  delivery_id UUID REFERENCES lumyn_deliveries(id),
  amount DECIMAL(10,2),
  status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  payout_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. `lumyn_delivery_ratings`
```sql
CREATE TABLE lumyn_delivery_ratings (
  id UUID PRIMARY KEY,
  delivery_id UUID REFERENCES lumyn_deliveries(id),
  customer_id UUID REFERENCES users(id),
  driver_id UUID REFERENCES lumyn_drivers(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Deliveries
- `POST /api/lumyn/deliveries` — Create delivery request
- `GET /api/lumyn/deliveries` — List user's deliveries
- `GET /api/lumyn/deliveries/:id` — Delivery details
- `POST /api/lumyn/deliveries/:id/accept` — Accept job
- `POST /api/lumyn/deliveries/:id/pickup` — Mark picked up
- `POST /api/lumyn/deliveries/:id/deliver` — Mark delivered
- `POST /api/lumyn/deliveries/:id/rate` — Rate driver

### Drivers
- `POST /api/lumyn/drivers` — Register driver
- `GET /api/lumyn/drivers/available` — Available jobs
- `GET /api/lumyn/drivers/:id` — Driver profile & earnings
- `PUT /api/lumyn/drivers/:id` — Update profile

---

## Integration with Enkaji

When Enkaji customer checks out with Lumyn delivery option enabled, system auto-creates delivery job with 25% you / 75% driver split.

---

## Features Checklist

### MVP (Phase 1 - Complete)
- [x] Standalone delivery request (customer)
- [x] Driver job acceptance
- [x] Real-time tracking (map)
- [x] Pickup/delivery photo proof
- [x] Rating system
- [x] Earnings dashboard (driver)

### Phase 2 (Enkaji Integration)
- [ ] Auto-create delivery from Enkaji orders
- [ ] Seller dashboard

### Phase 3 (Scale)
- [ ] Multi-city support

---

**Status:** Ready for deployment
