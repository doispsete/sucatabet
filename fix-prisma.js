const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando reparo forçado do Prisma...');

const rootDir = process.cwd();
const apiDir = path.join(rootDir, 'apps', 'api');
const schemaPath = path.join(apiDir, 'prisma', 'schema.prisma');

try {
  console.log('📦 Instalando @prisma/client na raiz...');
  execSync('npm install @prisma/client@7.6.0 prisma@7.6.0', { stdio: 'inherit' });

  console.log('⚙️ Gerando Prisma Client para a API...');
  // Usamos o binário do prisma diretamente do node_modules para evitar problemas de PATH/PowerShell
  const prismaBin = path.join(rootDir, 'node_modules', '.bin', 'prisma');
  const cmd = `"${prismaBin}" generate --schema="${schemaPath}"`;
  
  console.log(`> Executando: ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: apiDir });

  console.log('✅ Prisma Client gerado com sucesso!');
  
  // Verificação final
  const clientPath = path.join(apiDir, 'node_modules', '@prisma', 'client', 'index.d.ts');
  const rootClientPath = path.join(rootDir, 'node_modules', '@prisma', 'client', 'index.d.ts');
  
  console.log('🔍 Verificando integridade...');
  if (fs.existsSync(clientPath) || fs.existsSync(rootClientPath)) {
    console.log('✨ Cliente localizado nos node_modules.');
  } else {
    console.warn('⚠️ Cliente não localizado nos caminhos padrão, mas o comando reportou sucesso.');
  }

} catch (error) {
  console.error('❌ Erro no reparo:', error.message);
  process.exit(1);
}
