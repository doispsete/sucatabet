#!/bin/bash
# Backup automático do banco de dados SucataBet
set -e

BACKUP_DIR="/var/backups/sucatabet"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="sucatabet_$DATE.sql"

# Cria o diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Faz o dump do banco
docker exec postgres pg_dump -U sucatabet_user sucatabet_db > $BACKUP_DIR/$FILENAME

# Comprime o arquivo
gzip $BACKUP_DIR/$FILENAME

# Mantém apenas os últimos 7 backups
ls -t $BACKUP_DIR/*.sql.gz | tail -n +8 | xargs -r rm

echo "✅ Backup salvo em $BACKUP_DIR/$FILENAME.gz"
