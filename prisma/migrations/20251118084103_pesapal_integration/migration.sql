/*
  Warnings:

  - You are about to drop the column `stripeSubscriptionId` on the `seller_subscriptions` table. All the data in the column will be lost.
  - You are about to drop the `bank_transfer_payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `escrow_payments` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PesapalPaymentMethod" AS ENUM ('CARD', 'MPESA', 'AIRTEL_MONEY', 'EQUITY_BANK', 'KCB_BANK', 'BANK_TRANSFER', 'MOBILE_BANKING');

-- CreateEnum
CREATE TYPE "PesapalPaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'INVALID', 'REVERSED');

-- AlterEnum
ALTER TYPE "PayoutMethod" ADD VALUE 'PESAPAL';

-- DropForeignKey
ALTER TABLE "bank_transfer_payments" DROP CONSTRAINT "bank_transfer_payments_userId_fkey";

-- DropForeignKey
ALTER TABLE "escrow_payments" DROP CONSTRAINT "escrow_payments_buyerId_fkey";

-- DropForeignKey
ALTER TABLE "escrow_payments" DROP CONSTRAINT "escrow_payments_orderId_fkey";

-- AlterTable
ALTER TABLE "payout_requests" ALTER COLUMN "method" SET DEFAULT 'PESAPAL';

-- AlterTable
ALTER TABLE "seller_payouts" ALTER COLUMN "method" SET DEFAULT 'PESAPAL';

-- AlterTable
ALTER TABLE "seller_subscriptions" DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "pesapalSubscriptionId" TEXT;

-- DropTable
DROP TABLE "bank_transfer_payments";

-- DropTable
DROP TABLE "escrow_payments";

-- DropEnum
DROP TYPE "BankTransferStatus";

-- DropEnum
DROP TYPE "EscrowStatus";

-- CreateTable
CREATE TABLE "pesapal_payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "pesapalTrackingId" TEXT,
    "pesapalMerchantRef" TEXT,
    "pesapalTransactionId" TEXT,
    "paymentMethod" "PesapalPaymentMethod" NOT NULL DEFAULT 'CARD',
    "status" "PesapalPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatusDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pesapal_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesapal_ipns" (
    "id" TEXT NOT NULL,
    "pesapalTransactionId" TEXT NOT NULL,
    "pesapalTrackingId" TEXT NOT NULL,
    "pesapalMerchantRef" TEXT NOT NULL,
    "paymentMethod" "PesapalPaymentMethod" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "PesapalPaymentStatus" NOT NULL,
    "statusDescription" TEXT,
    "paymentAccount" TEXT,
    "callBackUrl" TEXT,
    "description" TEXT,
    "message" TEXT,
    "reference" TEXT,
    "thirdPartyReference" TEXT,
    "rawData" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pesapal_ipns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pesapal_payments_orderId_key" ON "pesapal_payments"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "pesapal_ipns_pesapalTransactionId_key" ON "pesapal_ipns"("pesapalTransactionId");

-- AddForeignKey
ALTER TABLE "pesapal_payments" ADD CONSTRAINT "pesapal_payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesapal_payments" ADD CONSTRAINT "pesapal_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
