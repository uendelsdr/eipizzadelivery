-- Execute este script no SQL Editor do seu projeto Supabase
-- Permite reabrir solicitações decididas e editar mensagens de comentário

-- 1. Marca quando um comentário foi editado
alter table public.solicitacao_comentarios
  add column if not exists editado_em timestamptz;

-- 2. Permite que o autor edite a própria mensagem
drop policy if exists "Autor pode editar proprio comentario" on public.solicitacao_comentarios;
create policy "Autor pode editar proprio comentario"
  on public.solicitacao_comentarios for update
  to authenticated
  using (autor_id = auth.uid());

-- Observação: reabrir uma solicitação usa a policy de UPDATE que já existe
-- em "solicitacoes" ("Atualizar proprias solicitacoes ou como aprovador"),
-- nenhuma alteração é necessária nela.
