"use server";

import { revalidatePath } from "next/cache";
import {
  emailComentarioSolicitacao,
  emailDecisaoSolicitacao,
  emailNovaSolicitacao,
  emailSolicitacaoReaberta,
  enviarEmail,
} from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { TIPO_SOLICITACAO_LABEL, type TipoSolicitacao } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET_ANEXOS = "solicitacoes-anexos";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return { supabase, user };
}

async function souAprovador(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("eh_aprovador")
    .eq("id", userId)
    .single();
  return !!data?.eh_aprovador;
}

async function getAprovadores(supabase: SupabaseClient, excetoUserId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id, nome, email")
    .eq("eh_aprovador", true)
    .neq("id", excetoUserId);
  return data ?? [];
}

async function limparAnexos(supabase: SupabaseClient, solicitacaoId: string) {
  const { data: anexos } = await supabase
    .from("solicitacao_anexos")
    .select("caminho")
    .eq("solicitacao_id", solicitacaoId);

  if (!anexos || anexos.length === 0) return;

  await supabase.storage.from(BUCKET_ANEXOS).remove(anexos.map((a) => a.caminho));
  await supabase.from("solicitacao_anexos").delete().eq("solicitacao_id", solicitacaoId);
}

async function uploadAnexos(
  supabase: SupabaseClient,
  solicitacaoId: string,
  userId: string,
  arquivos: FormDataEntryValue[],
) {
  for (const arquivo of arquivos) {
    if (!(arquivo instanceof File) || arquivo.size === 0) continue;

    const caminho = `${solicitacaoId}/${Date.now()}-${arquivo.name}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_ANEXOS)
      .upload(caminho, arquivo);
    if (uploadError) throw new Error(uploadError.message);

    const { error: dbError } = await supabase.from("solicitacao_anexos").insert({
      solicitacao_id: solicitacaoId,
      nome_arquivo: arquivo.name,
      caminho,
      tamanho: arquivo.size,
      tipo: arquivo.type || null,
      enviado_por: userId,
    });
    if (dbError) throw new Error(dbError.message);
  }
}

export async function criarSolicitacao(formData: FormData) {
  const { supabase, user } = await requireUser();

  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) throw new Error("Título é obrigatório");

  const tipo = String(formData.get("tipo") || "outro") as TipoSolicitacao;
  const descricao = String(formData.get("descricao") || "").trim() || null;
  const valorRaw = String(formData.get("valor") || "").trim();
  const valor = tipo === "compra" && valorRaw ? Number(valorRaw.replace(",", ".")) : null;
  const unidadeId = String(formData.get("unidade_id") || "").trim() || null;

  const { data: solicitacao, error } = await supabase
    .from("solicitacoes")
    .insert({ titulo, tipo, descricao, valor, unidade_id: unidadeId, solicitante_id: user.id })
    .select("id, numero")
    .single();

  if (error) throw new Error(error.message);

  await uploadAnexos(supabase, solicitacao.id, user.id, formData.getAll("arquivos"));
  revalidatePath("/solicitacoes");

  const [{ data: autor }, aprovadores] = await Promise.all([
    supabase.from("profiles").select("nome").eq("id", user.id).single(),
    getAprovadores(supabase, user.id),
  ]);

  for (const aprovador of aprovadores) {
    if (!aprovador.email) continue;
    await enviarEmail(
      aprovador.email,
      `Nova solicitação para aprovar: ${titulo}`,
      emailNovaSolicitacao({
        numero: solicitacao.numero,
        titulo,
        tipoLabel: TIPO_SOLICITACAO_LABEL[tipo],
        descricao,
        valor,
        solicitanteNome: autor?.nome ?? "Alguém",
      }),
    );
  }
}

export async function decidirSolicitacao(
  id: string,
  status: "aprovada" | "rejeitada",
  comentario: string,
) {
  const { supabase, user } = await requireUser();

  if (!(await souAprovador(supabase, user.id))) {
    throw new Error("Somente um aprovador pode decidir sobre solicitações");
  }

  const { data: solicitacao, error: fetchError } = await supabase
    .from("solicitacoes")
    .select("titulo, numero, solicitante_id, status")
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (solicitacao.status !== "pendente") {
    throw new Error("Esta solicitação já foi decidida");
  }

  const comentarioFinal = comentario.trim() || null;

  const { error } = await supabase
    .from("solicitacoes")
    .update({
      status,
      decidido_por: user.id,
      comentario_decisao: comentarioFinal,
      decided_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await limparAnexos(supabase, id);
  revalidatePath("/solicitacoes");

  const [{ data: decisor }, { data: solicitante }] = await Promise.all([
    supabase.from("profiles").select("nome").eq("id", user.id).single(),
    supabase.from("profiles").select("email").eq("id", solicitacao.solicitante_id).single(),
  ]);

  if (solicitante?.email) {
    await enviarEmail(
      solicitante.email,
      `Solicitação ${status === "aprovada" ? "aprovada" : "rejeitada"}: ${solicitacao.titulo}`,
      emailDecisaoSolicitacao({
        numero: solicitacao.numero,
        titulo: solicitacao.titulo,
        aprovada: status === "aprovada",
        decisorNome: decisor?.nome ?? "Alguém",
        comentario: comentarioFinal,
      }),
    );
  }
}

export async function reabrirSolicitacao(id: string) {
  const { supabase, user } = await requireUser();

  if (!(await souAprovador(supabase, user.id))) {
    throw new Error("Somente um aprovador pode reabrir solicitações");
  }

  const { data: solicitacao, error: fetchError } = await supabase
    .from("solicitacoes")
    .select("titulo, numero, solicitante_id, status")
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (solicitacao.status === "pendente") {
    throw new Error("Esta solicitação já está pendente");
  }

  const { error } = await supabase
    .from("solicitacoes")
    .update({
      status: "pendente",
      decidido_por: null,
      comentario_decisao: null,
      decided_at: null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/solicitacoes");

  const [{ data: reabridor }, { data: solicitante }] = await Promise.all([
    supabase.from("profiles").select("nome").eq("id", user.id).single(),
    supabase.from("profiles").select("email").eq("id", solicitacao.solicitante_id).single(),
  ]);

  if (solicitante?.email) {
    await enviarEmail(
      solicitante.email,
      `Solicitação reaberta: ${solicitacao.titulo}`,
      emailSolicitacaoReaberta({
        numero: solicitacao.numero,
        titulo: solicitacao.titulo,
        reabridorNome: reabridor?.nome ?? "Alguém",
      }),
    );
  }
}

export async function editarComentario(comentarioId: string, novaMensagem: string) {
  const { supabase, user } = await requireUser();

  const texto = novaMensagem.trim();
  if (!texto) throw new Error("Mensagem vazia");

  const { data: comentario, error: fetchError } = await supabase
    .from("solicitacao_comentarios")
    .select("autor_id, solicitacao_id")
    .eq("id", comentarioId)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (comentario.autor_id !== user.id) {
    throw new Error("Só quem escreveu a mensagem pode editá-la");
  }

  const { data: solicitacao } = await supabase
    .from("solicitacoes")
    .select("status")
    .eq("id", comentario.solicitacao_id)
    .single();

  if (solicitacao?.status !== "pendente") {
    throw new Error("Só é possível editar mensagens enquanto a solicitação está pendente");
  }

  const { error } = await supabase
    .from("solicitacao_comentarios")
    .update({ mensagem: texto, editado_em: new Date().toISOString() })
    .eq("id", comentarioId);

  if (error) throw new Error(error.message);
  revalidatePath("/solicitacoes");
}

export async function enviarComentario(solicitacaoId: string, mensagem: string) {
  const { supabase, user } = await requireUser();

  const texto = mensagem.trim();
  if (!texto) throw new Error("Mensagem vazia");

  const { data: solicitacao, error: fetchError } = await supabase
    .from("solicitacoes")
    .select("titulo, numero, solicitante_id")
    .eq("id", solicitacaoId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase.from("solicitacao_comentarios").insert({
    solicitacao_id: solicitacaoId,
    autor_id: user.id,
    mensagem: texto,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/solicitacoes");

  const [{ data: autor }, aprovadores, { data: solicitante }] = await Promise.all([
    supabase.from("profiles").select("nome").eq("id", user.id).single(),
    getAprovadores(supabase, user.id),
    solicitacao.solicitante_id !== user.id
      ? supabase.from("profiles").select("id, email").eq("id", solicitacao.solicitante_id).single()
      : Promise.resolve({ data: null }),
  ]);

  const destinatarios = new Map<string, string>();
  for (const aprovador of aprovadores) {
    if (aprovador.email) destinatarios.set(aprovador.id, aprovador.email);
  }
  if (solicitante?.email) destinatarios.set(solicitante.id, solicitante.email);

  for (const email of destinatarios.values()) {
    await enviarEmail(
      email,
      `Nova mensagem na solicitação: ${solicitacao.titulo}`,
      emailComentarioSolicitacao({
        numero: solicitacao.numero,
        titulo: solicitacao.titulo,
        autorNome: autor?.nome ?? "Alguém",
        mensagem: texto,
      }),
    );
  }
}

export async function anexarArquivos(solicitacaoId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const arquivos = formData.getAll("arquivos");
  if (arquivos.length === 0) return;

  await uploadAnexos(supabase, solicitacaoId, user.id, arquivos);
  revalidatePath("/solicitacoes");
}

export async function excluirAnexo(anexoId: string) {
  const { supabase, user } = await requireUser();

  const { data: anexo, error: fetchError } = await supabase
    .from("solicitacao_anexos")
    .select("caminho, enviado_por")
    .eq("id", anexoId)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (anexo.enviado_por !== user.id) {
    throw new Error("Só quem enviou o anexo pode removê-lo");
  }

  await supabase.storage.from(BUCKET_ANEXOS).remove([anexo.caminho]);

  const { error } = await supabase.from("solicitacao_anexos").delete().eq("id", anexoId);
  if (error) throw new Error(error.message);
  revalidatePath("/solicitacoes");
}

export async function excluirSolicitacao(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("solicitacoes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/solicitacoes");
}
