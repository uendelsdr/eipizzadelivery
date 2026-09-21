import { redirect } from "next/navigation";
import ConfigMissing from "@/components/ConfigMissing";
import SolicitacoesApp from "@/components/SolicitacoesApp";
import { APPROVER_EMAIL } from "@/lib/approver";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Profile, SolicitacaoComPerfis } from "@/lib/types";

export default async function SolicitacoesPage() {
  if (!hasSupabaseConfig()) return <ConfigMissing />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profiles }, { data: solicitacoes }] = await Promise.all([
    supabase.from("profiles").select("*").order("nome"),
    supabase
      .from("solicitacoes")
      .select(
        "*, solicitante:profiles!solicitacoes_solicitante_id_fkey(*), decisor:profiles!solicitacoes_decidido_por_fkey(*)",
      )
      .order("created_at", { ascending: false }),
  ]);

  return (
    <SolicitacoesApp
      initialSolicitacoes={(solicitacoes ?? []) as unknown as SolicitacaoComPerfis[]}
      profiles={(profiles ?? []) as Profile[]}
      currentUserId={user.id}
      souAprovador={user.email === APPROVER_EMAIL}
    />
  );
}
