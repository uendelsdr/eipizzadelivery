"use client";

import { useMemo, useState } from "react";
import { STATUS_SOLICITACAO_LABEL, type Profile, type SolicitacaoComPerfis, type StatusSolicitacao } from "@/lib/types";
import AppHeader from "./AppHeader";
import SolicitacaoForm from "./SolicitacaoForm";
import SolicitacaoRow from "./SolicitacaoRow";

type FiltroStatus = "todas" | StatusSolicitacao;

export default function SolicitacoesApp({
  initialSolicitacoes,
  profiles,
  currentUserId,
  souAprovador,
}: {
  initialSolicitacoes: SolicitacaoComPerfis[];
  profiles: Profile[];
  currentUserId: string;
  souAprovador: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todas");

  const pendentesParaMim = souAprovador
    ? initialSolicitacoes.filter((s) => s.status === "pendente").length
    : 0;

  const solicitacoes = useMemo(() => {
    return initialSolicitacoes.filter(
      (s) => filtroStatus === "todas" || s.status === filtroStatus,
    );
  }, [initialSolicitacoes, filtroStatus]);

  return (
    <div className="min-h-screen pb-20">
      <AppHeader profiles={profiles} currentUserId={currentUserId} />

      <main className="mx-auto max-w-[1220px] px-5 pt-7 sm:px-7">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="mb-1.5 text-[28px] font-extrabold tracking-tight text-white">
              Solicitações
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {pendentesParaMim > 0
                ? `${pendentesParaMim} aguardando sua decisão`
                : "Nenhuma solicitação aguardando você"}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex cursor-pointer items-center gap-2 rounded-[11px] px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-px"
            style={{ background: "var(--accent)", boxShadow: "0 6px 16px -8px rgba(217,43,31,.5)" }}
          >
            <span className="text-base leading-none">+</span>Nova solicitação
          </button>
        </div>

        <div
          className="mb-5.5 flex flex-wrap items-center gap-2.5 rounded-2xl p-3"
          style={{ border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,.025)" }}
        >
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}
            className="cursor-pointer rounded-[10px] px-3.5 py-2.5 text-[13.5px] text-white outline-none"
            style={{ border: "1px solid var(--border-medium)", background: "rgba(0,0,0,.35)" }}
          >
            <option value="todas" style={{ background: "#1a1817" }}>Todos os status</option>
            {Object.entries(STATUS_SOLICITACAO_LABEL).map(([value, label]) => (
              <option key={value} value={value} style={{ background: "#1a1817" }}>{label}</option>
            ))}
          </select>
        </div>

        {solicitacoes.length === 0 ? (
          <div
            className="rounded-2xl px-6 py-16 text-center"
            style={{ border: "1px dashed var(--border-medium)" }}
          >
            <p className="mb-1.5 text-[15px] font-bold text-white">
              Nenhuma solicitação com esses filtros
            </p>
            <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              Crie uma nova solicitação de mudança ou compra para o outro aprovar.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {solicitacoes.map((s) => (
              <SolicitacaoRow
                key={s.id}
                solicitacao={s}
                currentUserId={currentUserId}
                souAprovador={souAprovador}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && <SolicitacaoForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
