-- Remove paymentReference column from checkout_sessions table
DROP INDEX IF EXISTS "checkout_sessions_paymentReference_idx";
DROP INDEX IF EXISTS "checkout_sessions_userId_expiresAt_idx";
ALTER TABLE checkout_sessions DROP COLUMN IF EXISTS "paymentReference";
