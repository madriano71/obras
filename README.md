# Sistema de Gerenciamento de Obras Residenciais

Sistema completo para gerenciamento de obras residenciais com controle de imóveis, dependências, tipos de obra, fornecedores, orçamentos e visualização em Kanban.

## 🚀 Tecnologias

### Backend
- **Node.js + Express** - Framework web rápido e minimalista
- **Mongoose** - ODM para MongoDB
- **Redis** - Cache e rate limiting
- **JWT** - Autenticação segura
- **Bcrypt** - Hash de senhas

### Frontend
- **React** - Biblioteca UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **@hello-pangea/dnd** - Drag and drop para Kanban
- **React Hook Form + Zod** - Formulários e validação
- **Sonner** - Notificações
- **Recharts** - Gráficos

### Banco de Dados
- **MongoDB** - Banco de dados NoSQL
- **Redis** - Cache e rate limiting

## 📋 Pré-requisitos

### Para rodar localmente (sem Docker)
- Node.js 18+
- MongoDB 7.0+
- Redis 7+

### Para rodar com Docker
- Docker
- Docker Compose

## 🔧 Instalação e Execução

### Opção 1: Rodar Localmente

#### 1. Clone o repositório
```bash
cd c:\apps\obras
```

#### 2. Configure o ambiente backend
```bash
cd backend

# Instale as dependências Node.js
npm install

# Volte para a raiz
cd ..

# Copie o arquivo de ambiente
copy .env.example .env

# Edite o .env com suas configurações
```

#### 3. Inicie MongoDB e Redis
Certifique-se de que MongoDB e Redis estão rodando localmente nas portas padrão (27017 e 6379).

#### 4. Inicie o backend
```bash
cd backend

# Opção 1: Modo desenvolvimento (com nodemon)
npm run dev

# Opção 2: Modo produção
npm start
```

O backend estará disponível em: http://localhost:8000
Health check: http://localhost:8000/health

#### 5. Configure e inicie o frontend
```bash
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: http://localhost:5173

### Opção 2: Rodar com Docker

#### 1. Build e inicie todos os serviços
```bash
docker-compose up --build
```

#### 2. Acesse a aplicação
- Frontend: http://localhost
- Backend API: http://localhost:8000
- Documentação API: http://localhost:8000/docs

#### 3. Parar os serviços
```bash
docker-compose down
```

#### 4. Parar e remover volumes (limpar dados)
```bash
docker-compose down -v
```

## 👤 Credenciais Padrão

O sistema cria automaticamente um usuário administrador:

- **E-mail:** admin@admin.com
- **Senha:** admin123

## 📁 Estrutura do Projeto

```
obras/
├── backend/                    # Backend Node.js + Express
│   ├── src/
│   │   ├── server.js          # Servidor principal
│   │   ├── config.js          # Configurações
│   │   ├── database.js        # Conexão MongoDB (Mongoose)
│   │   ├── redis.js           # Conexão Redis e rate limiting
│   │   ├── models/            # Modelos Mongoose
│   │   │   ├── User.js
│   │   │   ├── Imovel.js
│   │   │   ├── Dependencia.js
│   │   │   ├── TipoObra.js
│   │   │   ├── Fornecedor.js
│   │   │   ├── Orcamento.js
│   │   │   └── Tarefa.js
│   │   ├── routes/            # Rotas Express
│   │   │   ├── auth.js
│   │   │   └── index.js       # Todas as rotas CRUD
│   │   ├── middleware/        # Middlewares
│   │   │   └── auth.js
│   │   └── utils/             # Utilitários
│   │       └── auth.js        # Bcrypt e JWT
│   └── package.json
├── frontend/                   # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/             # Páginas
│   │   ├── contexts/          # Contexts (Auth)
│   │   ├── services/          # Serviços (API)
│   │   └── lib/               # Utilitários
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml         # Orquestração Docker
├── Dockerfile.backend         # Dockerfile do backend
├── Dockerfile.frontend        # Dockerfile do frontend
├── .env.example               # Exemplo de variáveis de ambiente
└── README.md                  # Este arquivo
```

## 🎯 Funcionalidades

### Autenticação e Autorização
- ✅ Login com JWT
- ✅ Rate limiting (5 tentativas em 15 minutos)
- ✅ Aprovação de usuários por admin
- ✅ Controle de acesso por perfil (admin/user)

### Gerenciamento de Imóveis
- ✅ CRUD de imóveis
- ✅ Cadastro de endereço completo
- ✅ Tipos de imóvel (casa, apartamento, comercial)

### Dependências
- ✅ CRUD de dependências por imóvel
- ✅ Tipos: quarto, sala, cozinha, banheiro, suíte, etc.

### Tipos de Obra
- ✅ CRUD de tipos de obra
- ✅ Exemplos: marcenaria, balcão, revestimento, pintura, elétrica

### Fornecedores
- ✅ CRUD de fornecedores
- ✅ Vinculação com tipos de obra

### Orçamentos
- ✅ CRUD de orçamentos
- ✅ Vinculação: dependência + tipo de obra + fornecedor
- ✅ Controle de status (pendente, aprovado, rejeitado)
- ✅ Cálculo de valores totais

### Dashboard
- ✅ Estatísticas gerais
- ✅ Gráficos de orçamentos por dependência
- ✅ Gráficos de tarefas por status
- ✅ Valor total de orçamentos

### Kanban
- ✅ Board com 5 colunas (A Fazer, Em Andamento, Impedimento, Aguardando Testes, Concluído)
- ✅ Drag and drop de tarefas
- ✅ Cores específicas por coluna
- ✅ Prioridades (baixa, média, alta)

## 🎨 Design

O sistema segue o estilo **Soft Utility / Swiss Minimalist** com:

- **Paleta de cores:** Tons neutros (slate)
- **Background:** #FAFAFA
- **Tipografia:** Inter (Google Fonts)
- **Cores das colunas Kanban:**
  - A Fazer: Slate
  - Em Andamento: Blue
  - Impedimento: Rose
  - Aguardando Testes: Amber
  - Concluído: Emerald

## 🔒 Segurança

- Senhas hasheadas com bcrypt
- Autenticação JWT
- Rate limiting de login com Redis
- CORS configurado
- Validação de dados com Pydantic e Zod

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuário atual
- `POST /api/auth/logout` - Logout

### Usuários (Admin)
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `PUT /api/users/{id}` - Atualizar usuário
- `DELETE /api/users/{id}` - Deletar usuário
- `PATCH /api/users/{id}/approve` - Aprovar usuário

### Imóveis
- `GET /api/imoveis` - Listar imóveis
- `POST /api/imoveis` - Criar imóvel
- `PUT /api/imoveis/{id}` - Atualizar imóvel
- `DELETE /api/imoveis/{id}` - Deletar imóvel

### Dependências
- `GET /api/dependencias` - Listar dependências
- `POST /api/dependencias` - Criar dependência
- `PUT /api/dependencias/{id}` - Atualizar dependência
- `DELETE /api/dependencias/{id}` - Deletar dependência

### Tipos de Obra
- `GET /api/tipos-obra` - Listar tipos
- `POST /api/tipos-obra` - Criar tipo
- `PUT /api/tipos-obra/{id}` - Atualizar tipo
- `DELETE /api/tipos-obra/{id}` - Deletar tipo

### Fornecedores
- `GET /api/fornecedores` - Listar fornecedores
- `POST /api/fornecedores` - Criar fornecedor
- `PUT /api/fornecedores/{id}` - Atualizar fornecedor
- `DELETE /api/fornecedores/{id}` - Deletar fornecedor

### Orçamentos
- `GET /api/orcamentos` - Listar orçamentos
- `POST /api/orcamentos` - Criar orçamento
- `PUT /api/orcamentos/{id}` - Atualizar orçamento
- `DELETE /api/orcamentos/{id}` - Deletar orçamento

### Tarefas
- `GET /api/tarefas` - Listar tarefas
- `POST /api/tarefas` - Criar tarefa
- `PUT /api/tarefas/{id}` - Atualizar tarefa
- `PATCH /api/tarefas/{id}/status` - Atualizar status (drag-and-drop)
- `DELETE /api/tarefas/{id}` - Deletar tarefa

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas gerais
- `GET /api/dashboard/orcamentos-por-imovel` - Orçamentos por imóvel
- `GET /api/dashboard/orcamentos-por-dependencia` - Orçamentos por dependência
- `GET /api/dashboard/orcamentos-por-tipo-obra` - Orçamentos por tipo de obra

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se MongoDB e Redis estão rodando
- Verifique as variáveis de ambiente no `.env`
- Verifique se a porta 8000 está disponível

### Frontend não conecta ao backend
- Verifique se o backend está rodando em http://localhost:8000
- Verifique a configuração do proxy no `vite.config.js`

### Erro de autenticação
- Limpe o localStorage do navegador
- Verifique se o token JWT não expirou
- Verifique se o usuário está aprovado

## 📄 Licença

Este projeto é de código aberto e está disponível para uso livre.

## 👨‍💻 Desenvolvimento

Para contribuir com o projeto:

1. Faça um fork
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

**Desenvolvido com ❤️ usando FastAPI e React**
