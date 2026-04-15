import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import * as path from "path";

// Tenta carregar o .env de múltiplos locais possíveis na estrutura do Docker
const envPaths = [
  path.join(process.cwd(), ".env"),
  path.join(process.cwd(), "apps/api/.env"),
  path.join(__dirname, ".env"),
  path.join(__dirname, "../.env")
];

envPaths.forEach(p => {
  dotenv.config({ path: p, override: true });
});

const databaseUrl = process.env["DATABASE_URL"];

if (databaseUrl) {
  const masked = databaseUrl.replace(/:.*@/, ':****@');
  console.log(`[PrismaConfig] Usando URL: ${masked}`);
} else {
  console.warn(`[PrismaConfig] Aviso: DATABASE_URL não encontrada no ambiente.`);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
