# Integração Draft & Rise — estado

11 de outubro de 2026. Branch local `feat/questionario-integrado`, baseada em `f77339760ed665e0bb0d730220dd065a074b17f4`.

## Implementado

- Entrada `/questionario`, ligações desktop/mobile e contacto, mesma aplicação Next e identidade Draft & Rise.
- Formulário de 179 perguntas/grupos, oito etapas, aplicabilidade, gravação, retoma, revisão, submissão e exportação Markdown.
- Áreas de cliente e equipa. Estilos com prefixo `p-` e âmbito `.dr-portal`; a navegação de regresso ao site conserva os estilos institucionais.
- Demonstração SQLite em loopback com perfis fictícios; recusada na Vercel. Sem modo local nem configuração remota, a entrada apresenta preparação e contacto.
- Código de confirmação por OTP e cookies SSR, adaptador Supabase, RLS e migração transacional. Escritas privilegiadas limitadas ao servidor após validação; snapshot, outbox e auditoria atómicos.
- Migração SQL validada com PGlite e roles de teste. Nenhuma migração remota aplicada e nenhum email enviado.

## A verificar externamente

Configurar Supabase, Auth/SMTP e domínio de pré-visualização, validar com contas controladas e finalizar o aviso de privacidade. Ver [SUPABASE.md](../SUPABASE.md).

A integração local está funcional. O percurso Supabase está implementado mas ainda não foi verificado contra um serviço alojado. Não declarar pronto para receber dados reais com base nos testes locais.

## Fora desta entrega

Anexos privados, convites administrativos, complementos, notas e atribuições, envio de notificações, PDF/CSV e restauração de backups. Estes módulos continuam no plano principal; não foram simulados como concluídos.

Nenhum commit, push ou publicação foi realizado. O site remoto permanece inalterado.

## Atualização: Supabase configurado localmente

A migração foi agora aplicada ao projeto remoto e as chaves foram configuradas apenas na cópia local. A conectividade às cinco tabelas e o bloqueio anónimo passaram. SMTP e percurso autenticado continuam pendentes. Este registo substitui as indicações anteriores de que não existia configuração remota: ver [REMOTE-SETUP.md](REMOTE-SETUP.md).
