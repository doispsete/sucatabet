-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('FREEBET_GEN', 'EXTRACAO', 'BOOST_25', 'BOOST_30', 'SUPERODDS', 'TENTATIVA_DUPLO');

-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('OPEN', 'CLOSED', 'VOID');

-- CreateEnum
CREATE TYPE "OperationResult" AS ENUM ('DUPLO', 'NORMAL', 'PROTECAO');

-- CreateEnum
CREATE TYPE "OperationCategory" AS ENUM ('GERACAO', 'CONVERSAO', 'BOOST', 'RISCO');

-- CreateEnum
CREATE TYPE "FreebetStatus" AS ENUM ('ATIVA', 'EXPIRANDO', 'EXPIRADA', 'USADA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "house" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "inOperation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL,
    "type" "OperationType" NOT NULL,
    "status" "OperationStatus" NOT NULL DEFAULT 'OPEN',
    "result" "OperationResult",
    "category" "OperationCategory" NOT NULL,
    "totalStake" DOUBLE PRECISION NOT NULL,
    "expectedProfit" DOUBLE PRECISION NOT NULL,
    "realProfit" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "odds" DOUBLE PRECISION NOT NULL,
    "stake" DOUBLE PRECISION NOT NULL,
    "isFreebet" BOOLEAN NOT NULL DEFAULT false,
    "profit" DOUBLE PRECISION,

    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Freebet" (
    "id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "expiration" TIMESTAMP(3) NOT NULL,
    "status" "FreebetStatus" NOT NULL DEFAULT 'ATIVA',
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Freebet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Freebet" ADD CONSTRAINT "Freebet_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
