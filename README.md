# Draft & Rise

Website em português para a Draft & Rise, com apresentação do negócio, método interativo, soluções e contacto por email.

## Desenvolvimento

```bash
npm ci
npm run dev
```

Abrir http://localhost:3000. Para usar outra porta:

```bash
npm run dev -- --port 3100
```

## Verificação e produção local

```bash
npm run lint
npm run build
npm run start
```

O projeto usa Next.js 16, React 19, Tailwind CSS 4 e Motion. Antes de alterar APIs do Next.js, consultar a documentação da versão instalada em `node_modules/next/dist/docs/`, conforme `AGENTS.md`.

## Conteúdo e edição

- `src/app/page.tsx`: composição da página.
- `src/app/layout.tsx`: idioma, fontes e metadados.
- `src/app/globals.css`: estilos, tamanhos de ecrã e movimento reduzido.
- `src/components/`: navegação, abertura, método, soluções, contacto e rodapé.
- `public/images/`: fotografia conceptual; direção visual e origem em [DESIGN.md](DESIGN.md).

O contacto usa `mailto:Suporte.draftandrise@gmail.com` e abre a aplicação de email do visitante. A escolha de interesse preenche o assunto. Não existe envio de mensagens pelo servidor nem armazenamento de dados de contacto.

## Validação realizada em 30 de setembro de 2026

- ESLint e compilação de produção concluídos com sucesso.
- Imagens carregadas e ausência de erros ou avisos na consola durante a verificação no Chrome.
- Sem deslocamento horizontal da página nas larguras de 302, 390, 768 e 1440 px.
- Menu móvel: abertura, fecho com Escape e devolução do foco ao botão.
- Seleção das etapas do método e atualização do assunto do email verificadas no navegador.

Estas verificações não substituem uma auditoria completa de acessibilidade ou testes em outros navegadores.

## Questionário integrado (branch local)

O portal está agora nesta aplicação: `/questionario`, `/acesso`, `/cliente` e `/equipa`.

Com Node 24 ou superior:

```sh
npm ci
npm run dev:portal -- --port 3001
```

Abrir `http://127.0.0.1:3001/questionario`. Este comando ativa exclusivamente a demonstração local, com dados fictícios. `npm run dev` mantém o modo local desligado por defeito; sem configuração remota mostra o estado de preparação.

- [Estado e limitações](docs/execution/STATUS.md)
- [Configuração Supabase](docs/SUPABASE.md)
- [Verificações](docs/execution/VERIFICATION.md)
- [Cobertura das perguntas](docs/question-mapping.md)

Verificações: `npm test`, `npm run lint`, `npm run typecheck`, `npm run test:e2e`, `npm run build`. Para testar a compilação sem acesso remoto: `PORTAL_E2E_PUBLIC=1 npm run test:e2e`. Os testes de navegador usam Chrome e portas 3200/3201; o teste de domínio usa apenas dados fictícios.
