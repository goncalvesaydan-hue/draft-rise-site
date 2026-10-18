# Portal de Onboarding & Questionário — WhatsApp Business Bot (Meta API)

**Projeto:** Draft & Rise (`draftandrise.com`)  
**Objetivo:** Sistema privado de recolha de informação técnica (Onboarding Pós-Venda) para treinar e configurar o Agente de Inteligência Artificial no WhatsApp Business (API Oficial da Meta).

---

## 1. Visão Geral e Como Funciona na Prática

Este sistema faz parte do website `draftandrise.com`, mas funciona de forma **100% invisível para o público geral**:

1. **Invisível no site público:**
   - Não existe qualquer botão ou link nos menus públicos do site nem no rodapé.
   - Está bloqueado no `robots.txt` e excluído do `sitemap.xml` (com `noindex`), pelo que nunca aparece em pesquisas do Google.
   - Só acede quem receber o link diretamente da equipa Draft & Rise.

2. **Quando é utilizado:**
   - Depois de a equipa Draft & Rise falar com o cliente e fechar o serviço de **Automação de WhatsApp Bot**.
   - A equipa envia ao cliente o link direto:  
     👉 **`https://draftandrise.com/questionario`**

3. **Para que serve a informação recolhida:**
   - O cliente preenche ao seu ritmo as **8 etapas** sobre o funcionamento real da sua empresa (horários, catálogo de serviços/preços, regras de marcação, perguntas frequentes, o que o bot nunca deve inventar, quando deve passar a conversa para um humano e dados para a API Oficial da Meta).
   - Quando termina (ou enquanto preenche), a equipa entra em **`https://draftandrise.com/equipa`**, consulta todas as respostas e **exporta o ficheiro `.md` estruturado** pronto para alimentar o *System Prompt* / Base de Conhecimento do Agente de IA.

---

## 2. Fluxo de Acesso do Cliente (Aprovação por Código em `geral@draftandrise.com`)

Para garantir que **nenhum curioso ou concorrente** entra no questionário sem autorização da Draft & Rise, o acesso do cliente funciona com validação controlada pela equipa:

```
[Cliente abre /questionario]
        │
        ▼
[Preenche Nome + Empresa + E-mail em /acesso]
        │
        ▼
[Sistema gera Código de 6 dígitos] ──► Enviado para geral@draftandrise.com
        │                              + Visível na hora no Painel /equipa
        ▼
[Equipa fornece o código ao cliente (WhatsApp / Email)]
        │
        ▼
[Cliente introduz o código e entra na sua ficha (/cliente)]
        │
        ▼
[Preenche as 8 etapas · Pode Guardar Rascunho e retomar quando quiser]
```

### Passo a passo do cliente:
1. O cliente abre `draftandrise.com/questionario` e clica em **Iniciar / Retomar Questionário** (`/acesso`).
2. Na aba **Acesso de Cliente**, preenche:
   - **O seu nome** (ex.: *João Silva*)
   - **Nome da empresa** (ex.: *Clínica Sorriso*)
   - **O seu e-mail** (ex.: *joao@clinicasorriso.pt*)
3. Ao clicar em **Pedir código de acesso**:
   - O sistema gera um **código único de 6 dígitos** (válido por 24 horas).
   - Esse código **não** é entregue automaticamente a desconhecidos: é enviado para **`geral@draftandrise.com`** e fica imediatamente visível no topo do **Painel da Equipa (`/equipa`)** com o Nome, Empresa e E-mail do cliente.
4. A equipa Draft & Rise envia o código ao cliente (por exemplo, na conversa de WhatsApp onde já estão a falar com ele).
5. O cliente introduz o código de 6 dígitos e entra diretamente na sua ficha (`/cliente`).
6. **Guardar e Retomar:**
   - A ficha fica associada ao e-mail daquele cliente.
   - O cliente pode clicar em **Guardar** em qualquer altura, fechar o telemóvel ou computador, e voltar noutro dia para continuar exatamente do ponto onde ficou.

---

## 3. Acesso da Equipa Draft & Rise (6 Contas com Permissões Diferenciadas)

Os membros da equipa entram em **`https://draftandrise.com/equipa`** (ou na aba **Equipa** em `/acesso`) usando o seu utilizador e palavra-passe individual — sem precisarem de esperar por códigos de e-mail.

### Credenciais e Níveis de Permissão das 6 Contas

| Utilizador | Nome no Painel | Palavra-passe | Nível de Acesso | O que pode fazer |
| :--- | :--- | :--- | :--- | :--- |
| **`user1`** | **Admin Total · user1** | `DR-User1-8492` | 🟢 **Super Admin (Controlo Total)** | **Pode mexer e alterar tudo:** editar todas as respostas das 8 etapas de qualquer cliente, reabrir fichas já submetidas, exportar `.md` mesmo em rascunho, gerar e **apagar** códigos de acesso e **apagar** fichas de clientes. |
| **`user2`** | Equipa · user2 (Básico) | `DR-User2-3917` | 🔵 **Equipa (Consulta & Básico)** | **Apenas consulta e alterações básicas:** ver progresso e respostas do cliente, gerar/copiar códigos de 6 dígitos, exportar `.md` final e atualizar apenas os **dados básicos de identificação/contacto** (nome da empresa, nome do responsável, cargo, email, telefone e localização). |
| **`user3`** | Equipa · user3 (Básico) | `DR-User3-6520` | 🔵 **Equipa (Consulta & Básico)** | Igual ao `user2` (consulta + edição de dados básicos). |
| **`user4`** | Equipa · user4 (Básico) | `DR-User4-9148` | 🔵 **Equipa (Consulta & Básico)** | Igual ao `user2` (consulta + edição de dados básicos). |
| **`user5`** | Equipa · user5 (Básico) | `DR-User5-2763` | 🔵 **Equipa (Consulta & Básico)** | Igual ao `user2` (consulta + edição de dados básicos). |
| **`user6`** | Equipa · user6 (Básico) | `DR-User6-5084` | 🔵 **Equipa (Consulta & Básico)** | Igual ao `user2` (consulta + edição de dados básicos). |

*(Nota: Todas as palavras-passe têm códigos distintos para que cada membro da equipa tenha o seu acesso individualizado, que pode ser alterado a qualquer momento nas variáveis de configuração `PORTAL_USER1_PASSWORD` a `PORTAL_USER6_PASSWORD`).*

---

## 4. O Que Cada Perfil Controla no Painel (`/equipa`)

### A) Todos os membros da equipa (`user1` a `user6`):
1. **Pedidos de Acesso & Códigos de Clientes (no topo do painel):**
   - Ver todos os clientes que pediram acesso (Nome, Empresa, E-mail, Hora do pedido) e copiar o **código de 6 dígitos** ou a **mensagem pronta para WhatsApp** com 1 clique.
   - Gerar um novo código de 6 dígitos diretamente no painel para um novo cliente.
2. **Dados Básicos da Empresa & Contacto (`/equipa/fichas/[id]`):**
   - Atualizar ou corrigir os campos básicos de identificação do cliente (`Nome da empresa`, `Nome do responsável`, `Cargo`, `E-mail`, `Telefone/WhatsApp` e `Localização`).
3. **Consulta Detalhada e Exportação para IA (`.md`):**
   - Consultar todas as respostas organizadas pelas 8 etapas e descarregar a ficha `.md` submetida para treinar o Agente de WhatsApp da Meta.

### B) Exclusivo do `user1` (Super Admin — Controlo Total):
1. **Editar Questionário Completo (8 Etapas):**
   - Dentro de qualquer ficha (`/equipa/fichas/[id]`), o `user1` tem o botão **«Editar questionário completo (8 etapas)»**, que abre o editor completo permitindo alterar ou preencher qualquer resposta técnica pelo cliente.
2. **Reabrir Fichas Submetidas:**
   - Caso um cliente já tenha submetido o questionário mas seja preciso mudar respostas, o `user1` pode clicar em **«Reabrir ficha p/ editar tudo (user1)»**.
3. **Exportar Markdown a Qualquer Momento:**
   - Mesmo que a ficha ainda esteja em rascunho, o `user1` pode exportar logo o ficheiro `.md`.
4. **Apagar Fichas e Revogar Códigos:**
   - Apenas o `user1` pode eliminar fichas de clientes ou apagar códigos de acesso gerados.


---

## 5. Estrutura das 8 Etapas do Questionário (`v1.json`)

O questionário adapta automaticamente as perguntas consoante o **setor** e os **objetivos** escolhidos pelo cliente:

1. **Etapa 1 — Empresa:** Nome da empresa, responsável, contactos e quem aprova as informações do bot.
2. **Etapa 2 — Objetivos:** Setor de atividade (Restaurante, Clínica, Barbearia/Estética, Loja, Imobiliária, Oficina, etc.) e o que pretende automatizar no WhatsApp.
3. **Etapa 3 — Operação:** Horários de funcionamento, serviços/produtos principais, preços, prazos, regras de marcação/reservas e políticas de cancelamento.
4. **Etapa 4 — Dados e Atendimento:** Tom de voz da marca (formal, próximo, direto), idiomas, perguntas mais frequentes dos clientes e situações em que o bot deve passar imediatamente para um humano.
5. **Etapa 5 — Sistemas e Controlo (Meta WhatsApp API):** Número de telefone a ligar à API Oficial da Meta, calendário/software atual e onde a equipa quer receber os alertas de novos pedidos.
6. **Etapa 6 — O Seu Setor:** Perguntas específicas adaptadas ao ramo do cliente (ex.: mesas/esplanada/alergénios para restaurantes; especialidades/seguros para clínicas; serviços/profissionais para salões).
7. **Etapa 7 — Documentos e Links:** Menus, tabelas de preços, website, redes sociais ou documentos de apoio existentes.
8. **Etapa 8 — Revisão e Envio:** Resumo completo onde o cliente revê tudo o que preencheu antes de submeter a versão final.

---

## 6. Rotas do Sistema

| Rota | Quem usa | Função |
| :--- | :--- | :--- |
| **`/questionario`** | Cliente | Página de apresentação privada do Questionário de Onboarding |
| **`/acesso`** | Cliente & Equipa | Login do Cliente (Nome + Empresa + E-mail + Código) e Login da Equipa (`user1`..`user6` + Password) |
| **`/cliente`** | Cliente | Área de trabalho do cliente para preencher, guardar rascunho e rever as 8 etapas |
| **`/equipa`** | Equipa (`user1`..`user6`) | Painel de controlo com códigos de acesso ativos, lista de clientes, respostas e exportação `.md` |
| **`/ajuda`** | Cliente | Guia rápido de apoio ao preenchimento da ficha |

