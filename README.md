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

## 3. Sobre as notificações

Por decisão de vocês, por enquanto as notificações são **dentro do próprio app**:

- Demandas com prazo vencido (e ainda não concluídas) aparecem destacadas em vermelho
  com a etiqueta "Atrasada", e o total de atrasadas aparece no topo da tela.
- Qualquer mudança de status é refletida imediatamente para os dois usuários.

Quando vocês decidirem integrar WhatsApp (Twilio ou Meta Cloud API), a mudança fica
concentrada em `app/actions.ts` (funções `atualizarStatus` e `criarTarefa`, além de
um novo job agendado para checar prazos vencidos) — não muda nada na estrutura do
banco de dados ou da interface.

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
