# Arquitetura do Sistema SHOPIC

## Descrição

A estrutura do projeto SHOPIC organiza-se em camadas bem definidas, garantindo uma clara separação de responsabilidades dentro de um monorepo Next.js 14. O frontend, desenvolvido em React com App Router e estilizado com Tailwind CSS, oferece uma experiência de usuário fluida e responsiva através de rotas públicas (loja, produtos, checkout), rotas autenticadas (perfil, pedidos) e um painel administrativo completo para gestão de produtos, pedidos e usuários.

O backend, implementado como API Routes e Server Actions do Next.js, gerencia toda a lógica de negócio: autenticação passwordless via NextAuth com magic links por email, autorização baseada em roles (user/admin), processamento de pedidos, gestão de estoque e validações complexas. A comunicação com o banco de dados PostgreSQL é realizada através do Prisma ORM, garantindo type-safety e queries otimizadas.

O sistema integra-se a serviços externos essenciais: SMTP Google para envio de emails de autenticação, Firebase Storage para armazenamento seguro de comprovantes de pagamento PIX, e a biblioteca PIX Utils para geração de QR Codes de pagamento. Essa arquitetura unificada, aliada à separação lógica de componentes e à utilização de Server Components e Client Components de forma estratégica, adere às melhores práticas do desenvolvimento moderno, priorizando performance, manutenibilidade e escalabilidade.

## Diagrama Geral da Arquitetura

```mermaid
graph TB
    USER[👤 Usuário]
    FRONTEND[🖥️  Frontend<br/>Next.js + React + Tailwind]
    BACKEND[⚙️ Backend<br/>API Routes + Server Actions]
    DATA[🗄️ Camada de Dados<br/>Prisma + PostgreSQL]
    EXTERNAL[☁️ Serviços Externos<br/>SMTP + Firebase + PIX]
    
    USER --> FRONTEND
    FRONTEND --> BACKEND
    BACKEND --> DATA
    BACKEND --> EXTERNAL
    
    classDef frontend fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef backend fill:#10b981,stroke:#059669,color:#fff
    classDef database fill:#f59e0b,stroke:#d97706,color:#fff
    classDef external fill:#8b5cf6,stroke:#6d28d9,color:#fff
    
    class FRONTEND frontend
    class BACKEND backend
    class DATA database
    class EXTERNAL external
```

## 1. Camada Frontend - Estrutura de Rotas

```mermaid
graph LR
    FRONTEND[Frontend<br/>Next.js]
    
    subgraph PUBLIC["Rotas Públicas"]
        direction TB
        HOME[Home]
        SHOP[Loja]
        PRODUCT[Produto]
    end
    
    subgraph AUTH["Rotas Autenticadas"]
        direction TB
        CHECKOUT[Checkout]
        PAYMENT[Pagamento]
        STATUS[Status Pedido]
        USER_PAGE[Perfil]
        ORDERS[Meus Pedidos]
    end
    
    subgraph ADMIN["Rotas Admin"]
        direction TB
        ADMIN_DASH[Dashboard]
        ADMIN_ORDERS[Pedidos]
        ADMIN_PRODUCTS[Produtos]
        ADMIN_USERS[Usuários]
    end
    
    subgraph AUTHPAGES["Autenticação"]
        direction TB
        SIGNIN[Login]
        VERIFY[Verificação]
    end
    
    FRONTEND --> PUBLIC
    FRONTEND --> AUTH
    FRONTEND --> ADMIN
    FRONTEND --> AUTHPAGES
    
    classDef public fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef auth fill:#10b981,stroke:#059669,color:#fff
    classDef admin fill:#ef4444,stroke:#dc2626,color:#fff
    classDef authPages fill:#f59e0b,stroke:#d97706,color:#fff
    
    class PUBLIC,HOME,SHOP,PRODUCT public
    class AUTH,CHECKOUT,PAYMENT,STATUS,USER_PAGE,ORDERS auth
    class ADMIN,ADMIN_DASH,ADMIN_ORDERS,ADMIN_PRODUCTS,ADMIN_USERS admin
    class AUTHPAGES,SIGNIN,VERIFY authPages
```

## 2. Camada Backend - APIs e Server Actions

```mermaid
graph TB
    BACKEND[Backend]
    
    subgraph "API Routes"
        AUTH_API[NextAuth API]
        DELETE_API[Delete Product]
        CUSTOM_API[Custom APIs]
    end
    
    subgraph "Server Actions"
        PRODUCT_ACT[Product Actions]
        ORDER_ACT[Order Actions]
        USER_ACT[User Actions]
        CHECKOUT_ACT[Checkout Actions]
    end
    
    BACKEND --> AUTH_API
    BACKEND --> DELETE_API
    BACKEND --> CUSTOM_API
    BACKEND --> PRODUCT_ACT
    BACKEND --> ORDER_ACT
    BACKEND --> USER_ACT
    BACKEND --> CHECKOUT_ACT
    
    classDef api fill:#10b981,stroke:#059669,color:#fff
    classDef actions fill:#06b6d4,stroke:#0891b2,color:#fff
    
    class AUTH_API,DELETE_API,CUSTOM_API api
    class PRODUCT_ACT,ORDER_ACT,USER_ACT,CHECKOUT_ACT actions
```

## 3. Camada de Dados - Prisma e PostgreSQL

### Diagrama Entidade-Relacionamento

```mermaid
erDiagram
    User ||--o{ Order : "faz"
    User ||--o{ Address : "possui"
    User ||--o{ Review : "escreve"
    User ||--o{ Session : "tem"
    User ||--o{ Account : "vincula"
    
    Order ||--o{ OrderItem : "contém"
    Order ||--o{ Address : "entrega em"
    
    Product ||--o{ ProductItem : "tem variações"
    Product ||--o{ Review : "recebe"
    Product }o--|| ProductCategory : "pertence a"
    
    ProductItem ||--o{ OrderItem : "é pedido em"
    
    User {
        string id PK
        string name
        string email UK
        datetime emailVerified
        string role
    }
    
    Order {
        int id PK
        datetime createdAt
        string users_id FK
        float total
        string status
    }
    
    OrderItem {
        int id PK
        float price
        int orders_id FK
        string sku FK
        int quantity
    }
    
    Product {
        int id PK
        string name
        string description
        int product_categories_id FK
        float rating
    }
    
    ProductItem {
        string sku PK
        int product_id FK
        string size
        int amount
        float price
    }
    
    ProductCategory {
        int id PK
        string name
    }
    
    Address {
        int id PK
        string users_id FK
        int orders_id FK
        string type
        string street
        string number
        string complement
        string neighborhood
        string city
        string state
        string country
        string zip_code
        string name
    }
    
    Review {
        int id PK
        string title
        string text
        float rating
        string users_id FK
        int products_id FK
    }
    
    Session {
        string id PK
        string sessionToken UK
        string userId FK
        datetime expires
        json cart_contents
    }
    
    Account {
        string id PK
        string userId FK
        string type
        string provider
        string providerAccountId
        string refresh_token
        string access_token
        int expires_at
    }
```

### Relacionamentos Principais

- **User → Order**: Um usuário pode fazer vários pedidos (1:N)
- **Order → OrderItem**: Um pedido contém vários itens (1:N)
- **Product → ProductItem**: Um produto tem várias variações de tamanho/SKU (1:N)
- **ProductItem → OrderItem**: Um item de produto pode estar em vários pedidos (1:N)
- **Product → ProductCategory**: Produtos pertencem a uma categoria (N:1)
- **User → Address**: Um usuário pode ter vários endereços (1:N)
- **Order → Address**: Um pedido é entregue em um endereço (1:N)

## 4. Serviços Externos

```mermaid
graph TB
    BACKEND[Backend]
    
    subgraph "Serviços Externos"
        SMTP[SMTP Google<br/>Envio de Emails]
        FIREBASE[Firebase Storage<br/>Comprovantes]
        PIX[PIX Utils<br/>QR Codes]
    end
    
    BACKEND --> SMTP
    BACKEND --> FIREBASE
    BACKEND --> PIX
    
    SMTP --> EMAIL[Email de Login]
    FIREBASE --> RECEIPT[Armazenar Comprovante]
    PIX --> QRCODE[Gerar QR Code]
    
    classDef external fill:#8b5cf6,stroke:#6d28d9,color:#fff
    classDef output fill:#6b7280,stroke:#4b5563,color:#fff
    
    class SMTP,FIREBASE,PIX external
    class EMAIL,RECEIPT,QRCODE output
```

## 5. Fluxo Completo de Compra

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant B as Backend
    participant D as Database
    participant E as Serviços Externos
    
    U->>F: Navega na Loja
    F->>B: Busca Produtos
    B->>D: Query Produtos
    D-->>B: Lista Produtos
    B-->>F: Retorna Produtos
    F-->>U: Exibe Produtos
    
    U->>F: Adiciona ao Carrinho
    U->>F: Vai para Checkout
    F->>U: Solicita Login
    U->>F: Insere Email
    F->>B: Solicita Login
    B->>E: Envia Email
    E-->>U: Email com Link
    U->>F: Clica no Link
    B->>D: Cria Sessão
    
    U->>F: Finaliza Pedido
    F->>B: Cria Pedido
    B->>D: Salva Pedido
    B->>E: Gera QR Code PIX
    E-->>F: QR Code
    F-->>U: Exibe Pagamento
    
    U->>F: Upload Comprovante
    F->>E: Salva no Firebase
    E-->>B: URL do Comprovante
    B->>D: Atualiza Pedido
    B-->>F: Confirmação
    F-->>U: Pedido Confirmado
```

## Camadas do Sistema

### 1. **Frontend (Apresentação)**
- **Framework**: Next.js 14 com App Router
- **UI**: React Components + Tailwind CSS
- **Bibliotecas UI**: Tremor (tabelas e dashboards)
- **Gerenciamento de Estado**: React Context (CartContext, AuthProvider)
- **Responsabilidades**:
  - Renderização de páginas e componentes
  - Interação com usuário
  - Validação de formulários
  - Navegação entre rotas

### 2. **Backend (Lógica de Negócio)**
- **API Routes**: Endpoints REST internos do Next.js
- **Server Actions**: Funções server-side para operações de dados
- **Autenticação**: NextAuth.js com provider de email
- **Responsabilidades**:
  - Processamento de requisições
  - Validação de dados
  - Regras de negócio
  - Autorização e controle de acesso

### 3. **Camada de Dados**
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Responsabilidades**:
  - Persistência de dados
  - Queries otimizadas
  - Migrations e schema management
  - Transações e integridade referencial

### 4. **Serviços Externos**
- **SMTP Google**: Envio de emails de autenticação
- **Firebase Storage**: Armazenamento de comprovantes de pagamento
- **PIX Utils**: Geração de QR Codes PIX

### 5. **Utilitários**
- **orderStatusTranslator**: Tradução de status de pedidos
- **receiptStorage**: Gerenciamento de comprovantes
- **tailwind.js**: Configurações customizadas do Tailwind

## Fluxo de Dados

### Fluxo de Autenticação
```
Usuário → /auth/signin → NextAuth API → SMTP → Email → Link Mágico → Sessão Criada
```

### Fluxo de Compra
```
Usuário → /shop → /product/[id] → /checkout → /payment → Upload Comprovante → /statusPedido/[id]
```

### Fluxo Admin
```
Admin → /admin → Dashboard → Gerenciar Pedidos/Produtos/Usuários → Server Actions → Prisma → PostgreSQL
```

## Tecnologias Principais

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | Next.js | 14.x |
| UI | React | 18.x |
| Styling | Tailwind CSS | 3.x |
| Backend | Next.js API Routes | 14.x |
| ORM | Prisma | Latest |
| Database | PostgreSQL | Latest |
| Auth | NextAuth.js | Latest |
| Storage | Firebase | Latest |
| Email | Nodemailer | Latest |

## Segurança

- ✅ Autenticação via email (magic links)
- ✅ Sessões gerenciadas pelo NextAuth
- ✅ Controle de acesso baseado em roles (user/admin)
- ✅ Validação server-side em todas as operações
- ✅ Proteção de rotas admin
- ✅ Sanitização de inputs

## Escalabilidade

- ✅ Server-side rendering (SSR) para SEO
- ✅ Static generation onde possível
- ✅ API Routes para operações assíncronas
- ✅ Prisma para queries otimizadas
- ✅ Revalidação de cache estratégica
- ✅ Componentes reutilizáveis
