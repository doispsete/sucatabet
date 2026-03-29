#!/bin/bash

# SucataBet - Script de Setup Inicial da VPS
# Execução Única em ambiente Ubuntu zerado.

set -e

echo "🚀 Iniciando Setup Completo da VPS para SucataBet..."

# 1. Atualização do Sistema
echo "📦 Atualizando pacotes..."
export DEBIAN_FRONTEND=noninteractive
apt update && apt upgrade -y

# 2. Instalação de Dependências
echo "🛠️ Instalando ferramentas básicas..."
apt install -y curl git ufw fail2ban snapd software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# 3. Instalação do Docker (Manual Oficial)
echo "🐳 Instalando Docker e Docker Compose..."
if ! command -v docker &> /dev/null; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

# 4. Criar usuário 'sucatabet'
echo "👤 Configurando usuário 'sucatabet'..."
if ! id "sucatabet" &>/dev/null; then
    useradd -m -s /bin/bash sucatabet
    usermod -aG docker sucatabet
    # Permite sudo sem senha apenas para docker compose se necessário, 
    # mas aqui o usuário já está no grupo docker.
fi

# 5. Configurar Swap (2GB)
echo "💾 Configurando Swap de 2GB..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
fi

# 6. Configurar Timezone
echo "🕒 Configurando Timezone para America/Sao_Paulo..."
timedatectl set-timezone America/Sao_Paulo

# 7. Configurar Firewall (UFW)
echo "🔒 Configurando Firewall (UFW)..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

# 8. Configurar Fail2ban
echo "🛡️ Configurando Fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# 9. Instalar Certbot
echo "🔐 Instalando Certbot..."
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot

# 10. Estrutura de Pastas e Clone
echo "📂 Preparando diretório /var/www/sucatabet..."
mkdir -p /var/www/sucatabet
chown -R sucatabet:sucatabet /var/www/sucatabet

if [ ! -d "/var/www/sucatabet/.git" ]; then
    echo "📥 Clonando repositório..."
    sudo -u sucatabet git clone https://github.com/doispsete/sucatabet.git /var/www/sucatabet
fi

# 11. Arquivo .env com Placeholders
echo "📝 Criando arquivo .env inicial..."
cat <<EOF > /var/www/sucatabet/.env
# --- DATABASE ---
DATABASE_URL="postgresql://postgres:SENHA_AQUI@postgres:5432/sucatabet_db?schema=public"
POSTGRES_DB=sucatabet_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=SENHA_AQUI

# --- API ---
JWT_SECRET="GERAR_UM_SEGREDO_DE_32_CHARS_AQUI"
JWT_EXPIRATION="8h"
PORT=3006
NODE_ENV="production"
FRONTEND_URL="https://seudominio.com"

# --- WEB ---
NEXT_PUBLIC_API_URL="https://seudominio.com/api"
NEXTAUTH_SECRET="GERAR_UM_SEGREDO_DE_32_CHARS_AQUI"
NEXTAUTH_URL="https://seudominio.com"
EOF

chown sucatabet:sucatabet /var/www/sucatabet/.env

echo "--------------------------------------------------------"
echo "✅ SETUP DA VPS CONCLUÍDO COM SUCESSO!"
echo "--------------------------------------------------------"
echo "Instruções Manuais Finais:"
echo "1. Edite o arquivo /var/www/sucatabet/.env com os valores reais."
echo "2. Aponte seu domínio para o IP $IP_HOST."
echo "3. Execute o Certbot: certbot --nginx -d seudominio.com"
echo "4. Rode as migrations e o seed via docker compose."
echo "--------------------------------------------------------"
