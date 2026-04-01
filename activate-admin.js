const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres:password@localhost:5432/sucatabet_dev"
  });

  try {
    await client.connect();
    console.log('Conectado ao banco!');
    
    const res = await client.query(`
      UPDATE "User" 
      SET status = 'ACTIVE', plan = 'PRO' 
      WHERE email = 'admin@sucatabet.com'
      RETURNING id, email, status, plan;
    `);

    if (res.rows.length > 0) {
      console.log('Usuário admin ativado com sucesso:', res.rows[0]);
    } else {
      console.log('Usuário admin@sucatabet.com não encontrado. Verifique se o seed foi executado.');
    }
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
  } finally {
    await client.end();
  }
}

main();
