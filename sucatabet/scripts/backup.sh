#!/bin/bash

# SucataBet - Script de Backup do Banco de Dados (Refinado)
# Recomenda-se agendar no crontab: 0 3 * * * /var/www/sucatabet/scripts/backup.sh

set -e

# Configurações
APP_DIR="/var/www/sucatabet"
BACKUP_DIR="/var/backups/sucatabet"
LOG_FILE="/var/log/sucatabet-backup.log"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="sucatabet_$TIMESTAMP.sql.gz"

# Criar diretórios se não existirem
mkdir -p "$BACKUP_DIR"
touch "$LOG_FILE"

cd "$APP_DIR"

echo "[$(date +"%Y-%m-%d %H:%M:%S")] 💾 Iniciando backup..." >> "$LOG_FILE"

# 1. Verificar se o container do postgres está rodando
if ! docker compose -f docker-compose.prod.yml ps postgres | grep -q "running"; then
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] ❌ ERRO: Container postgres não está rodando! Abortando backup." >> "$LOG_FILE"
    exit 1
fi

# 2. Executar o backup via docker compose exec (sem TTY com -T)
if docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres sucatabet_db | gzip > "$BACKUP_DIR/$FILENAME"; then
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] ✅ Backup concluído com sucesso: $FILENAME" >> "$LOG_FILE"
else
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] ❌ ERRO: Falha ao realizar dump do banco!" >> "$LOG_FILE"
    exit 1
fi

# 3. Rotação: Manter apenas os últimos 7 arquivos
echo "[$(date +"%Y-%m-%d %H:%M:%S")] 🧹 Removendo backups antigos (mais de 7 dias)..." >> "$LOG_FILE"
find "$BACKUP_DIR" -name "sucatabet_*.sql.gz" -mtime +7 -delete

echo "[$(date +"%Y-%m-%d %H:%M:%S")] ✨ Processo finalizado." >> "$LOG_FILE"

# Instrução para o administrador
echo "--------------------------------------------------------"
echo "✅ Backup realizado: $BACKUP_DIR/$FILENAME"
echo "📝 Log gravado em: $LOG_FILE"
echo "--------------------------------------------------------"
echo "Para agendar diariamente às 03:00, use o comando:"
echo "0 3 * * * /var/www/sucatabet/scripts/backup.sh"
echo "--------------------------------------------------------"
