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
AUTO_CLEAN_THRESHOLD=${AUTO_CLEAN_THRESHOLD:-75}
ALERT_THRESHOLD=${ALERT_THRESHOLD:-85}
HOSTNAME=$(hostname)

# Função para capturar uso do disco
get_usage() {
    df / | grep / | awk '{ print $5 }' | sed 's/%//g'
}

# Verificação Inicial
DISK_USAGE=$(get_usage)
FREE_SPACE=$(df -h / | grep / | awk '{ print $4 }')
FULL_DF_LINE=$(df -h / | grep /)

# Log da verificação inicial
echo "$(date '+%Y-%m-%d %H:%M:%S') - Verificação: ${DISK_USAGE}% | Livre: ${FREE_SPACE}" >> "$LOG_FILE"

# GATILHO DE AUTO-LIMPEZA (Proativo)
if [ "$DISK_USAGE" -ge "$AUTO_CLEAN_THRESHOLD" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - GATILHO: Uso em ${DISK_USAGE}% >= ${AUTO_CLEAN_THRESHOLD}%. Iniciando auto-limpeza..." >> "$LOG_FILE"
    
    # Executa limpeza silenciosa
    docker system prune -af --volumes > /dev/null 2>&1
    sudo journalctl --vacuum-time=3d > /dev/null 2>&1
    sudo apt-get clean > /dev/null 2>&1
    
    # Recalcula após limpeza
    DISK_USAGE=$(get_usage)
    FREE_SPACE=$(df -h / | grep / | awk '{ print $4 }')
    FULL_DF_LINE=$(df -h / | grep /)
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') - PÓS-LIMPEZA: Uso caiu para ${DISK_USAGE}% | Livre: ${FREE_SPACE}" >> "$LOG_FILE"
fi

# Lógica de Alerta (Reativo, somente se ainda estiver alto)
if [ "$DISK_USAGE" -ge "$ALERT_THRESHOLD" ]; then
    if [ -f "$FLAG_FILE" ]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') - DISCO CRÍTICO - alerta já enviado, sem spam" >> "$LOG_FILE"
    else
        MESSAGE="🚨 *ALERTA CRÍTICO DE DISCO - SUCATABET* 🚨%0A%0A*Hostname:* ${HOSTNAME}%0A*Uso Pós-Limpeza:* ${DISK_USAGE}%%0A*Espaço Livre:* ${FREE_SPACE}%0A%0A*Detalhes:*%0A\`${FULL_DF_LINE}\`%0A%0A_A auto-limpeza foi executada mas não foi suficiente._"
        
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=${MESSAGE}" \
            -d "parse_mode=Markdown" > /dev/null
        
        touch "$FLAG_FILE"
        echo "$(date '+%Y-%m-%d %H:%M:%S') - ALERTA CRÍTICO ENVIADO: ${DISK_USAGE}%" >> "$LOG_FILE"
    fi
# Lógica de Recuperação
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
