"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { emailMudancaStatus, enviarEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABEL, type Prioridade, type Status } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return { supabase, user };
}

async function notificarOutroUsuario(
  supabase: SupabaseClient,
  exceto: string,
  subject: string,
  html: string,
) {
  const { data: outro } = await supabase
    .from("profiles")
    .select("email")
    .neq("id", exceto)
    .maybeSingle();

  if (outro?.email) {
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
  const observacoes = String(formData.get("observacoes") || "").trim() || null;

  const { error } = await supabase.from("tasks").insert({
    titulo,
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
  const observacoes = String(formData.get("observacoes") || "").trim() || null;

  const { error } = await supabase
    .from("tasks")
    .update({
      titulo,
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
    .select("titulo")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/");

  const { data: autor } = await supabase
    .from("profiles")
    .select("nome")
    .eq("id", user.id)
    .single();

  await notificarOutroUsuario(
    supabase,
    user.id,
    `Demanda atualizada: ${tarefa.titulo}`,
    emailMudancaStatus({
      titulo: tarefa.titulo,
      statusLabel: STATUS_LABEL[status],
      autorNome: autor?.nome ?? "Alguém",
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
