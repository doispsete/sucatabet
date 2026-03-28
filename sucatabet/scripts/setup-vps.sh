#!/bin/bash

# SucataBet - Script de Setup VPS (Ubuntu/Debian)
# Este script deve ser executado no VPS recém-criado.

set -e

echo "🚀 Iniciando Setup da VPS para SucataBet..."

# 1. Atualizar o sistema
sudo apt-get update && sudo apt-get upgrade -y

# 2. Instalar dependências básicas
sudo apt-get install -y curl git apt-transport-https ca-certificates gnupg lsb-release ufw

# 3. Instalar Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
else
    echo "✅ Docker já instalado."
fi

# 4. Configurar Firewall (UFW)
echo "🔒 Configurando Firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 5. Criar estrutura de pastas
echo "📂 Criando estrutura de diretórios..."
mkdir -p ~/app/sucatabet/nginx
mkdir -p ~/app/sucatabet/certbot/conf
mkdir -p ~/app/sucatabet/certbot/www
mkdir -p ~/app/sucatabet/backups

echo "✅ Setup básico concluído!"
echo "⚠️  Lembre-se de fazer logoff e login novamente para as permissões do Docker surtirem efeito."
