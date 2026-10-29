-- AlterTable
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "cancelled_by" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "cancellation_reason" TEXT;

