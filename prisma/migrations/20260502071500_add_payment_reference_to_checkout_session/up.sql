-- Add paymentReference column to checkout_sessions table
ALTER TABLE checkout_sessions ADD COLUMN IF NOT EXISTS "paymentReference" VARCHAR(255) UNIQUE;
CREATE INDEX IF NOT EXISTS "checkout_sessions_paymentReference_idx" ON checkout_sessions("paymentReference");
-- Add index for faster expiry-based queries
CREATE INDEX IF NOT EXISTS "checkout_sessions_userId_expiresAt_idx" ON checkout_sessions("userId", "expiresAt");
