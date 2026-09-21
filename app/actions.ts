"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { emailMudancaStatus, enviarEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { PRIORIDADE_LABEL, STATUS_LABEL, type Prioridade, type Status } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

function formatarPrazo(prazo: string | null) {
  if (!prazo) return "Sem prazo";
  const [ano, mes, dia] = prazo.split("-");
  return `${dia}/${mes}/${ano}`;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return { supabase, user };
}

async function notificarSeRelacionado(
  supabase: SupabaseClient,
  ator: string,
  tarefa: { responsavel_id: string; criado_por: string },
  subject: string,
  html: string,
) {
  const { data: outro } = await supabase
    .from("profiles")
    .select("id, email")
    .neq("id", ator)
    .maybeSingle();

  const relacionado =
    outro && (outro.id === tarefa.responsavel_id || outro.id === tarefa.criado_por);

  if (relacionado && outro.email) {
    await enviarEmail(outro.email, subject, html);
  }
}

export async function criarTarefa(formData: FormData) {
  const { supabase, user } = await requireUser();

  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) throw new Error("Título é obrigatório");

  const prazo = String(formData.get("prazo") || "") || null;
  const responsavelId = String(formData.get("responsavel_id") || user.id);
  const prioridade = String(formData.get("prioridade") || "media") as Prioridade;
  const descricao = String(formData.get("descricao") || "").trim() || null;
  const observacoes = String(formData.get("observacoes") || "").trim() || null;

  const { error } = await supabase.from("tasks").insert({
    titulo,
    descricao,
    observacoes,
    prioridade,
    prazo,
    responsavel_id: responsavelId,
    criado_por: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function atualizarTarefa(id: string, formData: FormData) {
  const { supabase } = await requireUser();

  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) throw new Error("Título é obrigatório");

  const prazo = String(formData.get("prazo") || "") || null;
  const responsavelId = String(formData.get("responsavel_id") || "");
  const prioridade = String(formData.get("prioridade") || "media") as Prioridade;
  const descricao = String(formData.get("descricao") || "").trim() || null;
  const observacoes = String(formData.get("observacoes") || "").trim() || null;

  const { error } = await supabase
    .from("tasks")
    .update({
      titulo,
      descricao,
      observacoes,
      prioridade,
      prazo,
      responsavel_id: responsavelId,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function atualizarStatus(id: string, status: Status) {
  const { supabase, user } = await requireUser();

  const { data: tarefa, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id)
    .select(
      "numero, titulo, prioridade, prazo, responsavel_id, criado_por, responsavel:profiles!tasks_responsavel_id_fkey(nome)",
    )
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/");

  const { data: autor } = await supabase
    .from("profiles")
    .select("nome")
    .eq("id", user.id)
    .single();

  const responsavel = Array.isArray(tarefa.responsavel)
    ? tarefa.responsavel[0]
    : tarefa.responsavel;

  await notificarSeRelacionado(
    supabase,
    user.id,
    tarefa,
    `Demanda atualizada: ${tarefa.titulo}`,
    emailMudancaStatus({
      numero: tarefa.numero,
      titulo: tarefa.titulo,
      statusLabel: STATUS_LABEL[status],
      autorNome: autor?.nome ?? "Alguém",
      responsavelNome: responsavel?.nome ?? "-",
      prioridadeLabel: PRIORIDADE_LABEL[tarefa.prioridade as Prioridade],
      prazoTexto: formatarPrazo(tarefa.prazo),
    }),
  );
}

export async function atualizarPrioridade(id: string, prioridade: Prioridade) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("tasks")
    .update({ prioridade })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function excluirTarefa(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
