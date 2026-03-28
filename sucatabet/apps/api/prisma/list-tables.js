const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  let client;
  try {
    client = await pool.connect();
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in database:');
    res.rows.forEach(row => console.log(`- ${row.table_name}`));
  } catch (err) {
    console.error('ERROR LISTING TABLES:', err);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

main();
