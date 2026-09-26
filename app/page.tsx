import { redirect } from "next/navigation";
import ConfigMissing from "@/components/ConfigMissing";
import TaskApp from "@/components/TaskApp";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Profile, TaskComResponsavel } from "@/lib/types";

export default async function Home() {
  if (!hasSupabaseConfig()) return <ConfigMissing />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profiles }, { data: tasks }] = await Promise.all([
    supabase.from("profiles").select("*").order("nome"),
    supabase
      .from("tasks")
      .select(
        "*, responsavel:profiles!tasks_responsavel_id_fkey(*), criador:profiles!tasks_criado_por_fkey(*)",
      )
      .order("prazo", { ascending: true, nullsFirst: false }),
  ]);

  const meuPerfil = (profiles ?? []).find((p) => p.id === user.id);

  // A aba de Demandas é exclusiva dos aprovadores; responsáveis de setor
  // usam apenas a aba de Solicitações.
  if (!meuPerfil?.eh_aprovador) redirect("/solicitacoes");

  return (
    <TaskApp
      initialTasks={(tasks ?? []) as unknown as TaskComResponsavel[]}
      profiles={(profiles ?? []) as Profile[]}
      currentUserId={user.id}
      souAprovador={meuPerfil.eh_aprovador}
    />
  );
}
