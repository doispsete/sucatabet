# SucataBet: Visão Geral Técnica

Este documento detalha o ecossistema tecnológico da plataforma **SucataBet**, abrangendo desde o desenvolvimento até a infraestrutura de produção.

## 🛠️ Stack Tecnológica

### Frontend (Web)
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS (Kinetic Void Design System)
- **Ícones**: Lucide React
- **Gerenciamento de Estado**: React Context API
- **Autenticação**: JWT com persistência em Cookies (HttpOnly/Lax)

### Backend (API)
- **Framework**: [NestJS](https://nestjs.com/)
- **ORM**: Prisma
- **Autenticação**: Passport.js + JWT
- **Linguagem**: TypeScript
- **Arquitetura**: Modular (Controller-Service-Repository)

### Banco de Dados
- **Core**: PostgreSQL 16 (Alpine)
- **Gerenciamento**: pgAdmin 4 (Integrado via Docker)

---

## 🚀 Funcionalidades Principais

### Gestão e Operações
- **Dashboard de Visão Geral**: Resumo de banca, lucros e métricas de desempenho.
- **Calculadora de Surebet**: Ferramenta avançada para cálculo de arbitragem (BACK vs LAY).
- **Controle de Operações**: Registro detalhado de apostas, liquidação e histórico.
- **Gestão de Contas**: Monitoramento de saldo em múltiplas casas de apostas.
- **Alertas**: Notificações de oportunidades e avisos críticos.
- **Freebets**: Sistema de geração e acompanhamento de apostas grátis.

### Segurança e Controle
- **RBAC (Role Based Access Control)**: Diferenciação entre perfis de `ADMIN` e `OPERADOR`.
- **Route Guard**: Middleware de proteção de rotas no Next.js.
- **JWT Authentication**: Injeção manual de headers no cliente API para máxima compatibilidade com SSR.

---

## 🌐 Infraestrutura e Deploy

### Containerização (Docker)
- **Produção**: Orquestração via `docker-compose.prod.yml`.
- **Serviços**: `api`, `web`, `postgres`, `nginx`, `pgadmin`.

### Servidor Web & Proxy
- **Nginx**: 
  - Proxy reverso para API e Web.
  - Terminação SSL/HTTPS segura.
  - Rate Limiting (Proteção contra brute force/DDoS).
  - Redirecionamento automático HTTP → HTTPS.

### CI/CD e Automação
- **GitHub Actions**: Pipeline automatizado para deploy na VPS via SSH.
- **Deploy Script**: Automação de `git pull`, build de imagens com argumentos de ambiente e atualização de containers.
- **Migrations Automáticas**: Execução de `prisma migrate deploy` em cada deploy para sincronização do banco.
- **Sistema de Backup**: Script diário de backup do banco de dados com compressão e retenção de 7 dias.

---

## 🔗 Integrações
- **VPS Hostinger**: Hospedagem principal.
- **Let's Encrypt / Certbot**: Certificados SSL automáticos.
- **Prisma Client**: Comunicação tipo-estável entre API e PostgreSQL.
