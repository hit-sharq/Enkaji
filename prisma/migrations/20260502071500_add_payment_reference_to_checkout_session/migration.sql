-- Add paymentReference column to checkout_sessions
ALTER TABLE "checkout_sessions" ADD COLUMN "paymentReference" VARCHAR(255) UNIQUE;

-- Create indexes for efficient lookups
CREATE INDEX "checkout_sessions_paymentReference_idx" ON "checkout_sessions"("paymentReference");
CREATE INDEX "checkout_sessions_userId_expiresAt_idx" ON "checkout_sessions"("userId", "expiresAt");
