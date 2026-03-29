const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in database:');
    res.rows.forEach(row => console.log(`- ${row.table_name}`));
    
    const userCount = await client.query('SELECT count(*) FROM "User"');
    console.log('User count:', userCount.rows[0].count);
    
    if (userCount.rows[0].count > 0) {
      const admin = await client.query("SELECT id, email FROM \"User\" WHERE email = 'admin@sucatabet.com'");
      console.log('Admin user:', admin.rows[0] || 'NOT FOUND');
    }
  } catch (err) {
    console.error('DIAGNOSIS ERROR:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
