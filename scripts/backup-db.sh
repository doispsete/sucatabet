#!/bin/bash

# SucataBet - Script de Backup PostgreSQL
# Recomendado: Agendar via crontab (ex: 0 3 * * * /path/to/backup-db.sh)

BACKUP_DIR="/home/$USER/app/sucatabet/backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="sucatabet_db_$TIMESTAMP.sql.gz"

echo "💾 Iniciando backup do banco de dados..."

# Executa o dump dentro do contêiner e compacta
docker exec sucatabet-db pg_dump -U ${POSTGRES_USER:-postgres} sucatabet_db | gzip > $BACKUP_DIR/$BACKUP_FILE

# Manter apenas os últimos 7 dias de backup
find $BACKUP_DIR -name "sucatabet_db_*.sql.gz" -mtime +7 -delete

echo "✅ Backup concluído: $BACKUP_FILE"
