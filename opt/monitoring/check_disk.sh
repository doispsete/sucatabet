#!/bin/bash

# Caminhos absolutos para garantir funcionamento via cron
BASE_DIR="/opt/monitoring"
ENV_FILE="$BASE_DIR/.env"
LOG_FILE="$BASE_DIR/disk_monitor.log"
FLAG_FILE="$BASE_DIR/alert_sent.flag"

# Carrega variáveis de ambiente do .env local
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ERRO: Arquivo .env não encontrado em $ENV_FILE" >> "$LOG_FILE"
    exit 1
fi

# Parâmetros de monitoramento
THRESHOLD=${DISK_THRESHOLD:-80}
HOSTNAME=$(hostname)
DISK_USAGE=$(df / | grep / | awk '{ print $5 }' | sed 's/%//g')
FREE_SPACE=$(df -h / | grep / | awk '{ print $4 }')
FULL_DF_LINE=$(df -h / | grep /)

# Log da verificação (sempre ocorre)
echo "$(date '+%Y-%m-%d %H:%M:%S') - Uso: ${DISK_USAGE}% | Livre: ${FREE_SPACE}" >> "$LOG_FILE"

# Lógica de Alerta de Disco Alto
if [ "$DISK_USAGE" -ge "$THRESHOLD" ]; then
    if [ -f "$FLAG_FILE" ]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') - DISCO ALTO - alerta já enviado, sem spam" >> "$LOG_FILE"
    else
        MESSAGE="🚨 *ALERTA DE DISCO - SUCATABET* 🚨%0A%0A*Hostname:* ${HOSTNAME}%0A*Uso Atual:* ${DISK_USAGE}%%0A*Espaço Livre:* ${FREE_SPACE}%0A%0A*Detalhes:*%0A\`${FULL_DF_LINE}\`"
        
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=${MESSAGE}" \
            -d "parse_mode=Markdown" > /dev/null
        
        touch "$FLAG_FILE"
        echo "$(date '+%Y-%m-%d %H:%M:%S') - ALERTA ENVIADO: ${DISK_USAGE}% atingido" >> "$LOG_FILE"
    fi

# Lógica de Recuperação (Disco Normalizado)
else
    if [ -f "$FLAG_FILE" ]; then
        MESSAGE="✅ *DISCO NORMALIZADO - SUCATABET*%0A%0A*Hostname:* ${HOSTNAME}%0A*Uso Atual:* ${DISK_USAGE}%%0A*Espaço Livre:* ${FREE_SPACE}"
        
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=${MESSAGE}" \
            -d "parse_mode=Markdown" > /dev/null
            
        rm "$FLAG_FILE"
        echo "$(date '+%Y-%m-%d %H:%M:%S') - RECUPERAÇÃO ENVIADA: ${DISK_USAGE}%" >> "$LOG_FILE"
    fi
fi
