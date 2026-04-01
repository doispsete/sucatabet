const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('--- SYSTEM DATA COUNT ---');
    
    const userCount = await client.query('SELECT count(*) FROM "User"');
    console.log('Total Users:', userCount.rows[0].count);
    
    const profileCount = await client.query('SELECT count(*) FROM "CpfProfile"');
    console.log('Total CpfProfiles:', profileCount.rows[0].count);
    
    const accountCount = await client.query('SELECT count(*) FROM "Account"');
    console.log('Total Accounts:', accountCount.rows[0].count);

    const bankBalanceSum = await client.query('SELECT sum(COALESCE(balance, 0)) FROM "Account"');
    console.log('Total Balance in Accounts (Sum):', bankBalanceSum.rows[0].sum);

    const bankAccountSum = await client.query('SELECT sum(COALESCE(balance, 0)) FROM "BankAccount"');
    console.log('Total Balance in Bank (Sum):', bankAccountSum.rows[0].sum);

  } catch (err) {
    console.error('DIAGNOSIS ERROR:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
