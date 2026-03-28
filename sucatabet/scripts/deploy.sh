#!/bin/bash

# SucataBet - Script de Deploy Contínuo
# Executado via GitHub Actions no VPS.

set -e

APP_DIR="~/app/sucatabet"
cd $APP_DIR

echo "🚢 Iniciando deploy..."

# 1. Puxar as imagens mais recentes (se estiver usando Docker Hub)
# docker compose pull

# 2. Reiniciar os serviços
docker compose -f docker-compose.prod.yml up -d --build

# 3. Limpar recursos antigos
docker image prune -f

echo "✅ Deploy finalizado com sucesso!"
