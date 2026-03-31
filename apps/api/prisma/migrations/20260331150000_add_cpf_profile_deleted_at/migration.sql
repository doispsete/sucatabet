-- Safe ADD column deletedAt to CpfProfile
ALTER TABLE "CpfProfile" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Add index if not exists (Postgres style for safety)
DO $$ BEGIN
    CREATE INDEX "CpfProfile_deletedAt_idx" ON "CpfProfile"("deletedAt");
EXCEPTION WHEN duplicate_table OR duplicate_object THEN null; END $$;
