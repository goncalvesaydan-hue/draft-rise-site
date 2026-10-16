# Guia Completo — Conformidade Legal, Privacidade (RGPD) e Condições de Utilização
**Projeto:** Draft & Rise (`draftandrise.com`)  
**Jurisdição:** Portugal / União Europeia  
**Contacto Oficial:** `geral@draftandrise.com` | `+351 928 384 627` (WhatsApp & Telefone)

---

## 1. Enquadramento Legal Aplicável em Portugal

Qualquer website institucional ou plataforma digital a operar em Portugal que recolha dados de contacto ou informações de clientes está sujeito a um conjunto específico de diplomas legais:

1. **RGPD — Regulamento Geral sobre a Proteção de Dados (Regulamento (UE) 2016/679):** Define as regras europeias sobre recolha, tratamento, armazenamento e direitos dos titulares de dados pessoais.
2. **Lei n.º 58/2019, de 8 de agosto:** Lei portuguesa que assegura a execução do RGPD no território nacional (fiscalizada pela **CNPD — Comissão Nacional de Proteção de Dados**).
3. **Lei n.º 41/2004 (alterada pela Lei n.º 46/2012 — Diretiva *ePrivacy*):** Regula a utilização de *cookies*, armazenamento local no navegador e envio de comunicações eletrónicas.
4. **Decreto-Lei n.º 7/2004 (Lei do Comércio Eletrónico):** Regula a prestação de serviços da sociedade da informação, transparência da entidade prestadora e validade das comunicações eletrónicas.
5. **Código do Direito de Autor e dos Direitos Conexos (CDADC) e Código da Propriedade Industrial:** Protegem o nome, logótipo, identidade visual, textos, fotografias e código-fonte da **Draft & Rise**.

---

## 2. O Que Está Implementado no Website da Draft & Rise

O website conta agora com duas páginas legais autónomas, acessíveis a partir do rodapé de todas as páginas públicas ([`src/components/Footer.tsx`](../src/components/Footer.tsx)) e do portal do questionário ([`src/components/portal/brand.tsx`](../src/components/portal/brand.tsx)):

| Página | Rota | Ficheiro no Código | Objetivo Principal |
| :--- | :--- | :--- | :--- |
| **Política de Privacidade e Cookies** | `/privacidade` | [`src/app/privacidade/page.tsx`](../src/app/privacidade/page.tsx) | Cumprir os artigos 13.º e 14.º do RGPD (dever de informação ao titular dos dados) e a lei dos *cookies*. |
| **Condições de Utilização** | `/termos` | [`src/app/termos/page.tsx`](../src/app/termos/page.tsx) | Proteger a propriedade intelectual da agência, regular o uso do questionário e delimitar responsabilidades. |

---

## 3. Análise Detalhada da Política de Privacidade (`/privacidade`)

### 3.1. Identificação do Responsável pelo Tratamento (Secção 1)
O RGPD exige que o visitante saiba quem trata os seus dados e como contactar essa entidade.
* **Como está agora:** Identifica a **Draft & Rise**, com atuação em Portugal, o email oficial `geral@draftandrise.com` e o contacto `+351 928 384 627`.
* **O que atualizar quando a empresa/atividade estiver formalizada nas Finanças:**
  Na Secção 1 de [`src/app/privacidade/page.tsx`](../src/app/privacidade/page.tsx), acrescentar os dados societários ou fiscais:
  > *«A **Draft & Rise** ([Nome da Sociedade, Lda. / Nome do Empresário em Nome Individual], NIF/NIPC [XXXXXXXXX], com sede em [Morada / Localidade]), é a entidade responsável pelo tratamento dos dados pessoais...»*

### 3.2. Mapa de Dados Recolhidos e Finalidades (Secção 2)
O princípio da **minimização dos dados** (art. 5.º, n.º 1, alínea c) do RGPD) obriga a recolher apenas o que é necessário. No site da Draft & Rise existem 3 fluxos de dados:

1. **Contacto via Email (`mailto:`) e WhatsApp (`wa.me`):**
   * **Dados:** Nome, email, número de telefone, nome do negócio e temas de interesse selecionados.
   * **Finalidade:** Responder ao pedido de contacto e apresentar propostas comerciais ou prestar suporte.
2. **Questionário de Diagnóstico (`/questionario`):**
   * **Dados:** Identificação comercial, setor do negócio, horários, fluxos de atendimento, ferramentas usadas e objetivos de automação.
   * **Finalidade:** Elaborar o diagnóstico técnico e o plano de automação/presença digital à medida do cliente.
3. **Autenticação no Portal (`/acesso`):**
   * **Dados:** Endereço de email (para código temporário OTP) e *cookie* técnico de sessão.
   * **Finalidade:** Permitir guardar o rascunho do questionário e retomá-lo com segurança.

### 3.3. Fundamento Jurídico do Tratamento (Secção 3)
Nenhum dado pessoal pode ser tratado sem uma base legal válida do **Artigo 6.º do RGPD**:
* **Diligências pré-contratuais a pedido do titular (art. 6.º, n.º 1, al. b):** Aplica-se sempre que um potencial cliente contacta a Draft & Rise ou preenche o questionário para receber uma proposta. **Não exige um consentimento separado por checkbox** porque é o próprio cliente que solicita o contacto/diagnóstico.
* **Consentimento (art. 6.º, n.º 1, al. a):** Aplica-se às informações enviadas voluntariamente pelo utilizador.
* **Interesse legítimo e obrigações legais (art. 6.º, n.º 1, als. c e f):** Segurança da aplicação (registos de auditoria contra acessos indevidos) e faturação/contabilidade.

### 3.4. Prazos de Conservação (Secção 4)
O RGPD proíbe guardar dados «para sempre» sem critério:
* **Contactos e questionários que não avançam para contrato:** Definido o prazo máximo de **12 meses** após o último contacto.
* **Clientes ativos:** Conservados durante toda a relação contratual e pelos prazos fiscais obrigatórios em Portugal (10 anos para documentos contabilísticos/faturas, nos termos do Código do IVA e IRC).

### 3.5. Subcontratantes Tecnológicos e Localização dos Dados (Secção 5)
Mesmo que a Draft & Rise não venda dados a terceiros, utiliza infraestrutura tecnológica (*subcontratantes* / *processors*):
* **Vercel:** Alojamento do website Next.js.
* **Supabase:** Base de dados PostgreSQL e autenticação do questionário.
  * **Recomendação crítica de RGPD:** Ao criar ou manter o projeto no Supabase, escolher sempre uma **região dentro da União Europeia** (ex.: `eu-central-1` Frankfurt ou `eu-west-1` Irlanda). Assim, os dados nunca saem do Espaço Económico Europeu.
* **Google Workspace / Serviço de Email e WhatsApp (Meta):** Canais de comunicação direta iniciados pelo próprio utilizador.

### 3.6. Direitos dos Titulares e Como Responder a Pedidos (Secção 6)
Qualquer pessoa pode enviar um email para `geral@draftandrise.com` a pedir para ver, corrigir ou apagar os seus dados.
* **Prazo legal de resposta:** **Até 30 dias seguidos** (1 mês) a contar da receção do pedido (art. 12.º, n.º 3 do RGPD).
* **Como proceder se alguém pedir para apagar os dados:**
  1. Confirmar que o pedido vem do próprio endereço de email associado aos dados.
  2. Eliminar a ficha correspondente na base de dados (Supabase) e eventuais emails de prospeção (mantendo apenas faturas se já tiver sido cliente faturado, pois a lei fiscal prevalece sobre o direito ao esquecimento).
  3. Responder por email a confirmar a eliminação:
     > *«Olá [Nome], confirmamos que, em cumprimento do seu pedido e nos termos do artigo 17.º do RGPD, procedemos à eliminação integral dos dados associados ao seu contacto/questionário na nossa base de dados. Com os melhores cumprimentos, Equipa Draft & Rise.»*

---

## 4. Política de Cookies — Quando Precisas (ou Não) de um Banner de Cookies

Uma das maiores dúvidas em Portugal prende-se com os *banners* de consentimento de *cookies*:

### 4.1. Como o site funciona atualmente (Sem necessidade de Banner)
* Neste momento, o website da Draft & Rise **não carrega scripts de rastreamento publicitário** (não tem Meta Pixel, TikTok Pixel, Hotjar nem Google Ads Remarketing) e usa apenas:
  * Fontes otimizadas pelo servidor (`next/font`);
  * *Cookies* estritamente necessários (`httpOnly`, `sameSite=lax`) quando o utilizador entra na área do questionário (`/acesso`).
* **Regra legal (Art. 5.º da Lei n.º 41/2004 e orientações da CNPD):** Os *cookies* **estritamente necessários** para o funcionamento técnico ou para prestar um serviço expressamente solicitado pelo utilizador (como manter a sessão iniciada num formulário) **estão isentos de banner de consentimento prévio**, bastando explicar a sua existência na Política de Privacidade (Secção 7 de `/privacidade`).

### 4.2. Quando passarás a precisar de um Banner de Cookies?
Se no futuro decidires instalar:
* **Google Analytics 4 (GA4)** com *cookies* de identificação;
* **Meta Pixel (Facebook/Instagram Ads)** ou **Google Ads Tag**;
* **Ferramentas de gravação de ecrã/mapas de calor** (ex.: Microsoft Clarity, Hotjar).

Nesse momento, antes de disparar esses scripts, terás de apresentar um aviso simples com dois botões de igual destaque visual (**«Aceitar»** e **«Recusar»**), carregando os scripts apenas se o visitante clicar em «Aceitar».

---

## 5. Análise Detalhada das Condições de Utilização (`/termos`)

A página [`src/app/termos/page.tsx`](../src/app/termos/page.tsx) foi desenhada para proteger juridicamente a operação da **Draft & Rise** em 5 frentes:

1. **Separação entre «Informação no Site» e «Contrato de Serviço» (Secção 2):**
   * Esclarece que as demonstrações visuais do site são ilustrativas e que qualquer serviço (Website, Perfil da Empresa no Google ou Automação) depende sempre de diagnóstico prévio e de **proposta comercial ou contrato específico** aprovado pelo cliente. Isto evita reclamações sobre expectativas não contratadas.
2. **Proteção da Propriedade Intelectual (Secção 3):**
   * Proíbe que concorrentes ou terceiros copiem os textos, a estrutura metodológica, as ilustrações ou o design da Draft & Rise.
3. **Proibição de Dados Sensíveis no Questionário (Secção 4):**
   * O Artigo 9.º do RGPD aplica regras muito pesadas a «dados sensíveis» (dados de saúde/clínicos, convicções, etc.). Caso tenhas clientes na área de clínicas, estética ou saúde que preencham o questionário de automação, a Secção 4 proíbe expressamente que o cliente cole fichas clínicas reais ou palavras-passe nas respostas do questionário.
4. **Limitação de Responsabilidade sobre Plataformas de Terceiros (Secção 5):**
   * Como trabalham com o **Perfil da Empresa no Google** e **WhatsApp**, é fundamental deixar escrito que alterações de algoritmo, suspensões ou regras internas da Google ou da Meta são controladas por essas plataformas externas, protegendo a agência de fatores fora do seu controlo direto.
5. **Lei Portuguesa (Secção 6):**
   * Define que qualquer litígio ou interpretação é regulado exclusivamente pela lei portuguesa.

---

## 6. Checklist Legal Antes do Lançamento Oficial

Antes de mudares o site do modo «Pronto em breve» para o site completo em produção:

- [x] **Política de Privacidade e Cookies (`/privacidade`)** publicada e ligada no rodapé.
- [x] **Condições de Utilização (`/termos`)** publicadas e ligadas no rodapé.
- [x] **Email oficial (`geral@draftandrise.com`)** ativo e a receber mensagens para pedidos RGPD ou dúvidas legais.
- [x] **Referência à CNPD (`www.cnpd.pt`)** incluída na Política de Privacidade.
- [x] **Aviso contra introdução de palavras-passe e dados sensíveis** incluído tanto na Política de Privacidade como nas Condições de Utilização.
- [ ] **Dados Fiscais na Secção 1 de `/privacidade`:** Adicionar a denominação fiscal, NIF/NIPC e morada da sede assim que a atividade/sociedade estiver formalizada.
- [ ] **Região da Base de Dados Supabase:** Confirmar que o projeto Supabase em produção está alojado numa região da União Europeia (`eu-central-1` ou `eu-west-1`).
- [ ] **Proposta/Contrato de Prestação de Serviços:** Garantir que cada cliente assina ou aprova por escrito a proposta comercial antes do início da otimização do Perfil do Google ou do desenvolvimento do website.
