# Verificação da integração

11 de outubro de 2026; Node 24.16.0; Next 16.3.6; Chrome instalado no computador.

- `npm test`: 11 testes passaram (10 de domínio/SQLite e um cenário PostgreSQL com múltiplas verificações).
- `npm run test:e2e`: 6 testes passaram. Percurso completo, autorização/origem, falha de gravação, mobile, acessibilidade automatizada, concorrência em duas janelas e regresso ao site institucional.
- Axe: sem violações nos critérios automatizados avaliados na entrada do questionário e no formulário. Não equivale a auditoria manual completa.
- `npm run lint` e `npm run typecheck`: passaram.
- `npm run build`: compilação de produção passou.
- `PORTAL_E2E_PUBLIC=1 npm run test:e2e`: 1 teste passou na compilação de produção, confirmando ausência dos perfis fictícios e recusa de acesso às APIs sem configuração.

Capturas desktop/mobile em `evidence/`. Usam dados fictícios; o relatório/trace temporário do Playwright está ignorado pelo Git.

Detetado e corrigido conflito com seletores institucionais (`hero`, `button`, etc.) através de prefixos de classe e âmbito próprio. A regressão visual básica compara fontes, dimensão e cor do título institucional antes/depois da navegação pelo portal.

As verificações não abrangem Supabase alojado, envio/receção de OTP, renovação real de sessão remota, SMTP, entrega de notificações nem publicação. O cenário PostgreSQL usa auth.uid/roles locais para verificar SQL e RLS; não testa o serviço Auth alojado.

Após a revisão visual, ajustado o bloco de ajuda em telemóvel e repetido o cenário mobile: passou.

## Atualização: Supabase configurado localmente

A migração foi agora aplicada ao projeto remoto e as chaves foram configuradas apenas na cópia local. A conectividade às cinco tabelas e o bloqueio anónimo passaram. SMTP e percurso autenticado continuam pendentes. Este registo substitui as indicações anteriores de que não existia configuração remota: ver [REMOTE-SETUP.md](REMOTE-SETUP.md).
