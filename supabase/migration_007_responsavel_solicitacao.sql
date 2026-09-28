-- Execute este script no SQL Editor do seu projeto Supabase
-- Adiciona um responsável (entre os aprovadores) por solicitação

alter table public.solicitacoes
  add column if not exists responsavel_id uuid references public.profiles (id);

create index if not exists solicitacoes_responsavel_idx on public.solicitacoes (responsavel_id);
