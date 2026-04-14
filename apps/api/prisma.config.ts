import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import * as path from "path";

// Tenta carregar o .env de múltiplos locais possíveis na estrutura do Docker
dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), "apps/api/.env") });
dotenv.config({ path: path.join(process.cwd(), "../../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
  datasource: {
    // Prioriza a variável de ambiente real (injetada pelo Docker)
    // Se não existir, usa o fallback do dotenv
    url: process.env["DATABASE_URL"] || "postgresql://postgres:postgres@localhost:5432/sucatabet",
  },
});
