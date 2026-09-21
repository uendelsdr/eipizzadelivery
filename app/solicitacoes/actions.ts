"use server";

import { revalidatePath } from "next/cache";
import {
  emailDecisaoSolicitacao,
  emailNovaSolicitacao,
  enviarEmail,
} from "@/lib/email";
import { APPROVER_EMAIL } from "@/lib/approver";
import { createClient } from "@/lib/supabase/server";
import { TIPO_SOLICITACAO_LABEL, type TipoSolicitacao } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return { supabase, user };
}

export async function criarSolicitacao(formData: FormData) {
  const { supabase, user } = await requireUser();

  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) throw new Error("Título é obrigatório");

  const tipo = String(formData.get("tipo") || "outro") as TipoSolicitacao;
  const descricao = String(formData.get("descricao") || "").trim() || null;
  const valorRaw = String(formData.get("valor") || "").trim();
  const valor = tipo === "compra" && valorRaw ? Number(valorRaw.replace(",", ".")) : null;

  const { data: solicitacao, error } = await supabase
    .from("solicitacoes")
    .insert({ titulo, tipo, descricao, valor, solicitante_id: user.id })
    .select("numero")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/solicitacoes");

  const [{ data: autor }, { data: outro }] = await Promise.all([
    supabase.from("profiles").select("nome").eq("id", user.id).single(),
    supabase.from("profiles").select("email").neq("id", user.id).maybeSingle(),
  ]);

  if (outro?.email) {
    await enviarEmail(
      outro.email,
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

  if (user.email !== APPROVER_EMAIL) {
    throw new Error("Somente o aprovador pode decidir sobre solicitações");
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

export async function excluirSolicitacao(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("solicitacoes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/solicitacoes");
}
