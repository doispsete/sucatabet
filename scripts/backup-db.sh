#!/bin/bash
# SucataBet - Script de Backup PostgreSQL
set -e

BACKUP_DIR="/var/backups/sucatabet"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="sucatabet_db_$TIMESTAMP.sql.gz"

echo "💾 Iniciando backup do banco de dados..."

mkdir -p $BACKUP_DIR

docker exec postgres pg_dump -U postgres sucatabet_db | gzip > $BACKUP_DIR/$BACKUP_FILE

find $BACKUP_DIR -name "sucatabet_db_*.sql.gz" -mtime +7 -delete

echo "✅ Backup concluído: $BACKUP_DIR/$BACKUP_FILE"
