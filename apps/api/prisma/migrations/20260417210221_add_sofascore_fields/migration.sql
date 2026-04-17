-- AlterTable
ALTER TABLE "Operation" ADD COLUMN     "sofascoreAwayLogo" TEXT,
ADD COLUMN     "sofascoreAwayName" TEXT,
ADD COLUMN     "sofascoreAwayScore" INTEGER,
ADD COLUMN     "sofascoreEventId" TEXT,
ADD COLUMN     "sofascoreHomeLogo" TEXT,
ADD COLUMN     "sofascoreHomeName" TEXT,
ADD COLUMN     "sofascoreHomeScore" INTEGER,
ADD COLUMN     "sofascoreLeague" TEXT,
ADD COLUMN     "sofascoreMinute" INTEGER,
ADD COLUMN     "sofascorePeriod" TEXT,
ADD COLUMN     "sofascoreStartTime" TIMESTAMP(3),
ADD COLUMN     "sofascoreStatus" TEXT;

-- CreateIndex
CREATE INDEX "Operation_sofascoreEventId_idx" ON "Operation"("sofascoreEventId");
