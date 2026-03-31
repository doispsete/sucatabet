-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'LIMITED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "deletedAt",
ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE'::"AccountStatus";

-- CreateIndex
CREATE INDEX "Account_status_idx" ON "Account"("status");
