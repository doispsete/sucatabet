const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:password@localhost:5432/sucatabet_dev' });

async function run() {
  await client.connect();
  console.log('Connected to database.');
  try {
    await client.query('ALTER TYPE "ExpenseType" ADD VALUE \'OPERACIONAL\'');
    console.log('Added OPERACIONAL to ExpenseType');
  } catch (e) {
    console.log('OPERACIONAL already exists or error: ' + e.message);
  }
  try {
    await client.query('ALTER TYPE "ExpenseType" ADD VALUE \'PESSOAL\'');
    console.log('Added PESSOAL to ExpenseType');
  } catch (e) {
    console.log('PESSOAL already exists or error: ' + e.message);
  }
  await client.end();
}

run().catch(console.error);
