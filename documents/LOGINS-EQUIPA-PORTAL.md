# Credenciais de Acesso da Equipa — Portal Draft & Rise

**Projeto:** Draft & Rise (`draftandrise.com`)  
**Links de Entrada:**
- **Página de Login (Equipa & Clientes):** `https://draftandrise.com/acesso` *(Local: `http://localhost:3000/acesso`)*
- **Painel Direto da Equipa:** `https://draftandrise.com/equipa` *(Local: `http://localhost:3000/equipa`)*
- **Link Privado para Enviar aos Clientes:** `https://draftandrise.com/questionario` *(Local: `http://localhost:3000/questionario`)*

---

## 1. Conta de Administrador Principal (Controlo Total)

| Utilizador | Palavra-passe | Nome no Painel | Nível de Permissão |
| :--- | :--- | :--- | :--- |
| **`user1`** | `DR-User1-8492` | **Admin Total · user1** | 🟢 **Super Admin (Acesso Total)** |

### O que o `user1` pode fazer:
- **Editar tudo em qualquer ficha:** abrir o editor completo das **8 etapas** de qualquer cliente e alterar/preencher qualquer resposta.
- **Reabrir fichas já submetidas:** voltar a colocar uma ficha submetida em modo editável para corrigir respostas.
- **Exportar Markdown (`.md`) a qualquer momento:** tanto em fichas submetidas como em fichas ainda em rascunho.
- **Gerir e apagar códigos de acesso:** gerar códigos de 6 dígitos para clientes e revogar/apagar códigos antigos.
- **Apagar fichas de clientes:** eliminar permanentemente fichas de teste ou antigas.

---

## 2. Contas da Equipa (Consulta & Alterações Básicas)

| Utilizador | Palavra-passe | Nome no Painel | Nível de Permissão |
| :--- | :--- | :--- | :--- |
| **`user2`** | `DR-User2-3917` | Equipa · user2 (Básico) | 🔵 **Equipa (Consulta & Básico)** |
| **`user3`** | `DR-User3-6520` | Equipa · user3 (Básico) | 🔵 **Equipa (Consulta & Básico)** |
| **`user4`** | `DR-User4-9148` | Equipa · user4 (Básico) | 🔵 **Equipa (Consulta & Básico)** |
| **`user5`** | `DR-User5-2763` | Equipa · user5 (Básico) | 🔵 **Equipa (Consulta & Básico)** |
| **`user6`** | `DR-User6-5084` | Equipa · user6 (Básico) | 🔵 **Equipa (Consulta & Básico)** |

### O que o `user2` ao `user6` podem fazer:
- **Ver e copiar códigos de clientes (6 dígitos):** consultar os códigos gerados (associados a `geral@draftandrise.com`), copiar o código ou copiar a mensagem pronta para enviar no WhatsApp ao cliente.
- **Gerar código para novo cliente:** criar o acesso inicial do cliente (Nome + Empresa + E-mail).
- **Consultar todas as respostas:** ver o progresso do cliente em tempo real e ler todas as respostas das 8 etapas.
- **Alterar apenas Dados Básicos:** editar os dados básicos de identificação e contacto da ficha (*Nome da empresa*, *Nome do responsável*, *Cargo*, *E-mail*, *Telefone/WhatsApp* e *Localização*).
- **Descarregar ficha `.md` final:** exportar o ficheiro `.md` das fichas submetidas para treinar o Agente de WhatsApp da Meta.

### O que o `user2` ao `user6` NÃO podem fazer:
- Não podem alterar as respostas técnicas das etapas 2 a 7 do questionário.
- Não podem reabrir fichas já submetidas.
- Não podem apagar fichas de clientes nem apagar códigos de acesso.

---

## 3. Como Alterar as Palavras-passe em Produção (Opcional)

Caso queiram personalizar alguma palavra-passe no servidor (Vercel / Hostinger) sem tocar no código, basta definir as variáveis de ambiente:

```env
PORTAL_USER1_PASSWORD=NovaPasswordAdmin
PORTAL_USER2_PASSWORD=NovaPasswordUser2
PORTAL_USER3_PASSWORD=NovaPasswordUser3
PORTAL_USER4_PASSWORD=NovaPasswordUser4
PORTAL_USER5_PASSWORD=NovaPasswordUser5
PORTAL_USER6_PASSWORD=NovaPasswordUser6
```

