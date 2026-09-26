-- Execute este script no SQL Editor do seu projeto Supabase
-- 1) Marca quem e aprovador (visivel/decide todas as solicitacoes)
-- 2) Restringe a visibilidade das solicitacoes ao criador + aprovadores
-- 3) Adiciona o cadastro de unidades e o campo na solicitacao
-- (Script seguro para rodar mais de uma vez)

-- 1. Coluna de aprovador no perfil
alter table public.profiles add column if not exists eh_aprovador boolean not null default false;

update public.profiles set eh_aprovador = true
where email in ('uendelsdr@gmail.com', 'kaua.eipizza@gmail.com');

-- 2. Visibilidade das solicitacoes: só quem criou ou um aprovador
drop policy if exists "Usuarios autenticados podem ver todas as solicitacoes" on public.solicitacoes;
drop policy if exists "Ver proprias solicitacoes ou como aprovador" on public.solicitacoes;
create policy "Ver proprias solicitacoes ou como aprovador"
  on public.solicitacoes for select
  to authenticated
  using (
    solicitante_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.eh_aprovador)
  );

drop policy if exists "Usuarios autenticados podem atualizar solicitacoes" on public.solicitacoes;
drop policy if exists "Atualizar proprias solicitacoes ou como aprovador" on public.solicitacoes;
create policy "Atualizar proprias solicitacoes ou como aprovador"
  on public.solicitacoes for update
  to authenticated
  using (
    solicitante_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.eh_aprovador)
  );

drop policy if exists "Usuarios autenticados podem excluir solicitacoes" on public.solicitacoes;
drop policy if exists "Excluir proprias solicitacoes ou como aprovador" on public.solicitacoes;
create policy "Excluir proprias solicitacoes ou como aprovador"
  on public.solicitacoes for delete
  to authenticated
  using (
    solicitante_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.eh_aprovador)
  );

-- Comentarios e anexos seguem a mesma visibilidade da solicitacao
drop policy if exists "Usuarios autenticados podem ver todos os comentarios" on public.solicitacao_comentarios;
drop policy if exists "Ver comentarios de solicitacoes visiveis" on public.solicitacao_comentarios;
create policy "Ver comentarios de solicitacoes visiveis"
  on public.solicitacao_comentarios for select
  to authenticated
  using (
    exists (
      select 1 from public.solicitacoes s
      where s.id = solicitacao_comentarios.solicitacao_id
        and (
          s.solicitante_id = auth.uid()
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.eh_aprovador)
        )
    )
  );

drop policy if exists "Usuarios autenticados podem ver todos os anexos" on public.solicitacao_anexos;
drop policy if exists "Ver anexos de solicitacoes visiveis" on public.solicitacao_anexos;
create policy "Ver anexos de solicitacoes visiveis"
  on public.solicitacao_anexos for select
  to authenticated
  using (
    exists (
      select 1 from public.solicitacoes s
      where s.id = solicitacao_anexos.solicitacao_id
        and (
          s.solicitante_id = auth.uid()
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.eh_aprovador)
        )
    )
  );

drop policy if exists "Usuarios autenticados podem excluir anexos" on public.solicitacao_anexos;
drop policy if exists "Excluir proprios anexos ou como aprovador" on public.solicitacao_anexos;
create policy "Excluir proprios anexos ou como aprovador"
  on public.solicitacao_anexos for delete
  to authenticated
  using (
    enviado_por = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.eh_aprovador)
  );

-- 3. Unidades (lojas/filiais)
create table if not exists public.unidades (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  created_at timestamptz not null default now()
);

alter table public.unidades enable row level security;

drop policy if exists "Usuarios autenticados podem ver as unidades" on public.unidades;
create policy "Usuarios autenticados podem ver as unidades"
  on public.unidades for select
  to authenticated
  using (true);

alter table public.solicitacoes add column if not exists unidade_id uuid references public.unidades (id);

insert into public.unidades (nome) values
  ('Periperi'),
  ('Pernambués')
on conflict (nome) do nothing;
