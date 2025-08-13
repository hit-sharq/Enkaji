/*
  Warnings:

  - You are about to drop the column `isVerified` on the `users` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'MODERATOR';
ALTER TYPE "UserRole" ADD VALUE 'SUPPORT_AGENT';
ALTER TYPE "UserRole" ADD VALUE 'CONTENT_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'FINANCE_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'REGIONAL_MANAGER';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isVerified",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
