-- Execute este script no SQL Editor do seu projeto Supabase
-- (Supabase Dashboard > SQL Editor > New query > cole e clique em Run)

-- 1. Tabela de perfis (nome de exibição de cada um dos 2 usuários)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null
);

alter table public.profiles enable row level security;

create policy "Usuarios autenticados podem ver todos os perfis"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Usuario pode atualizar o proprio perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Cria automaticamente um perfil quando um novo usuário é criado no Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Tabela de tarefas / demandas
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  titulo text not null,
  descricao text,
  observacoes text,
  prioridade text not null default 'media' check (prioridade in ('baixa', 'media', 'alta')),
  status text not null default 'pendente' check (status in ('pendente', 'em_andamento', 'concluida')),
  prazo date,
  responsavel_id uuid not null references public.profiles (id),
  criado_por uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

-- Como este app é de uso exclusivo dos 2 usuários cadastrados manualmente,
-- qualquer usuário autenticado neste projeto Supabase pode ver e gerenciar todas as tarefas.
create policy "Usuarios autenticados podem ver todas as tarefas"
  on public.tasks for select
  to authenticated
  using (true);

create policy "Usuarios autenticados podem criar tarefas"
  on public.tasks for insert
  to authenticated
  with check (true);

create policy "Usuarios autenticados podem atualizar tarefas"
  on public.tasks for update
  to authenticated
  using (true);

create policy "Usuarios autenticados podem excluir tarefas"
  on public.tasks for delete
  to authenticated
  using (true);

-- Mantém updated_at sempre atualizado
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_tasks_updated on public.tasks;
create trigger on_tasks_updated
  before update on public.tasks
  for each row execute procedure public.handle_updated_at();

create index if not exists tasks_prazo_idx on public.tasks (prazo);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_responsavel_idx on public.tasks (responsavel_id);

-- 3. Tabela de solicitacoes (aprovacao de mudancas/compras)
create table if not exists public.solicitacoes (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  titulo text not null,
  tipo text not null default 'outro' check (tipo in ('compra', 'mudanca', 'outro')),
  descricao text,
  valor numeric(10,2),
  solicitante_id uuid not null references public.profiles (id),
  status text not null default 'pendente' check (status in ('pendente', 'aprovada', 'rejeitada')),
  decidido_por uuid references public.profiles (id),
  comentario_decisao text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

alter table public.solicitacoes enable row level security;

create policy "Usuarios autenticados podem ver todas as solicitacoes"
  on public.solicitacoes for select
  to authenticated
  using (true);

create policy "Usuarios autenticados podem criar solicitacoes"
  on public.solicitacoes for insert
  to authenticated
  with check (true);

create policy "Usuarios autenticados podem atualizar solicitacoes"
  on public.solicitacoes for update
  to authenticated
  using (true);

create policy "Usuarios autenticados podem excluir solicitacoes"
  on public.solicitacoes for delete
  to authenticated
  using (true);

create index if not exists solicitacoes_status_idx on public.solicitacoes (status);

-- 4. Comentarios (perguntas/respostas) nas solicitacoes, antes da decisao
create table if not exists public.solicitacao_comentarios (
  id uuid primary key default gen_random_uuid(),
  solicitacao_id uuid not null references public.solicitacoes (id) on delete cascade,
  autor_id uuid not null references public.profiles (id),
  mensagem text not null,
  created_at timestamptz not null default now()
);

alter table public.solicitacao_comentarios enable row level security;

create policy "Usuarios autenticados podem ver todos os comentarios"
  on public.solicitacao_comentarios for select
  to authenticated
  using (true);

create policy "Usuarios autenticados podem criar comentarios"
  on public.solicitacao_comentarios for insert
  to authenticated
  with check (true);

create index if not exists solicitacao_comentarios_solicitacao_idx
  on public.solicitacao_comentarios (solicitacao_id);

-- 5. Anexos (documentos/imagens) nas solicitacoes
insert into storage.buckets (id, name, public)
values ('solicitacoes-anexos', 'solicitacoes-anexos', false)
on conflict (id) do nothing;

create policy "Usuarios autenticados podem enviar anexos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'solicitacoes-anexos');

create policy "Usuarios autenticados podem ver anexos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'solicitacoes-anexos');

create policy "Usuarios autenticados podem excluir anexos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'solicitacoes-anexos');

create table if not exists public.solicitacao_anexos (
  id uuid primary key default gen_random_uuid(),
  solicitacao_id uuid not null references public.solicitacoes (id) on delete cascade,
  nome_arquivo text not null,
  caminho text not null,
  tamanho bigint,
  tipo text,
  enviado_por uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.solicitacao_anexos enable row level security;

create policy "Usuarios autenticados podem ver todos os anexos"
  on public.solicitacao_anexos for select
  to authenticated
  using (true);

create policy "Usuarios autenticados podem criar anexos"
  on public.solicitacao_anexos for insert
  to authenticated
  with check (true);

create policy "Usuarios autenticados podem excluir anexos"
  on public.solicitacao_anexos for delete
  to authenticated
  using (true);

create index if not exists solicitacao_anexos_solicitacao_idx
  on public.solicitacao_anexos (solicitacao_id);
