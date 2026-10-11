# Configuração remota — 11 de outubro de 2026

## Concluído

- Organização Draft & Rise (Free), projeto `draft-rise-portal`, referência `rqbrijnzzjebimviuwtn`, região apresentada pelo dashboard: eu-west-2 / West Europe (London).
- Aplicada pelo SQL Editor, numa transação explícita, a migração `202610110001_portal.sql`. SHA-256: `073db9b4c370d7fe122ab6552fb4346f8e29936933fea8cfef72f06a3458ce2c`.
- Dashboard confirmou sucesso. Verificação posterior: cinco tabelas, RLS ativo e uma política de leitura em cada; sem SELECT para anon e sem INSERT para authenticated.
- Chaves existentes guardadas apenas em `.env.local` com autorização explícita do utilizador. Modo 0600 e exclusão do Git confirmados. Usada a chave `secret` atual do Supabase no campo de configuração do servidor `SUPABASE_SERVICE_ROLE_KEY`; não foi criada nem rodada nenhuma chave.
- Teste de ligação pelo SDK: HTTP 200 e contagem zero nas cinco tabelas com chave de servidor. Pedido anónimo: HTTP 401, bloqueado.
- `PORTAL_LOCAL_MODE=0`, `PORTAL_REMOTE_ENABLED=1`, `PORTAL_AUTH_EMAILS_ENABLED=0`. Origem local: http://127.0.0.1:3001.

## Pendente

- SMTP ainda não configurado. O dashboard deste plano exige SMTP próprio (ou outro percurso disponível) para personalizar o template; o template atual Magic link or OTP contém apenas um link, enquanto a aplicação espera um código.
- Definir serviço, domínio/remetente e credenciais SMTP. Não foram enviados emails.
- Configurar templates, URLs e testar autenticação real, cookies, gravação e submissão com contas controladas. O teste realizado foi de conectividade/permissões anónimas, não do percurso autenticado remoto completo.
- Nenhum utilizador foi acrescentado à equipa. Nenhuma resposta real ou fictícia foi criada remotamente.
- Nenhum push, publicação ou configuração de chaves na Vercel foi efetuado. A autorização das chaves abrange apenas armazenamento local.

## Continuidade de migrações

Esta aplicação foi feita manualmente no SQL Editor; não foi registada pelo Supabase CLI no histórico de migrações. Não executar novamente a migração inicial, pois as tabelas já existem. Ao introduzir o CLI, reconciliar primeiro o histórico com este hash e com o esquema remoto. Alterações seguintes devem ser novas migrações aditivas.
