-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "User" ADD COLUMN "approvedAt" TIMESTAMP(3);

-- Active existing users so they don't get stuck in 'PENDING'
UPDATE "User" SET "status" = 'ACTIVE';
