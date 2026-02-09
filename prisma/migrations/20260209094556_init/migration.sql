-- CreateEnum
CREATE TYPE "RefundMethod" AS ENUM ('ORIGINAL', 'BANK', 'MPESA');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "pesapal_refunds" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "pesapalTrackingId" TEXT NOT NULL,
    "refundTrackingId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "reason" TEXT NOT NULL,
    "method" "RefundMethod" NOT NULL DEFAULT 'ORIGINAL',
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "statusMessage" TEXT,
    "requestedBy" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pesapal_refunds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pesapal_refunds_refundTrackingId_key" ON "pesapal_refunds"("refundTrackingId");
