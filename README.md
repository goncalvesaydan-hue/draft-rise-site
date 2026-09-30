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

O contacto usa `mailto:ola@draftrise.pt` e abre a aplicação de email do visitante. A escolha de interesse preenche o assunto. Não existe envio de mensagens pelo servidor nem armazenamento de dados de contacto.

## Validação realizada em 30 de setembro de 2026

- ESLint e compilação de produção concluídos com sucesso.
- Imagens carregadas e ausência de erros ou avisos na consola durante a verificação no Chrome.
- Sem deslocamento horizontal da página nas larguras de 302, 390, 768 e 1440 px.
- Menu móvel: abertura, fecho com Escape e devolução do foco ao botão.
- Seleção das etapas do método e atualização do assunto do email verificadas no navegador.

Estas verificações não substituem uma auditoria completa de acessibilidade ou testes em outros navegadores.
