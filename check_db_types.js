const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:password@localhost:5432/sucatabet_dev' });

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'plan'
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  
  const enums = await client.query(`
    SELECT typname FROM pg_type 
    WHERE typtype = 'e' AND typname = 'UserPlan'
  `);
  console.log('Enums found:', JSON.stringify(enums.rows, null, 2));

  await client.end();
}

run().catch(console.error);
