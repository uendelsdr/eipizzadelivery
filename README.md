# Gestão de Demandas

App web para você e seu diretor operacional controlarem demandas/tarefas: título,
prazo, prioridade, status e observações, com destaque visual para demandas atrasadas.
Feito com Next.js + Supabase (banco de dados e login).

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

## 4. Estrutura do projeto

```
app/
  actions.ts          -> Server Actions: criar/editar/excluir tarefa, mudar status/prioridade
  page.tsx            -> Lista de demandas (página protegida)
  login/              -> Tela de login
lib/
  types.ts            -> Tipos das tarefas/perfis
  supabase/           -> Clientes Supabase (browser, servidor, proxy de sessão)
components/
  TaskApp.tsx          -> Lista com filtros
  TaskRow.tsx           -> Cada demanda com seus próprios controles (status, prioridade, editar, excluir)
  TaskForm.tsx          -> Formulário de criar/editar
supabase/
  schema.sql          -> Script para criar as tabelas no Supabase
```

## Comandos

```bash
npm run dev      # ambiente de desenvolvimento
npm run build    # build de produção
npm run start    # roda o build de produção localmente
npm run lint     # checagem de lint
```
