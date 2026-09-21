-- Execute este script no SQL Editor do seu projeto Supabase
-- Adiciona: numero sequencial e descricao nas demandas, e a tabela de solicitacoes

-- 1. Numero sequencial unico por demanda (ex: "Demanda nº 12") e campo de descricao
alter table public.tasks add column if not exists numero bigint generated always as identity;
alter table public.tasks add column if not exists descricao text;

-- 2. Tabela de solicitacoes (aprovacao de mudancas/compras)
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
