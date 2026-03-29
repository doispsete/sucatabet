-- Migration: Sync and Performance (Phase 3)
-- Transforma o banco do estado 'init' para o estado atual do schema.prisma, adicionando índices e refactoring de colunas.

-- AlterEnum
BEGIN;
CREATE TYPE "OperationStatus_new" AS ENUM ('PENDING', 'FINISHED', 'CASHOUT', 'VOID');
ALTER TABLE "public"."Operation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Operation" ALTER COLUMN "status" TYPE "OperationStatus_new" USING ("status"::text::"OperationStatus_new");
ALTER TYPE "OperationStatus" RENAME TO "OperationStatus_old";
ALTER TYPE "OperationStatus_new" RENAME TO "OperationStatus";
DROP TYPE "public"."OperationStatus_old";
ALTER TABLE "Operation" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OperationType_new" AS ENUM ('NORMAL', 'FREEBET_GEN', 'EXTRACAO', 'BOOST_25', 'BOOST_50', 'SUPERODDS', 'TENTATIVA_DUPLO');
ALTER TABLE "Operation" ALTER COLUMN "type" TYPE "OperationType_new" USING ("type"::text::"OperationType_new");
ALTER TYPE "OperationType" RENAME TO "OperationType_old";
ALTER TYPE "OperationType_new" RENAME TO "OperationType";
DROP TYPE "public"."OperationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "cpf",
DROP COLUMN "createdAt",
DROP COLUMN "house",
DROP COLUMN "ownerId",
ADD COLUMN     "bettingHouseId" TEXT NOT NULL,
ADD COLUMN     "cpfProfileId" TEXT NOT NULL,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "inOperation" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "details",
DROP COLUMN "resource",
DROP COLUMN "userId",
ADD COLUMN     "entity" TEXT NOT NULL,
ADD COLUMN     "entityId" TEXT NOT NULL,
ADD COLUMN     "executedBy" TEXT NOT NULL,
ADD COLUMN     "newValue" JSONB,
ADD COLUMN     "oldValue" JSONB;

-- AlterTable
ALTER TABLE "Bet" DROP COLUMN "isFreebet",
DROP COLUMN "profit",
ADD COLUMN     "commission" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "cost" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "expectedProfit" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "isBenefit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isWinner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "side" TEXT NOT NULL DEFAULT 'BACK',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'Normal',
ALTER COLUMN "odds" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "stake" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Freebet" DROP COLUMN "expiration",
DROP COLUMN "source",
DROP COLUMN "status",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "operationId" TEXT,
ADD COLUMN     "origin" TEXT NOT NULL,
ADD COLUMN     "usedAt" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "value" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Operation" DROP COLUMN "closedAt",
DROP COLUMN "totalStake",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "profitDifference" DECIMAL(65,30),
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "expectedProfit" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "realProfit" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt";

-- DropEnum
DROP TYPE "FreebetStatus";

-- CreateTable
CREATE TABLE "CpfProfile" (
    "id" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CpfProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BettingHouse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "logoUrl" TEXT,

    CONSTRAINT "BettingHouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyClub" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "totalStake" DECIMAL(65,30) NOT NULL DEFAULT 0.0,

    CONSTRAINT "WeeklyClub_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CpfProfile_cpf_key" ON "CpfProfile"("cpf");

-- CreateIndex
CREATE INDEX "WeeklyClub_accountId_idx" ON "WeeklyClub"("accountId");

-- CreateIndex
CREATE INDEX "WeeklyClub_weekStart_idx" ON "WeeklyClub"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyClub_accountId_weekStart_key" ON "WeeklyClub"("accountId", "weekStart");

-- CreateIndex
CREATE INDEX "Account_cpfProfileId_idx" ON "Account"("cpfProfileId");

-- CreateIndex
CREATE INDEX "Account_bettingHouseId_idx" ON "Account"("bettingHouseId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_cpfProfileId_bettingHouseId_key" ON "Account"("cpfProfileId", "bettingHouseId");

-- CreateIndex
CREATE INDEX "AuditLog_executedBy_idx" ON "AuditLog"("executedBy");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Bet_operationId_idx" ON "Bet"("operationId");

-- CreateIndex
CREATE INDEX "Bet_accountId_idx" ON "Bet"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Freebet_operationId_key" ON "Freebet"("operationId");

-- CreateIndex
CREATE INDEX "Freebet_userId_idx" ON "Freebet"("userId");

-- CreateIndex
CREATE INDEX "Freebet_expiresAt_idx" ON "Freebet"("expiresAt");

-- CreateIndex
CREATE INDEX "Operation_userId_idx" ON "Operation"("userId");

-- CreateIndex
CREATE INDEX "Operation_status_idx" ON "Operation"("status");

-- CreateIndex
CREATE INDEX "Operation_createdAt_idx" ON "Operation"("createdAt");

-- AddForeignKey
ALTER TABLE "CpfProfile" ADD CONSTRAINT "CpfProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_cpfProfileId_fkey" FOREIGN KEY ("cpfProfileId") REFERENCES "CpfProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_bettingHouseId_fkey" FOREIGN KEY ("bettingHouseId") REFERENCES "BettingHouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Freebet" ADD CONSTRAINT "Freebet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Freebet" ADD CONSTRAINT "Freebet_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_executedBy_fkey" FOREIGN KEY ("executedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyClub" ADD CONSTRAINT "WeeklyClub_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
