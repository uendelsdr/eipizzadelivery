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

  const [{ data: profiles }, { data: solicitacoesData }] = await Promise.all([
    supabase.from("profiles").select("*").order("nome"),
    supabase
      .from("solicitacoes")
      .select(
        "*, solicitante:profiles!solicitacoes_solicitante_id_fkey(*), decisor:profiles!solicitacoes_decidido_por_fkey(*), comentarios:solicitacao_comentarios(*, autor:profiles(nome)), anexos:solicitacao_anexos(*)",
      )
      .order("created_at", { ascending: false })
      .order("created_at", { referencedTable: "solicitacao_comentarios", ascending: true })
      .order("created_at", { referencedTable: "solicitacao_anexos", ascending: true }),
  ]);

  const solicitacoesBrutas = (solicitacoesData ??
    []) as unknown as (SolicitacaoComPerfis & { anexos: Omit<SolicitacaoComPerfis["anexos"][number], "url">[] })[];

  const todosOsCaminhos = solicitacoesBrutas.flatMap((s) => s.anexos.map((a) => a.caminho));
  const urlPorCaminho = new Map<string, string>();

  if (todosOsCaminhos.length > 0) {
    const { data: assinadas } = await supabase.storage
      .from("solicitacoes-anexos")
      .createSignedUrls(todosOsCaminhos, 3600);
    for (const item of assinadas ?? []) {
      if (item.path && item.signedUrl) urlPorCaminho.set(item.path, item.signedUrl);
    }
  }

  const solicitacoes: SolicitacaoComPerfis[] = solicitacoesBrutas.map((s) => ({
    ...s,
    anexos: s.anexos.map((a) => ({ ...a, url: urlPorCaminho.get(a.caminho) ?? null })),
  }));

  return (
    <SolicitacoesApp
      initialSolicitacoes={solicitacoes}
      profiles={(profiles ?? []) as Profile[]}
      currentUserId={user.id}
      souAprovador={user.email === APPROVER_EMAIL}
    />
  );
}
