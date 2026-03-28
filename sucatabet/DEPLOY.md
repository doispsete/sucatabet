# 🚀 Guia de Deploy - SucataBet

Este documento contém o checklist completo para realizar o deploy do sistema SucataBet na VPS Hostinger.

## 📋 Pré-deploy (No seu Computador)
- [ ] Criar repositório **privado** no GitHub.
- [ ] `git init` + `git add .` + `git commit` + `git push origin main`.
- [ ] Confirmar que o arquivo `.env` **NÃO** foi commitado (`git status`).
- [ ] Confirmar que o build de produção passa localmente: `npm run build:prod`.

## 🐧 Setup da VPS (Uma única vez)
- [ ] Criar VPS Hostinger (Ubuntu 24.04).
- [ ] Copiar o IP da VPS.
- [ ] SSH root@IP e rodar: `bash scripts/setup-vps-linux.sh`.
- [ ] Preencher `/var/www/sucatabet/.env` com os valores reais de produção.
- [ ] Apontar seu domínio para o IP (Registro A no DNS).
- [ ] Aguardar propagação do DNS (até 24h).
- [ ] Rodar Certbot para SSL: `certbot --nginx -d seudominio.com`.
- [ ] Rodar migrations iniciais:
    ```bash
    docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
    ```
- [ ] Rodar seed (dados iniciais):
    ```bash
    docker compose -f docker-compose.prod.yml exec api npm run db:seed
    ```
- [ ] Configurar Secrets no GitHub (Settings > Secrets > Actions):
    * `VPS_HOST`, `VPS_USER`, `SSH_PRIVATE_KEY`, `VPS_PORT`.

## ⚙️ Manutenção e Verificação
- [ ] Configurar cron de backup automático:
    ```bash
    crontab -e
    # Adicionar linha: 0 3 * * * /var/www/sucatabet/scripts/backup.sh
    ```
- [ ] Verificar Healthcheck: `curl https://seudominio.com/api/health`.
- [ ] Monitorar logs: `docker compose -f docker-compose.prod.yml logs -f`.
- [ ] Testar backup manual: `bash scripts/backup.sh`.

---
**Suporte:** Em caso de erro no deploy, verifique a aba *Actions* no GitHub.
