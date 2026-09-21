# OkEI — Gestão de Demandas

App web para você e seu diretor operacional controlarem demandas/tarefas (título,
descrição, prazo, prioridade, status, observações) e solicitações de aprovação
(compras/mudanças), com destaque visual para demandas atrasadas e notificação por
e-mail. Feito com Next.js + Supabase (banco de dados e login), com a marca Ei Pizza
Delivery.

## 1. Rodar localmente

### 1.1. Criar o projeto no Supabase (gratuito)

1. Crie uma conta em [supabase.com](https://supabase.com) e clique em **New Project**.
2. Anote a **senha do banco** que você definir (guarde em local seguro).
3. Depois que o projeto for criado, vá em **Project Settings > API**:
   - Na aba **API Keys**, copie a **Publishable key** (`sb_publishable_...`) — é o
     equivalente atual da antiga "anon public key". **Nunca use a "Secret key"**
     (`sb_secret_...`) aqui: ela tem acesso privilegiado e não pode ser exposta no frontend.
   - No menu à esquerda, clique em **Data API** para pegar a `Project URL`
     (algo como `https://xxxxxxxx.supabase.co`).

### 1.2. Criar as tabelas

1. No painel do Supabase, abra **SQL Editor > New query**.
2. Cole todo o conteúdo do arquivo [`supabase/schema.sql`](./supabase/schema.sql) e clique em **Run**.
   (Se o banco já existia antes das demandas terem número/descrição e da aba de
   solicitações, rode também [`supabase/migration_002_numero_descricao_solicitacoes.sql`](./supabase/migration_002_numero_descricao_solicitacoes.sql).)

### 1.3. Criar os 2 usuários (você e o diretor operacional)

1. No painel do Supabase, vá em **Authentication > Users > Add user**.
2. Crie um usuário para você (e-mail + senha) e outro para o diretor operacional.
   - Marque a opção **Auto Confirm User** para não precisar confirmar por e-mail.
3. Ao criar o usuário, o app cria automaticamente um "perfil" com um nome de exibição
   baseado no e-mail. Para ajustar o nome de exibição de cada um, vá em **Table Editor
   > profiles** e edite a coluna `nome`.

### 1.4. Configurar as variáveis de ambiente

1. Copie o arquivo `.env.local.example` para `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Preencha com a `Project URL` e a `anon public` key copiadas no passo 1.1.

### 1.5. Instalar e rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) e entre com um dos e-mails/senhas criados no passo 1.3.

## 2. Colocar online (Vercel)

1. Crie um repositório no [GitHub](https://github.com/new) e suba este projeto:
   ```bash
   git remote add origin <url-do-seu-repositorio>
   git branch -M main
   git push -u origin main
   ```
2. Crie uma conta em [vercel.com](https://vercel.com) (pode usar login com GitHub).
3. Clique em **Add New > Project** e importe o repositório que você acabou de criar.
4. Em **Environment Variables**, adicione as mesmas duas variáveis do `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clique em **Deploy**. Em poucos minutos o app estará no ar em um endereço
   `https://seu-projeto.vercel.app` (dá pra depois apontar um domínio próprio, se quiser).

## 3. Notificações por e-mail

Além do destaque visual dentro do app para demandas atrasadas, o sistema envia e-mails:

- **Mudança de status**: quando um dos dois usuários muda o status de uma demanda,
  o outro recebe um e-mail avisando.
- **Prazo vencido**: todo dia, um job automático (Vercel Cron) verifica as demandas
  atrasadas e envia um e-mail para cada responsável com a lista das suas pendências.

### 3.1. Criar conta no Resend (gratuito, até 3.000 e-mails/mês)

1. Crie uma conta em [resend.com](https://resend.com).
2. Vá em **Domains > Add Domain** e adicione o mesmo domínio que você já usa
   (ex: `eipizzadelivery.com.br`). O Resend vai te dar alguns registros DNS
   (TXT/MX) para adicionar no Hostinger — igual fizemos para o subdomínio do app.
3. Depois que o domínio aparecer como **Verified**, vá em **API Keys > Create API Key**
   e copie a chave (começa com `re_`).

### 3.2. Pegar a Secret key do Supabase (só para o job de prazos vencidos)

1. No Supabase, vá em **Project Settings > API Keys > Secret keys**.
2. Copie o valor (começa com `sb_secret_`). **Essa chave nunca deve começar com
   `NEXT_PUBLIC_` nem aparecer no navegador** — é só para o job automático no servidor.

### 3.3. Variáveis de ambiente novas

Preencha no `.env.local` (local) e também nas **Environment Variables** do projeto na Vercel:

```bash
NEXT_PUBLIC_APP_URL=https://demandas.eipizzadelivery.com.br
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Gestão de Demandas <notificacoes@eipizzadelivery.com.br>"
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CRON_SECRET=escolha-uma-senha-aleatoria-aqui
```

Depois de adicionar na Vercel, faça um **redeploy** para as variáveis passarem a valer.

O agendamento do job diário já está configurado em [`vercel.json`](./vercel.json)
(roda 12:00 UTC = 09:00 no horário de Brasília). Enquanto `RESEND_API_KEY` não estiver
configurada, os envios são simplesmente ignorados — nada quebra.

## 4. Solicitações de aprovação

Além das demandas, existe uma segunda aba (**Solicitações**) para pedidos de compra,
mudança ou outro tipo que precisam da aprovação do outro usuário:

- Qualquer um dos dois cria uma solicitação (tipo, título, descrição e, se for
  compra, um valor estimado).
- Só quem **não** criou a solicitação pode aprová-la ou rejeitá-la (com um
  comentário opcional).
- O outro usuário recebe um e-mail quando uma nova solicitação precisa da decisão
  dele, e o solicitante recebe um e-mail quando ela é aprovada ou rejeitada.

## 5. Estrutura do projeto

```
app/
  actions.ts              -> Server Actions das demandas
  page.tsx                -> Lista de demandas (página protegida)
  login/                  -> Tela de login
  solicitacoes/
    actions.ts            -> Server Actions das solicitações (criar/decidir/excluir)
    page.tsx              -> Aba de solicitações
  icon.tsx, apple-icon.tsx -> Ícone do app (gerado por código)
lib/
  types.ts                -> Tipos de tarefas, perfis e solicitações
  taskDisplay.ts          -> Cores/labels de prioridade, status e prazo das demandas
  solicitacaoDisplay.ts   -> Cores/labels das solicitações
  email.ts                -> Templates e envio de e-mail (Resend)
  supabase/               -> Clientes Supabase (browser, servidor, proxy de sessão)
components/
  AppHeader.tsx            -> Cabeçalho com navegação entre Demandas e Solicitações
  OkeiMark.tsx             -> Marca OkEI (ícone + wordmark)
  TaskApp.tsx              -> Lista de demandas com filtros e visão em quadro
  TaskRow.tsx, TaskBoard.tsx -> Card de demanda (lista e Kanban)
  TaskForm.tsx             -> Formulário de criar/editar demanda
  SolicitacoesApp.tsx      -> Lista de solicitações com filtro por status
  SolicitacaoRow.tsx       -> Card de solicitação (com aprovar/rejeitar)
  SolicitacaoForm.tsx      -> Formulário de nova solicitação
supabase/
  schema.sql                                     -> Schema completo (novas instalações)
  migration_002_numero_descricao_solicitacoes.sql -> Migração incremental (bancos já existentes)
```

## Comandos

```bash
npm run dev      # ambiente de desenvolvimento
npm run build    # build de produção
npm run start    # roda o build de produção localmente
npm run lint     # checagem de lint
```
