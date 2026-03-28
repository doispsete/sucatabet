# STAGE 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências necessárias para o Prisma em Alpine
RUN apk add --no-cache openssl libc6-compat

# Copia os arquivos de configuração do monorepo
COPY package.json ./
COPY apps/api/package.json ./apps/api/

# Instala todas as dependências (incluindo dev)
RUN npm install

# Copia o schema do Prisma e o código fonte da API
COPY apps/api/prisma ./apps/api/prisma
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

# Copia as dependências de produção do monorepo
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Copia o build e o cliente Prisma gerado
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules/@prisma/client ./node_modules/@prisma/client

# Define permissões
USER nestjs

# Exposição da porta (conforme configurado no .env)
EXPOSE 3006

# Healthcheck obrigatório
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3006/api/health || exit 1

# Comando para iniciar a aplicação
CMD ["node", "apps/api/dist/main"]
