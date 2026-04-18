const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkSchema() {
  console.log('🔍 Auditando colunas reais do banco de dados...');
  try {
    const res = await pool.query(`
      SELECT table_name, column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name IN ('User', 'Operation')
      ORDER BY table_name, column_name;
    `);

    console.log('✅ Audit Completo:');
    console.table(res.rows);

    const enums = await pool.query(`
      SELECT t.typname as enum_name, e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid
      ORDER BY enum_name, enum_value;
    `);
    console.log('✅ Enums Detectados:');
    console.table(enums.rows);

  } catch (err) {
    console.error('❌ Erro na auditoria:', err.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
