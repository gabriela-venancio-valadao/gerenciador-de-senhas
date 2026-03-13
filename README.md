# 🔐 Broken Access Control Lab — Gerenciador de Senhas (Insecure)

> Versão **intencionalmente vulnerável** de um Gerenciador de Senhas fullstack.
> Este projeto demonstra **8 falhas de Broken Access Control (BAC)** usando arquitetura MVC clássica.
> Criado exclusivamente para fins educacionais — **nunca use em produção**.
>
> 🔗 **Repositório da versão segura (corrigida):** [gerenciador-de-senhas-secure](https://github.com/gabriela-venancio-valadao/gerenciador-de-senhas-secure)

![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js)
![React](https://img.shields.io/badge/React_19-Vite_7-61DAFB?logo=react)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tech Stack](#-tech-stack)
- [Arquitetura MVC](#-arquitetura-mvc)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Fluxo da Requisição](#-fluxo-da-requisição)
- [Schema do Banco de Dados](#-schema-do-banco-de-dados)
- [Dados Seed](#-dados-seed-usuários-pré-cadastrados)
- [API Routes](#-api-routes)
- [Mapa de Vulnerabilidades](#-mapa-de-vulnerabilidades)
- [Detalhamento das Falhas](#-detalhamento-de-cada-falha)
- [Páginas do Frontend](#-páginas-do-frontend)
- [Como Rodar](#-como-rodar)
- [Como Testar as Vulnerabilidades](#-como-testar-as-vulnerabilidades)
- [Aviso Importante](#-aviso-importante)

---

## 🎯 Sobre o Projeto

Este é um **Gerenciador de Senhas** fullstack construído com arquitetura **MVC clássica** e **falhas de segurança propositais**. O objetivo é aprender na prática como vulnerabilidades de **Broken Access Control** acontecem em projetos reais.

### O que você vai aprender:

- Como **IDOR** permite acessar dados de outros usuários
- Como **Forced Browsing** expõe rotas administrativas
- Como **Parameter Tampering** permite escalação de privilégio
- Como a **falta de middleware** no backend torna o frontend irrelevante
- Como **acesso direto a arquivos** vaza dados sensíveis
- Por que **segurança só no frontend** não funciona

### Páginas da aplicação:

| Página | Rota | Descrição |
|--------|------|-----------|
| 🔑 **Login** | `/login` | Autenticação do usuário |
| 📊 **Dashboard** | `/dashboard` | Área privada — lista senhas salvas, exibe perfil |
| 👑 **Admin** | `/admin` | Painel administrativo — gerenciar usuários |

---

## 🛠️ Tech Stack

| Camada | Tecnologia | Versão | Função |
|--------|-----------|--------|--------|
| **Frontend** | React | 19.2 | Interface de usuário (SPA) |
| **Bundler** | Vite | 7.3 | Build e dev server do frontend |
| **Roteamento** | React Router DOM | 7.13 | Navegação entre páginas |
| **HTTP Client** | Axios | 1.13 | Chamadas HTTP para o backend |
| **Backend** | Node.js + Express | 5.2 | API REST |
| **Banco de Dados** | SQLite (better-sqlite3) | 12.6 | Persistência em arquivo único |
| **Autenticação** | JSON Web Token (JWT) | 9.0 | Tokens de sessão |
| **Dev Tools** | Nodemon | 3.1 | Auto-restart do servidor |

---

## �️ Arquitetura MVC

Este projeto segue o padrão **MVC (Model-View-Controller)** clássico — a arquitetura mais comum em projetos iniciantes e onde a maioria das falhas BAC acontecem na vida real.

**Por que MVC é vulnerável por padrão?**

- Controllers acessam Models diretamente — sem camada de validação entre eles
- Não há middleware centralizado de autorização
- Cada controller precisa implementar suas próprias verificações (e esquece)
- O frontend "esconde" funcionalidades, mas o backend não valida

---

### 📁 Estrutura de Pastas

```
gerenciador-de-senhas/
├── .gitignore
├── README.md
│
├── backend/
│   ├── package.json
│   ├── server.js                    ← Entry point: Express + CORS + monta rotas
│   │
│   ├── config/
│   │   └── database.js              ← Conexão SQLite + criação de tabelas + seed
│   │
│   ├── models/                      ← Camada de DADOS (queries SQL diretas)
│   │   ├── userModel.js             ← findById, findAll, create, update, delete
│   │   └── passwordModel.js         ← findByUserId, findById, create, delete
│   │
│   ├── controllers/                 ← Camada de LÓGICA (recebe req, chama model)
│   │   ├── authController.js        ← login — gera JWT (🔓 sem expiração)
│   │   ├── userController.js        ← CRUD de usuários (🔓 sem checar ownership)
│   │   ├── adminController.js       ← Ações admin (🔓 sem verificar role)
│   │   └── fileController.js        ← Servir arquivos (🔓 sem verificar dono)
│   │
│   └── routes/                      ← Camada de ROTAS (mapeia URL → controller)
│       ├── authRoutes.js            ← POST /api/auth/login
│       ├── userRoutes.js            ← GET/PUT/DELETE /api/users/:id
│       ├── adminRoutes.js           ← GET /api/admin/*
│       └── fileRoutes.js            ← GET /api/files/:filename
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    │
    └── src/
        ├── main.jsx                 ← React entry point
        ├── App.jsx                  ← React Router (🔓 rotas sem proteção)
        ├── api.js                   ← Instância Axios (baseURL do backend)
        │
        ├── pages/
        │   ├── Login.jsx            ← Formulário de login
        │   ├── Dashboard.jsx        ← Lista senhas + perfil do usuário
        │   └── Admin.jsx            ← Painel admin (🔓 acessível por qualquer um)
        │
        └── components/
            └── Navbar.jsx           ← Barra de navegação
```

---

### 🔄 Fluxo da Requisição

```
[Browser] → [React Page] → [Axios/api.js] → [Express Route] → [Controller] → [Model] → [SQLite]
                                                    ↑
                                            🔓 NENHUM MIDDLEWARE
                                            de auth ou role aqui!
```

Na v1, a requisição vai **direto da rota pro controller, sem passar por nenhum middleware** de autenticação ou autorização. Qualquer pessoa que conheça a URL pode acessar qualquer endpoint.

---

### 🗄️ Schema do Banco de Dados

O banco SQLite contém duas tabelas:

#### Tabela `users`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER PRIMARY KEY | ID auto-incremento |
| `username` | TEXT UNIQUE | Nome de usuário |
| `password` | TEXT | 🔓 **Senha em texto puro** (sem hash!) |
| `role` | TEXT DEFAULT 'user' | `'user'` ou `'admin'` |

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,          -- 🔓 TEXTO PURO (sem bcrypt)
  role TEXT DEFAULT 'user'         -- 🔓 pode ser alterado via API
);
```

#### Tabela `passwords` (senhas salvas do gerenciador)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER PRIMARY KEY | ID auto-incremento |
| `userId` | INTEGER | FK → users.id (dono da senha) |
| `site` | TEXT | Nome do site (ex: "gmail.com") |
| `siteUsername` | TEXT | Usuário naquele site |
| `sitePassword` | TEXT | 🔓 **Senha em texto puro** |

```sql
CREATE TABLE passwords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  site TEXT NOT NULL,
  siteUsername TEXT NOT NULL,
  sitePassword TEXT NOT NULL,       -- 🔓 TEXTO PURO (sem criptografia)
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

---

### 👥 Dados Seed (Usuários Pré-cadastrados)

| ID | Username | Password | Role | Descrição |
|----|----------|----------|------|-----------|
| 1 | `admin` | `admin123` | `admin` | Administrador do sistema |
| 2 | `joao` | `joao123` | `user` | Usuário comum A |
| 3 | `maria` | `maria123` | `user` | Usuário comum B |

> 🔓 Senhas em texto puro, sem hash, sem salt. Isso é proposital na v1.

---

### 🌐 API Routes

#### Autenticação

| Método | Rota | Controller | Descrição | 🔓 Falha |
|--------|------|------------|-----------|----------|
| POST | `/api/auth/login` | `authController.login` | Autentica e retorna JWT | JWT sem expiração |

#### Usuários

| Método | Rota | Controller | Descrição | 🔓 Falha |
|--------|------|------------|-----------|----------|
| GET | `/api/users/:id` | `userController.getUser` | Buscar perfil por ID | **IDOR** — sem checar ownership |
| PUT | `/api/users/:id` | `userController.updateUser` | Editar perfil | **Modificação de parâmetros** — aceita `role` no body |
| DELETE | `/api/users/:id` | `userController.deleteUser` | Deletar usuário | **Sem verificação** — qualquer um pode deletar |
| GET | `/api/users` | `userController.getAllUsers` | Listar todos os usuários | **Escalação horizontal** — expõe dados de todos |

#### Admin

| Método | Rota | Controller | Descrição | 🔓 Falha |
|--------|------|------------|-----------|----------|
| GET | `/api/admin/dashboard` | `adminController.getDashboard` | Painel admin | **Sem verificar role** — qualquer logado acessa |
| DELETE | `/api/admin/users/:id` | `adminController.deleteUser` | Admin deletar user | **Escalação vertical** — user vira admin |
| GET | `/api/admin/reports` | `adminController.getReports` | Relatórios internos | **Forced Browsing** — rota oculta funcional |

#### Arquivos

| Método | Rota | Controller | Descrição | 🔓 Falha |
|--------|------|------------|-----------|----------|
| GET | `/api/files/:filename` | `fileController.getFile` | Baixar arquivo | **Acesso direto** — sem verificar dono |

---

### 🗺️ Mapa de Vulnerabilidades

Cada falha BAC mapeada ao **arquivo exato** e **rota exata** onde ocorre:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      MAPA DE VULNERABILIDADES                         │
├──────────────────────┬──────────────────┬───────────────────────────────┤
│ Falha                │ Arquivo          │ Rota / Ação                   │
├──────────────────────┼──────────────────┼───────────────────────────────┤
│ 1. IDOR              │ userController   │ GET /api/users/:id            │
│ 2. Admin sem auth    │ adminRoutes      │ GET /api/admin/* (sem middleware)│
│ 3. Forced Browsing   │ adminController  │ GET /api/admin/reports        │
│ 4. Param Tampering   │ userController   │ PUT /api/users/:id {role}     │
│ 5. Sem verif. backend│ userController   │ DELETE /api/users/:id         │
│ 6. Arquivo direto    │ fileController   │ GET /api/files/:filename      │
│ 7. Escalação horiz.  │ userController   │ GET /api/users (lista todos)  │
│ 8. Escalação vertical│ userController   │ PUT /api/users/:id {role:admin}│
└──────────────────────┴──────────────────┴───────────────────────────────┘
```

---

### 📖 Detalhamento de Cada Falha

#### 1️⃣ IDOR (Insecure Direct Object Reference)
- **Onde:** `userController.js` → `getUser()`
- **Rota:** `GET /api/users/:id`
- **O que acontece:** O controller busca o usuário pelo ID da URL **sem verificar se o usuário logado é o dono** daquele perfil.
- **Ataque:** Usuário `joao` (id=2) troca a URL para `/api/users/3` e vê os dados de `maria`.
- **Código vulnerável:**
```javascript
// 🔓 controller busca qualquer ID sem checar ownership
const getUser = (req, res) => {
  const user = UserModel.findById(req.params.id); // ← aceita qualquer ID!
  res.json(user);
};
```

#### 2️⃣ Acesso Admin sem Verificação de Role
- **Onde:** `adminRoutes.js` — rotas montadas **sem middleware de role**
- **Rota:** `GET /api/admin/dashboard`
- **O que acontece:** A rota existe e responde para qualquer usuário logado (ou até sem login).
- **Ataque:** Usuário comum acessa `/api/admin/dashboard` e vê dados administrativos.

#### 3️⃣ Forced Browsing
- **Onde:** `adminController.js` → `getReports()`
- **Rota:** `GET /api/admin/reports`
- **O que acontece:** A rota não aparece na interface (Navbar não mostra), mas funciona se acessada diretamente.
- **Ataque:** Usuário digita `/admin/reports` no navegador ou faz request direto.

#### 4️⃣ Modificação de Parâmetros (Parameter Tampering)
- **Onde:** `userController.js` → `updateUser()`
- **Rota:** `PUT /api/users/:id`
- **O que acontece:** O controller aceita **todos os campos do body** sem filtrar — incluindo `role`.
- **Ataque:** Usuário envia `{ "role": "admin" }` no body e vira admin.
- **Código vulnerável:**
```javascript
// 🔓 aceita qualquer campo que vier no body, incluindo role
const updateUser = (req, res) => {
  UserModel.update(req.params.id, req.body); // ← body inteiro, sem filtrar!
  res.json({ message: 'Atualizado' });
};
```

#### 5️⃣ Falta de Verificação no Backend
- **Onde:** `userController.js` → `deleteUser()`
- **Rota:** `DELETE /api/users/:id`
- **O que acontece:** O frontend esconde o botão "deletar" para usuários comuns, **mas a API aceita a request de qualquer um**.
- **Ataque:** Usuário faz `DELETE /api/users/1` via Postman/curl e deleta o admin.

#### 6️⃣ Acesso Direto a Arquivos
- **Onde:** `fileController.js` → `getFile()`
- **Rota:** `GET /api/files/:filename`
- **O que acontece:** Arquivos são servidos pelo nome, sem verificar se pertencem ao usuário logado.
- **Ataque:** Usuário altera `invoice_joao.pdf` para `invoice_maria.pdf` e baixa o arquivo de outro usuário.

#### 7️⃣ Escalação Horizontal de Privilégio
- **Onde:** `userController.js` → `getAllUsers()`
- **Rota:** `GET /api/users`
- **O que acontece:** Retorna **todos** os usuários do sistema, incluindo dados sensíveis.
- **Ataque:** Qualquer usuário logado vê dados de todos os outros usuários (mesmo nível).

#### 8️⃣ Escalação Vertical de Privilégio
- **Onde:** `userController.js` → `updateUser()` (combinação das falhas 1 + 4)
- **Rota:** `PUT /api/users/2`
- **O que acontece:** Combinando IDOR + Parameter Tampering, o usuário altera seu próprio role para `admin`.
- **Ataque:** `PUT /api/users/2` com body `{ "role": "admin" }` → usuário comum vira admin.

---

### 🖥️ Páginas do Frontend

#### Login (`/login`)
- Formulário com `username` e `password`
- Chama `POST /api/auth/login`
- Salva o JWT no `localStorage` (🔓 sem httpOnly cookie)
- Redireciona para `/dashboard`

#### Dashboard (`/dashboard`)
- Exibe dados do perfil do usuário logado
- Lista senhas salvas no gerenciador
- Permite adicionar/deletar senhas
- 🔓 Qualquer um pode acessar sem estar logado (sem route guard)

#### Admin (`/admin`)
- Painel para gerenciar usuários (listar, deletar)
- 🔓 Link não aparece na Navbar para users comuns, **mas a rota funciona**
- 🔓 Não verifica role — qualquer um que acessar `/admin` vê o painel

---

##  Como Rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- npm (vem com o Node)

### Backend (porta 3001)

```bash
cd backend
npm install
npm run dev        # inicia com nodemon (auto-restart)
```

### Frontend (porta 5173)

```bash
cd frontend
npm install
npm run dev        # inicia com Vite (hot reload)
```

---

## 🧪 Como Testar as Vulnerabilidades

Após rodar backend e frontend, use o navegador ou ferramentas como **Postman**, **curl**, ou **Burp Suite** para explorar as falhas:

```bash
# 1. IDOR — acessar perfil de outro usuário
curl http://localhost:3001/api/users/3

# 2. Admin sem auth — acessar painel admin
curl http://localhost:3001/api/admin/dashboard

# 3. Parameter Tampering — virar admin
curl -X PUT http://localhost:3001/api/users/2 \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'

# 4. Deletar qualquer usuário
curl -X DELETE http://localhost:3001/api/users/1

# 5. Acessar arquivo de outro usuário
curl http://localhost:3001/api/files/invoice_maria.pdf
```

---

## ⚠️ Aviso Importante

> Este repositório contém vulnerabilidades **intencionais** e foi criado
> **exclusivamente para fins educacionais**.
>
> 🚫 **NUNCA utilize esse código em produção.**
>
> Este projeto é um **laboratório de segurança** para aprender como falhas de
> Broken Access Control funcionam. Para ver como corrigi-las, consulte o
> [repositório da versão segura](https://github.com/gabriela-venancio-valadao/gerenciador-de-senhas-secure).

---

## 📚 Referências

- [OWASP Top 10 — Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [OWASP Testing Guide — Authorization](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/)
- [PortSwigger — Access Control Vulnerabilities](https://portswigger.net/web-security/access-control)

---

## 🔗 Repositórios do Projeto

Este projeto educacional é divido em **dois repositórios independentes**, cada um com seu próprio código e histórico:

| Repositório | Descrição | Status |
|-------------|-----------|--------|
| **[gerenciador-de-senhas-insecure](https://github.com/gabriela-venancio-valadao/gerenciador-de-senhas-insecure)** | Versão vulnerável — 8 falhas BAC propositais | 📍 Você está aqui |
| **[gerenciador-de-senhas-secure](https://github.com/gabriela-venancio-valadao/gerenciador-de-senhas-secure)** | Versão corrigida — todas as falhas resolvidas | 🔒 Repositório separado |

> **Por que dois repositórios?**
> Cada versão tem sua própria base de código completa, facilitando a comparação
> lado a lado entre o código vulnerável e o código seguro.

---

**Feito com 💀 para aprender quebrando — veja o [repositório seguro](https://github.com/gabriela-venancio-valadao/gerenciador-de-senhas-secure) para aprender corrigindo.**
