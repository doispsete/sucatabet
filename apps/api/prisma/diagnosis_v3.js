const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('--- CPF PROFILE STATUS CHECK ---');
    
    const profiles = await client.query('SELECT id, name, "deletedAt", "userId" FROM "CpfProfile"');
    console.log('Profiles:', JSON.stringify(profiles.rows, null, 2));

    const accounts = await client.query('SELECT id, balance, "cpfProfileId" FROM "Account"');
    console.log('Accounts:', JSON.stringify(accounts.rows, null, 2));

  } catch (err) {
    console.error('DIAGNOSIS ERROR:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
