const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('--- DATABASE DATA CHECK ---');
    
    const profileCount = await client.query('SELECT count(*) FROM "CpfProfile"');
    console.log('Total CpfProfiles:', profileCount.rows[0].count);
    
    const accountCount = await client.query('SELECT count(*) FROM "Account"');
    console.log('Total Accounts:', accountCount.rows[0].count);
    
    const sampleAccounts = await client.query('SELECT id, balance, "cpfProfileId", status FROM "Account" LIMIT 5');
    console.log('Sample Accounts:', JSON.stringify(sampleAccounts.rows, null, 2));

    const deletedProfiles = await client.query('SELECT count(*) FROM "CpfProfile" WHERE "deletedAt" IS NOT NULL');
    console.log('Soft-deleted CpfProfiles:', deletedProfiles.rows[0].count);

    const cancelledAccounts = await client.query('SELECT count(*) FROM "Account" WHERE status = \'CANCELLED\'');
    console.log('Cancelled Accounts:', cancelledAccounts.rows[0].count);

  } catch (err) {
    console.error('DIAGNOSIS ERROR:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
