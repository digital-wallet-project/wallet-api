# Wallet API

API REST para gerenciamento de carteiras digitais com transferências entre usuários.

O sistema possui regras de autorização, integridade financeira e controle de usuários, garantindo que operações críticas sejam executadas com segurança.

## Tecnologias
- **TypeScript**
- **NestJS** — Framework Node.js
- **Prisma** — ORM
- **MySQL** — Banco de dados
- **JWT** — Autenticação
- **Docker** — Ambiente de banco de dados

## Como rodar

## Testes

O projeto possui testes de integração cobrindo todos os use cases e regras de negócio.

### Rodar os testes
```bash
# Subir o banco de dados
docker-compose up

# Rodar os testes
npm run test
```

### Instalação
```bash
# Instalar dependências
npm install

# Subir o banco de dados
docker-compose up

# Rodar as migrations
npx prisma migrate dev

# Popular o banco com o admin
npx prisma db seed

# Rodar a aplicação
npm run start:dev
```

## Regras de negócio

### Usuário
- Ao criar um usuário, uma carteira é criada automaticamente
- Usuário pode atualizar e inativar a própria conta
- Admin pode atualizar e inativar qualquer conta USER
- Admin não pode inativar outro Admin
- Admin não pode se inativar se for o único Admin
- Apenas Admin pode reativar qualquer conta
- Apenas Admin pode listar usuários
- Usuário inativo não consegue fazer login

### Carteira
- Criada automaticamente ao criar usuário com saldo R$ 0,00
- Saldo preservado mesmo com usuário inativo
- Não pode ser deletada

### Transações
- **Depósito:** Valor mínimo de R$ 10,00, apenas na própria carteira
- **Transferência:** Saldo suficiente obrigatório, valor deve ser maior que zero, não é permitido transferir para si mesmo
- **Estorno:** Apenas Admin, somente transferências concluídas, prazo de 24h

## Rotas

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/login | Autenticação |

### User
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | /user | Criar usuário | ❌ |
| GET | /user | Listar usuários | ✅ Admin |
| PUT | /user/:id | Atualizar usuário | ✅ |
| DELETE | /user/:id | Inativar usuário | ✅ |
| PATCH | /user/:id/reactivate | Reativar usuário | ✅ Admin |

### Wallet
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | /wallet | Ver própria carteira | ✅ |
| GET | /wallet/:id | Ver qualquer carteira | ✅ Admin |

### Transaction
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | /transaction/deposit | Depositar | ✅ |
| POST | /transaction/transfer | Transferir | ✅ |
| PUT | /transaction/:id/reversal | Estornar | ✅ Admin |
| GET | /transaction | Listar transações | ✅ |

## Autor

**Raphael da Silva Santos**  
Campinas - SP

- [LinkedIn](https://www.linkedin.com/in/raphael-santos-a50721280/)
- [GitHub](https://github.com/rphsantoss)