const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    const email = 'admin@sucatabet.com';
    console.log(`Upgrading ${email} to PRO...`);
    
    const result = await client.query('UPDATE "User" SET plan = \'PRO\', status = \'ACTIVE\' WHERE email = $1 RETURNING email, plan, status', [email]);
    
    if (result.rows.length > 0) {
      console.log('✅ Admin Upgraded Successfully:', result.rows[0]);
    } else {
      console.log('❌ User not found:', email);
    }

  } catch (err) {
    console.error('UPGRADE ERROR:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
