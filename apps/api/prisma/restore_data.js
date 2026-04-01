const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('--- RESTORING DELETED PROFILES AND ACCOUNTS ---');
    
    // 1. Undelete CpfProfiles deleted today
    const resProfile = await client.query('UPDATE "CpfProfile" SET "deletedAt" = NULL WHERE "deletedAt" >= \'2026-04-01\'');
    console.log(`Undeleted ${resProfile.rowCount} CpfProfiles.`);

    // 2. Ensure accounts for these profiles are ACTIVE
    const resAccount = await client.query('UPDATE "Account" SET "status" = \'ACTIVE\' WHERE "cpfProfileId" IN (SELECT "id" FROM "CpfProfile" WHERE "deletedAt" IS NULL)');
    console.log(`Activated ${resAccount.rowCount} Accounts.`);

  } catch (err) {
    console.error('RESTORATION ERROR:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
