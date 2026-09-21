import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { emailDemandasAtrasadas, enviarEmail } from "@/lib/email";
import { PRIORIDADE_LABEL, type Prioridade } from "@/lib/types";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const hoje = new Date().toISOString().slice(0, 10);

  const { data: atrasadas, error } = await supabase
    .from("tasks")
    .select(
      "titulo, prazo, prioridade, responsavel:profiles!tasks_responsavel_id_fkey(email)",
    )
    .lt("prazo", hoje)
    .neq("status", "concluida");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const porEmail = new Map<
    string,
    { titulo: string; prazo: string; prioridadeLabel: string }[]
  >();

  for (const tarefa of atrasadas ?? []) {
    const responsavel = Array.isArray(tarefa.responsavel)
      ? tarefa.responsavel[0]
      : tarefa.responsavel;
    if (!responsavel?.email || !tarefa.prazo) continue;

    const lista = porEmail.get(responsavel.email) ?? [];
    lista.push({
      titulo: tarefa.titulo,
      prazo: tarefa.prazo,
      prioridadeLabel: PRIORIDADE_LABEL[tarefa.prioridade as Prioridade],
    });
    porEmail.set(responsavel.email, lista);
  }

  for (const [email, tarefas] of porEmail) {
    await enviarEmail(
      email,
      `Você tem ${tarefas.length} demanda(s) atrasada(s)`,
      emailDemandasAtrasadas(tarefas),
    );
  }

  return NextResponse.json({ notificados: porEmail.size });
}
