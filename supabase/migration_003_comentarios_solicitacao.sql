-- Execute este script no SQL Editor do seu projeto Supabase
-- Adiciona comentarios (perguntas/respostas) nas solicitacoes, antes da decisao

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
