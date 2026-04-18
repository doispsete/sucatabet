# STAGE 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências necessárias para o Prisma em Alpine
RUN apk add --no-cache openssl libc6-compat

# Copia os arquivos de configuração do monorepo
COPY package.json ./
COPY apps/api/package.json ./apps/api/

# Instala todas as dependências (incluindo dev) usando legacy-peer-deps conforme lição de deploy
RUN npm install --legacy-peer-deps

# Copia o schema do Prisma, config e o código fonte da API
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/prisma.config.ts ./apps/api/
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/tsconfig.build.json ./apps/api/
COPY apps/api/nest-cli.json ./apps/api/

# Gera o cliente Prisma e compila o projeto
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npm run build -w api

# STAGE 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Instala curl para o healthcheck e runtime do Prisma
RUN apk add --no-cache openssl curl

# Cria usuário não-root por segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Ordem exata de COPY conforme instrução do usuário:
# 1. node_modules (raiz)
COPY --from=builder /app/node_modules ./node_modules
# 2. @prisma/client e pasta gerada (.prisma)
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# 3. apps/api/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
# 4. apps/api/prisma (pasta completa com migrations e schema)
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
# 5. apps/api/prisma.config.ts
COPY --from=builder /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
# 6. apps/api/package.json
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Cria arquivo de log e define permissões
RUN touch /app/error.log && chown nestjs:nodejs /app/error.log

# Define permissões para a pasta prisma (necessária para o migrate deploy)
RUN chown -R nestjs:nodejs /app/apps/api/prisma

# Define permissões
USER nestjs

# Exposição da porta (conforme configurado no .env)
EXPOSE 3006

# Healthcheck apontando para a rota de saúde correta
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3006/api/health || exit 1

# Comando para iniciar a aplicação (dist/src/main conforme lição de deploy)
CMD ["node", "apps/api/dist/src/main"]
