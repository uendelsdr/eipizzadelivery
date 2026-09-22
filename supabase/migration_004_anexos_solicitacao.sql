-- Execute este script no SQL Editor do seu projeto Supabase
-- Adiciona suporte a anexos (documentos/imagens) nas solicitacoes

-- 1. Bucket de armazenamento privado para os anexos
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

-- 2. Metadados dos anexos
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
