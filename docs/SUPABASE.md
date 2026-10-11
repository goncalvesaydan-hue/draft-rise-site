# Ligação do questionário ao Supabase

Estado atualizado: projeto remoto criado, migração aplicada e ligação local verificada. SMTP e autenticação por email ainda pendentes. Ver [registo da configuração](execution/REMOTE-SETUP.md). As instruções abaixo servem de referência; não repetir a migração inicial no projeto existente.

## Ativação num ambiente de pré-visualização

1. Criar/selecionar um projeto Supabase para o ambiente pretendido. Aplicar `supabase/migrations/202610110001_portal.sql` através do fluxo de migrações do projeto. A migração é aditiva.
2. Configurar no servidor as variáveis descritas em `.env.example`. Usar a publishable key no cliente SSR e a service-role key apenas no servidor. Nunca usar `NEXT_PUBLIC_` para esta última.
3. Definir `PORTAL_APP_URL` com a origem exata (HTTPS no alojamento). Desativar `PORTAL_LOCAL_MODE`; os scripts `dev:portal` e `start:portal` são só para loopback.
4. Em Supabase Auth, ativar email, configurar Site URL/URLs autorizadas, SMTP e limites de envio adequados. Personalizar o template de acesso para mostrar `{{ .Token }}`. O percurso usa código numérico introduzido em `/acesso`, sem callback externo nem palavra-passe.
5. Depois de configurar e rever o ambiente, definir `PORTAL_REMOTE_ENABLED=1` e `PORTAL_AUTH_EMAILS_ENABLED=1`. Estes interruptores estão desligados por defeito. Clicar em “Receber código” num ambiente ativo enviará um email de autenticação; isso não foi feito durante o desenvolvimento.
6. Um administrador adiciona os UUIDs dos utilizadores autorizados a `public.portal_team`. Não existe opção pública para atribuir esse papel. Confirmar que contas de equipa não surgem como clientes.
7. Testar com contas controladas: código válido/expirado, retoma após logout, isolamento A/B, consulta da equipa, gravação concorrente, submissão e exportação. Verificar cookies seguros e renovação de sessão. Os testes locais não comprovam SMTP, configuração do Auth ou políticas no projeto alojado.
8. Finalizar o aviso de privacidade, política de conservação e procedimentos operacionais previstos no plano antes de receber respostas reais. `/privacidade` continua identificado como preparação.

## Fronteira de confiança

Os browsers só comunicam com as rotas Next do mesmo site. As leituras ao Supabase usam o JWT autenticado e RLS. As escritas são validadas no servidor; só as RPC de backend têm acesso privilegiado. O serviço verifica a identidade com `getUser`, consulta o papel na tabela protegida e passa esse ator às RPC. Não aceitar IDs de proprietário, papéis ou snapshots do cliente.

Não é necessário proxy de renovação para Server Components nesta implementação: os dados protegidos são carregados através de Route Handlers, onde o cliente SSR pode atualizar cookies. Se forem introduzidas leituras protegidas em Server Components, rever o fluxo de renovação antes de as usar.

## Ainda não implementado

Transporte de notificações (a fila fica em `pending_configuration`), anexos, convites administrativos, pedidos de complemento, múltiplos projetos por contacto, PDF/CSV, gestão de backups e teste de restauro. O Supabase aplica limites ao Auth; proteção adicional contra abuso/CAPTCHA precisa de ser ajustada ao ambiente público antes da abertura.

## Referências consultadas

- [Supabase: acesso por email e OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase: cliente SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase: limites do Auth](https://supabase.com/docs/guides/auth/rate-limits)
- [Revisão do esquema e testes](execution/SCHEMA-REVIEW.md)
