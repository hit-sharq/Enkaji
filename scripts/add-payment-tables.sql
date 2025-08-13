-- Complete Payment System Database Schema
-- This adds comprehensive payment tracking for sellers, escrow, and subscriptions

-- Seller Payout Tracking
CREATE TABLE IF NOT EXISTS seller_payouts (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id VARCHAR(255) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    gross_amount DECIMAL(10,2) NOT NULL,
    platform_commission DECIMAL(10,2) NOT NULL,
    payment_processing_fee DECIMAL(10,2) NOT NULL,
    net_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_seller_payouts_seller (seller_id),
    INDEX idx_seller_payouts_order (order_id),
    INDEX idx_seller_payouts_status (status)
);

-- Payout Request Management
CREATE TABLE IF NOT EXISTS payout_requests (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payout_method VARCHAR(50) NOT NULL, -- 'MPESA' or 'BANK_TRANSFER'
    recipient_details JSONB NOT NULL, -- {phone: '...'} or {account: '...', bank: '...'}
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    processed_by VARCHAR(255) REFERENCES users(id),
    processed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_payout_requests_seller (seller_id),
    INDEX idx_payout_requests_status (status)
);

-- Seller Subscription Plans
CREATE TABLE IF NOT EXISTS seller_subscriptions (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL, -- 'BASIC', 'PREMIUM', 'ENTERPRISE'
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL, -- 'MONTHLY', 'YEARLY'
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_method VARCHAR(50),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_subscriptions_seller (seller_id),
    INDEX idx_subscriptions_status (status),
    INDEX idx_subscriptions_end_date (end_date)
);
CREATE TABLE IF NOT EXISTS payment_disputes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    raised_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED')),
    description TEXT NOT NULL,
    resolution TEXT,
    resolved_by TEXT REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add bank transfer payments
CREATE TABLE IF NOT EXISTS bank_transfer_payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'KES',
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    swift_code TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'FAILED')),
    verification_notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_seller_payouts_seller_id ON seller_payouts(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_payouts_status ON seller_payouts(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_seller_id ON payout_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_escrow_payments_order_id ON escrow_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_order_id ON payment_disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_bank_transfer_payments_user_id ON bank_transfer_payments(user_id);

-- Add foreign key for payout requests in seller payouts
ALTER TABLE seller_payouts 
ADD CONSTRAINT fk_seller_payouts_payout_request 
FOREIGN KEY (payout_request_id) REFERENCES payout_requests(id) ON DELETE SET NULL;

-- Update orders table to add tracking number and shipping cost
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0;

-- Add new payment methods to enum
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('STRIPE', 'MPESA', 'CASH_ON_DELIVERY', 'BANK_TRANSFER'));
