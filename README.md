# 🛡️ Broken Access Control Lab

Projeto educacional criado para demonstrar vulnerabilidades de **Broken Access Control** em aplicações web e como corrigi-las.

A ideia é mostrar, de forma prática, como falhas de autorização acontecem no mundo real e quais mecanismos devem ser aplicados para evitá-las.

Este repositório possui **duas versões da aplicação**:

* 🔓 **v1 — versão vulnerável**
* 🔒 **v2 — versão segura**

Isso permite comparar facilmente **como a mesma funcionalidade pode ser explorada quando controles de acesso não são implementados corretamente**.

---

# 🎯 Objetivo do Projeto

Este projeto tem como objetivo demonstrar cenários comuns de falhas de controle de acesso, incluindo:

✨ acesso indevido a recursos
✨ manipulação de IDs
✨ escalonamento de privilégios
✨ acesso direto a rotas sensíveis

O projeto utiliza uma aplicação simples com três páginas principais:

🏠 **Home pública** — acessível sem login
🔑 **Login** — autenticação do usuário
👤 **Dashboard** — área privada do usuário

---

# 🌿 Estrutura de Branches

O repositório contém duas branches principais:

### 🔓 insecure-version

Contém a aplicação **intencionalmente vulnerável**, com várias falhas de controle de acesso.

Essa versão serve para demonstrar como ataques podem acontecer quando **verificações de autorização não são implementadas corretamente**.

---

### 🔒 secure-version

Contém a aplicação **corrigida**, com controles de segurança aplicados para prevenir as vulnerabilidades presentes na versão insegura.

Nesta versão foram implementadas:

🛡️ verificações de autenticação
🛡️ validação de propriedade de recursos
🛡️ controle de acesso baseado em roles
🛡️ proteção de endpoints sensíveis

---

# 🔓 v1 — Versão Insegura (com falhas propositais)

Falhas de segurança demonstradas:

| # | Falha                               | Exemplo                                                    |
| - | ----------------------------------- | ---------------------------------------------------------- |
| 1 | 🔑 **IDOR**                         | `GET /profile/2` — acessar perfil de outro usuário         |
| 2 | 👑 **Acesso admin sem verificação** | `GET /admin` — qualquer usuário acessa                     |
| 3 | 🧭 **Forced Browsing**              | `/admin/reports` — rota oculta mas funcional               |
| 4 | 🧪 **Modificação de parâmetros**    | `PUT /profile` — alterar role para `"admin"`               |
| 5 | 🧱 **Sem verificação no backend**   | `DELETE /users/1` — frontend esconde, API permite          |
| 6 | 📂 **Acesso a arquivos diretos**    | `/files/invoice_124.pdf` — baixar arquivo de outro usuário |
| 7 | 👥 **Escalação horizontal**         | Usuário A acessa dados do Usuário B                        |
| 8 | 🚨 **Escalação vertical**           | Usuário comum vira admin                                   |

Essas vulnerabilidades são exemplos clássicos de **Broken Access Control**.

---

# 🔒 v2 — Versão Segura (correções aplicadas)

A versão segura implementa controles de segurança para prevenir os ataques demonstrados na versão vulnerável.

Principais melhorias:

🛡️ **Validação de ownership em cada rota**
Verificação se o recurso solicitado pertence ao usuário autenticado.

🛡️ **Middleware de autenticação e autorização**
Bloqueio automático de rotas privadas para usuários não autenticados.

🛡️ **Verificação de role no backend**
Rotas administrativas exigem permissões específicas.

🛡️ **Tokens JWT com expiração e validação**
Sessões protegidas e validadas a cada requisição.

🛡️ **Acesso a arquivos vinculado ao userId da sessão**
Arquivos privados só podem ser acessados por seus proprietários.

---

# 🧱 Arquitetura do Projeto

O projeto segue uma estrutura simples baseada em separação de responsabilidades.

Principais camadas:

📦 **Controllers** — recebem requisições HTTP
⚙️ **Services** — regras de negócio e validações
🗄️ **Repositories** — acesso ao banco de dados
🛡️ **Middlewares** — autenticação e autorização

Estrutura simplificada:

```
src
 ├── controllers
 ├── services
 ├── repositories
 ├── middlewares
 ├── models
 └── routes
```

Essa organização facilita a aplicação de **controles de segurança centralizados**.

---

# 🚀 Como rodar o projeto

### 🔧 Backend

```bash
cd backend
npm install
npm run dev
```

---

### 🎨 Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# ⚠️ Aviso Importante

A versão **v1 (insecure-version)** contém vulnerabilidades **intencionais** e foi criada exclusivamente para fins educacionais.

🚫 **Nunca utilize esse código em produção.**

---



✨ Se você trabalha com **segurança, backend ou pentest**, este projeto demonstra na prática como falhas de autorização podem surgir e como corrigi-las corretamente.
