#!/bin/bash
set -e
APP_DIR="/var/www/sucatabet"
cd $APP_DIR
echo "🚢 Iniciando deploy..."
git pull origin main
docker compose -f docker-compose.prod.yml build --no-cache --build-arg NEXT_PUBLIC_API_URL=https://sucatabet.com.br/api
docker compose -f docker-compose.prod.yml up -d

# Roda as migrations do banco em produção
docker exec sucatabet-api npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

docker image prune -f
echo "✅ Deploy finalizado com sucesso!"
