# STAGE 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências e copia os arquivos de configuração do monorepo
COPY package.json ./
COPY apps/web/package.json ./apps/web/

# Instala todas as dependências
RUN npm install

# Copia o código fonte do frontend e as configurações
COPY apps/web/src ./apps/web/src
COPY apps/web/public ./apps/web/public
COPY apps/web/next.config.ts ./apps/web/
COPY apps/web/tsconfig.json ./apps/web/
COPY apps/web/tailwind.config.ts ./apps/web/
COPY apps/web/postcss.config.mjs ./apps/web/

# Realiza o build do projeto (Next.js Standalone)
# Note: Necessário NEXT_PUBLIC_API_URL no momento do build se houver valores estáticos dependentes
RUN npm run build -w web

# STAGE 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Cria usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia os arquivos estáticos e o output standalone do stage 1
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Define o usuário por segurança
USER nextjs

ENV PORT=3000
ENV NODE_ENV=production

# Exposição da porta do Next.js
EXPOSE 3000

# Comando para iniciar o servidor (standalone usa node diretamente)
CMD ["node", "apps/web/server.js"]
