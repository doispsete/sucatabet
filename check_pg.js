const { Client } = require('pg');

async function checkEnum() {
  const client = new Client({
    connectionString: "postgresql://postgres:2ebb55528d1d2d6d509dd9d12087818798d123f26a8d0a4e9d39b43494edaa8a@localhost:5432/sucatabet_db?schema=public"
  });

  try {
    await client.connect();
    
    console.log('--- OperationType Enum Values ---');
    const enumRes = await client.query(`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'OperationType';
    `);
    console.log(enumRes.rows.map(r => r.enumlabel).join(', '));

    console.log('\n--- Column Types ---');
    const colRes = await client.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'Operation' AND column_name = 'type';
    `);
    console.table(colRes.rows);

  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await client.end();
  }
}

checkEnum();
