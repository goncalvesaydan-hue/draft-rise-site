# 🚀 Guia de Colocação em Produção (Vercel & Supabase)
### Portal Privado de Onboarding · Bot WhatsApp Business AI (Meta Oficial)
**Draft & Rise** · Documentação Técnica Interna

---

## 📌 Visão Geral da Arquitetura em Produção

O sistema foi concebido com uma **arquitetura híbrida unificada**:
1. **Em Desenvolvimento Local (`PORTAL_LOCAL_MODE=1`):** Funciona 100% offline via SQLite (`.data/portal.sqlite`), ideal para testes rápidos na máquina.
2. **Em Produção na Vercel (`PORTAL_REMOTE_ENABLED=1`):** Conecta-se à base de dados PostgreSQL no **Supabase** e envia notificações automáticas de e-mail via **Resend API**, garantindo persistência permanente de dados, histórico de submissões e auditoria à prova de falhas.

---

## 🛠️ Passo a Passo para Lançar em Produção

### Passo 1: Executar o Script SQL no Supabase (2 minutos)
1. Entra na tua conta [Supabase](https://supabase.com) e abre o teu projeto.
2. No menu lateral esquerdo, clica em **SQL Editor** (`>_`).
3. Clica em **New query**.
4. Abre o ficheiro local [`documents/SUPABASE-SETUP.sql`](./SUPABASE-SETUP.sql), copia todo o código SQL e cola no editor do Supabase.
5. Clica no botão verde **Run** (Executar).
   - As 7 tabelas serão criadas instantaneamente:
     - `portal_intakes` (fichas e respostas de questionário)
     - `portal_submissions` (submissões finais protegidas e imutáveis)
     - `portal_access_codes` (códigos de 6 dígitos dos clientes)
     - `portal_sessions` (sessões HTTP seguras)
     - `portal_auth_attempts` (proteção anti-brute-force)
     - `portal_audit_events` (registo de auditoria)
     - `portal_outbox` (histórico de notificações)

---

### Passo 2: Configurar o Envio de E-mails com o Resend (3 minutos)
Para que os códigos de 6 dígitos gerados e os avisos de questionários submetidos cheguem à caixa de entrada de `geral@draftandrise.com`:
1. Cria uma conta gratuita em [Resend.com](https://resend.com).
2. No menu lateral, acede a **API Keys** e clica em **Create API Key**.
3. Copia a chave gerada (começa por `re_...`).
4. *(Recomendado para produção)* Em **Domains**, adiciona o domínio `draftandrise.com` e adiciona os 3 registos DNS indicados no teu gestor de domínio. Assim os emails saem de `notificacoes@draftandrise.com`.

---

### Passo 3: Adicionar as Variáveis de Ambiente na Vercel (3 minutos)
1. Acede ao teu painel de projeto na [Vercel](https://vercel.com).
2. Vai a **Settings** > **Environment Variables**.
3. Adiciona as seguintes variáveis para o ambiente **Production**:

| Variável | Valor Exemplo | Descrição |
| :--- | :--- | :--- |
| `PORTAL_APP_URL` | `https://draftandrise.com` | URL canónico do site |
| `PORTAL_NOTIFICATION_EMAIL` | `geral@draftandrise.com` | E-mail da Draft & Rise que recebe os alertas |
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxxxxx` | Chave de envio de email do Resend |
| `RESEND_FROM` | `Draft & Rise <notificacoes@draftandrise.com>` | Remetente dos e-mails |
| `PORTAL_REMOTE_ENABLED` | `1` | Ativa a persistência na cloud |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | URL do projeto Supabase (**Project Settings > API**) |
| `SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOi...` | Chave pública (`anon` ou `publishable`) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | **Service Role Key** (Privada; nunca expor ao cliente) |

#### Alteração Opcional das Palavras-Passe da Equipa:
Se quiseres mudar as passwords da equipa diretamente na Vercel sem mexer no código, podes definir:
- `PORTAL_TEAM_USER1_PASS` (Admin Total)
- `PORTAL_TEAM_USER2_PASS` (Equipa)
- `PORTAL_TEAM_USER3_PASS` (Equipa)
- `PORTAL_TEAM_USER4_PASS` (Equipa)
- `PORTAL_TEAM_USER5_PASS` (Equipa)
- `PORTAL_TEAM_USER6_PASS` (Equipa)

Se não definires estas variáveis, o sistema continuará a utilizar as palavras-passe padrão que constam nos PDFs individuais dos utilizadores.

---

### Passo 4: Fazer Deploy para Produção
No teu terminal ou via Git push:
```bash
git add .
git commit -m "feat(portal): production supabase and resend email integration"
git push origin main
```
A Vercel construirá e publicará o site automaticamente com suporte completo ao portal.

---

## 🔒 Segurança e Melhores Práticas Aplicadas
- **Proteção Anti-Brute-Force:** O sistema bloqueia automaticamente qualquer utilizador ou IP após 5 tentativas falhadas de password ou código por 15 minutos.
- **Códigos descartáveis de 6 dígitos:** Se alguém tentar adivinhar o código de um cliente 5 vezes erradas, o código é destruído imediatamente.
- **Cookies HTTP-Only:** Os tokens de sessão nunca ficam acessíveis ao JavaScript do navegador (`httpOnly: true`, `sameSite: strict`, `secure: true`).
- **RLS Ativo:** O Supabase bloqueia qualquer acesso direto anónimo à base de dados; toda a comunicação é autenticada através do backend Next.js da Draft & Rise.

