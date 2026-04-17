# Monitoramento de Disco - SucataBet

Sistema de alerta antecipado para evitar quedas por falta de espaço em disco.

## Instalação

1. **Criar diretório na VPS**:
   `sudo mkdir -p /opt/monitoring`

2. **Copiar arquivos**:
   Copie os arquivos deste diretório para `/opt/monitoring/` na sua VPS.

3. **Permissões de Execução**:
   `sudo chmod +x /opt/monitoring/check_disk.sh`

4. **Configuração do Cron**:
   Adicione a linha abaixo ao crontab do root (`sudo crontab -e`):
   `*/10 * * * * /opt/monitoring/check_disk.sh`

## Comandos Úteis
- **Ver logs**: `tail -f /opt/monitoring/disk_monitor.log`
- **Teste manual**: `sudo bash /opt/monitoring/check_disk.sh`
- **Limpar flag manualmente**: `sudo rm /opt/monitoring/alert_sent.flag`
