const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('--- USER TABLE CHECK ---');
    
    const users = await client.query('SELECT id, email, name, role FROM "User"');
    console.log('Users:', JSON.stringify(users.rows, null, 2));

  } catch (err) {
    console.error('DIAGNOSIS ERROR:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
