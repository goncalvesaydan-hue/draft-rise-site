# 📋 Relatório de Estado Geral do Projeto · Draft & Rise
**Website Oficial & Portal Técnico de Onboarding · Bot WhatsApp Business AI (Meta Oficial)**

> **Data do Relatório:** Domingo, 18 de Outubro de 2026  
> **Hora de Emissão:** 20:20:29 WEST (Lisboa / GMT+1)  
> **Versão da Plataforma:** 1.0.0 (Pronto para Produção)  
> **Estado Global do Sistema:** 🟢 **100% Operacional & Testado** (Build, Typecheck e 12/12 Testes Unitários Aprovados)  
> **Repositório Git:** Sincronizado com `origin/main` (Commit `1408d12`)

---

## 🧭 1. Resumo Executivo

O projeto **Draft & Rise** encontra-se totalmente funcional, combinando o website institucional de alta conversão para serviços de automação e inteligência artificial com um **Portal Privado de Onboarding** para clientes do serviço de **Bot Oficial de WhatsApp Business (Meta Cloud API)**.

Todo o fluxo foi desenhado para maximizar a conversão e a eficiência operacional da equipa:
1. A equipa fecha contrato de Bot WhatsApp com o cliente.
2. É enviado ao cliente o **Guia em PDF Oficial** juntamente com o link `draftandrise.com/questionario`.
3. O cliente acede e recebe o seu código de 6 dígitos (enviado pela equipa no WhatsApp e com cópia enviada automaticamente para `geral@draftandrise.com`).
4. O cliente responde às 8 etapas sobre o seu negócio (podendo pausar e guardar o rascunho em qualquer momento).
5. A equipa da Draft & Rise acompanha tudo em tempo real através do painel `/equipa` com 6 contas dedicadas (`user1` Super Admin com controlo total, e `user2` a `user6` para consulta e edição de dados básicos).
6. Após a submissão, a equipa descarrega o ficheiro formatado `.md` com o prompt de treino pronto a carregar no Agente de IA.

---

## 🌐 2. Mapa de Rotas e Páginas do Site

### A. Website Público
| Rota | Descrição | Estado |
| :--- | :--- | :--- |
| `/` | Landing page principal: Hero, Proposta de Valor, Serviços IA, Portfólio, Depoimentos, FAQ e Contacto. | 🟢 Ativo |
| `/termos` | Termos e Condições de Serviço em PT-PT. | 🟢 Ativo |
| `/privacidade` | Política de Privacidade e Tratamento de Dados (RGPD). | 🟢 Ativo |
| `/sitemap.xml` | Mapa do site gerado dinamicamente para indexação em motores de busca. | 🟢 Ativo |
| `/robots.txt` | Diretivas de indexação para rastreadores (Google, Bing). | 🟢 Ativo |

### B. Portal Privado do Questionário WhatsApp (Invisível no Menu Público)
| Rota | Descrição | Acesso |
| :--- | :--- | :--- |
| `/questionario` | Página de boas-vindas ao questionário técnico com explicação das etapas. | Clientes / Equipa |
| `/acesso` | Página de login com separador duplo: **Cliente** (código de 6 dígitos) e **Equipa** (utilizador + palavra-passe). Suporta deep-links (`?tab=team` e `?email=...&mode=code`). | Público / Privado |
| `/cliente/[id]/preencher/[step]` | Formulário interativo das 8 etapas do questionário com autosave, barra de progresso e validação. | Cliente autenticado / Admin |
| `/cliente/[id]/confirmacao` | Ecrã de sucesso pós-submissão com referência oficial (`REC-XXXXXXXX`) e resumo das respostas. | Cliente autenticado / Admin |
| `/equipa` | Painel de controlo da equipa: visualização em tempo real de questionários, códigos ativos de 6 dígitos com 1-clique "Copiar p/ WhatsApp", exportação Markdown e gestão de clientes. | Equipa (`user1` a `user6`) |
| `/equipa/fichas/[id]` | Vista detalhada de uma ficha individual com modo de edição. | Equipa (`user1` a `user6`) |
| `/equipa/notificacoes` | Histórico de notificações geradas e alertas da plataforma. | Equipa (`user1` a `user6`) |
| `/ajuda` | Documentação técnica e FAQ de suporte interno ao preenchimento. | Clientes / Equipa |

---

## 📝 3. As 8 Etapas do Questionário Técnico de IA

O questionário foi desenhado especificamente para extrair a informação exata necessária para configurar o Bot Oficial da Meta:

1. **Etapa 1 · Identificação do Negócio:** Nome comercial, setor de atividade (restauração, clínica, imobiliário, fitness, etc.), contactos principais e morada.
2. **Etapa 2 · Catálogo de Serviços & Produtos:** Listagem de serviços principais, preçários médios, pacotes e links para menus/brochuras.
3. **Etapa 3 · Horários & Regras de Atendimento:** Horário de funcionamento, intervalos de almoço, regras de agendamento e tempos de resposta.
4. **Etapa 4 · Tom de Voz da Marca:** Seleção da personalidade do bot (Formal, Amigável, Premium, Descontraído) e pronomes de tratamento ("você" vs "tu").
5. **Etapa 5 · Perguntas Frequentes (FAQ):** Respostas prontas para as 5 a 10 dúvidas mais comuns dos clientes do negócio.
6. **Etapa 6 · Transbordo Humano (Escalamento):** Regras de quando a IA deve passar a conversa para um atendente humano real e contactos de urgência.
7. **Etapa 7 · Ficheiros & Links Complementares:** Upload de documentos, links de redes sociais, preçários em PDF e catálogo WhatsApp Business.
8. **Etapa 8 · Revisão & Submissão Final:** Validação de todos os dados preenchidos, pré-visualização completa e submissão com geração de referência imutável.

---

## 👥 4. Sistema de Utilizadores & Permissões da Equipa

Foram configurados 6 utilizadores independentes com separação rigorosa de funções:

| Utilizador | Perfil / Nome | Nível de Acesso | Permissões Específicas |
| :--- | :--- | :--- | :--- |
| **`user1`** | **Admin Total** | 🔴 **Super Administrador** | **Controlo Total:** Edita qualquer etapa das fichas, reabre fichas já submetidas, apaga fichas e códigos, exporta Markdown de treino e gere todas as configurações. |
| **`user2`** | Equipa · Consulta & Básico | 🟡 **Operador de Equipa** | Consulta todas as respostas em tempo real, gera e copia códigos de 6 dígitos para o WhatsApp, edita dados básicos (Empresa, Contacto, Telefone) e descarrega ficheiro `.md`. |
| **`user3`** | Equipa · Consulta & Básico | 🟡 **Operador de Equipa** | Mesmas permissões operacionais do `user2`. |
| **`user4`** | Equipa · Consulta & Básico | 🟡 **Operador de Equipa** | Mesmas permissões operacionais do `user2`. |
| **`user5`** | Equipa · Consulta & Básico | 🟡 **Operador de Equipa** | Mesmas permissões operacionais do `user2`. |
| **`user6`** | Equipa · Consulta & Básico | 🟡 **Operador de Equipa** | Mesmas permissões operacionais do `user2`. |

*Nota de Segurança:* As palavras-passe individuais constam nos PDFs gerados em `documents/` e podem ser alteradas a qualquer momento diretamente no painel da Vercel através das variáveis `PORTAL_TEAM_USER1_PASS`, etc., sem necessidade de alterar o código.

---

## 🔒 5. Camadas de Segurança e Conformidade (Auditadas)

A segurança da plataforma foi validada segundo as normas mundiais **OWASP Top 10**:

1. **Proteção contra SQL Injection (100% Imune):**
   - No modo SQLite local, todas as queries usam *Prepared Statements* parametrizados com `?`.
   - No modo Supabase Cloud, toda a comunicação é gerida pelo SDK oficial via chamadas parametrizadas em protocolo binário. Nenhuma string de SQL é concatenada dinamicamente.
2. **Row Level Security (RLS) no Supabase:**
   - O acesso anónimo e público às tabelas é **totalmente revogado** (`revoke all from anon, authenticated`).
   - Apenas o backend do servidor Next.js com a chave privada `service_role` consegue comunicar com a base de dados.
3. **Proteção contra Força Bruta (Anti-Brute Force):**
   - Bloqueio automático de 15 minutos na tabela `portal_auth_attempts` se um utilizador ou IP falhar 5 tentativas consecutivas.
   - Códigos de 6 dígitos de clientes são destruídos automaticamente após 5 tentativas falhadas.
4. **Sessões HTTP-Only:**
   - Os tokens de sessão são gerados com 256 bits de entropia criptográfica (`crypto.randomBytes(32)`).
   - Apenas o **hash SHA-256** do token é persistido na base de dados.
   - Os cookies são emitidos com `httpOnly: true`, `sameSite: strict` e `secure: true`, impedindo roubo por extensões maliciosas ou scripts XSS.
5. **Comparações em Tempo Constante:**
   - As palavras-passe e códigos são verificados com `crypto.timingSafeEqual` para prevenir ataques de análise de tempo (*timing attacks*).

---

## 📦 6. Inventário de Ficheiros e Documentação em `documents/`

Todos os documentos de suporte, ficheiros de configuração e guias oficiais encontram-se organizados na pasta [`documents/`](file:///Users/aydangoncalves/Desktop/DRAFT%20and%20RISE/documents/):

| Ficheiro | Tipo | Finalidade |
| :--- | :--- | :--- |
| [`PORTAL-QUESTIONARIO-WHATSAPP.md`](./PORTAL-QUESTIONARIO-WHATSAPP.md) | Documentação Técnica | Explicação completa da arquitetura do portal, regras de negócio e fluxos de dados. |
| [`LOGINS-EQUIPA-PORTAL.md`](./LOGINS-EQUIPA-PORTAL.md) | Credenciais da Equipa | Tabela confidencial com utilizadores, palavras-passe e permissões. |
| [`GUIA-PRODUCAO-VERCEL.md`](./GUIA-PRODUCAO-VERCEL.md) | Manual de Deploy | Guia passo a passo para configurar o Supabase, Resend e Vercel em produção. |
| [`SUPABASE-SETUP.sql`](./SUPABASE-SETUP.sql) | Script SQL | Script 1-clique para criar as 7 tabelas e permissões RLS no Supabase SQL Editor. |
| [`guia-cliente-questionario.pdf`](./guia-cliente-questionario.pdf) | **PDF Oficial A4** | **Guia do Cliente:** Documento de apoio para enviar pelo WhatsApp logo após fechar contrato. |
| [`acesso-equipa-user1.pdf`](./acesso-equipa-user1.pdf) | **PDF Oficial A4** | Guia de acesso individual e credenciais do **Utilizador 1 (Admin Total)**. |
| [`acesso-equipa-user2.pdf`](./acesso-equipa-user2.pdf) | **PDF Oficial A4** | Guia de acesso individual e credenciais do **Utilizador 2 (Equipa)**. |
| [`acesso-equipa-user3.pdf`](./acesso-equipa-user3.pdf) | **PDF Oficial A4** | Guia de acesso individual e credenciais do **Utilizador 3 (Equipa)**. |
| [`acesso-equipa-user4.pdf`](./acesso-equipa-user4.pdf) | **PDF Oficial A4** | Guia de acesso individual e credenciais do **Utilizador 4 (Equipa)**. |
| [`acesso-equipa-user5.pdf`](./acesso-equipa-user5.pdf) | **PDF Oficial A4** | Guia de acesso individual e credenciais do **Utilizador 5 (Equipa)**. |
| [`acesso-equipa-user6.pdf`](./acesso-equipa-user6.pdf) | **PDF Oficial A4** | Guia de acesso individual e credenciais do **Utilizador 6 (Equipa)**. |

---

## ⚡ 7. Comandos de Manutenção e Execução

- **Arrancar em Desenvolvimento Local (com SQLite):**
  ```bash
  npm run dev
  # Abre em http://localhost:3000 com o portal 100% ativo e funcional offline
  ```
- **Executar a Suíte de Testes Unitários:**
  ```bash
  npm test
  # Executa os 12 testes do sistema (RLS Postgres, Conflitos de Revisão, Imutabilidade, etc.)
  ```
- **Verificação Estrita de Tipos TypeScript:**
  ```bash
  npm run typecheck
  ```
- **Compilação de Produção Next.js:**
  ```bash
  npm run build
  ```

---

*Relatório arquivado com sucesso no repositório da Draft & Rise em `documents/ESTADO-GERAL-DO-PROJETO.md`.*
