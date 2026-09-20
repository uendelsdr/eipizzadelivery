"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Prioridade, Status } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return { supabase, user };
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
  const { supabase } = await requireUser();
  const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
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
