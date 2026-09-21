"use client";

import { useState, useTransition } from "react";
import {
  decidirSolicitacao,
  enviarComentario,
  excluirSolicitacao,
} from "@/app/solicitacoes/actions";
import {
  formatarDataHora,
  formatarValor,
  STATUS_SOLICITACAO_STYLE,
  TIPO_SOLICITACAO_STYLE,
} from "@/lib/solicitacaoDisplay";
import {
  STATUS_SOLICITACAO_LABEL,
  TIPO_SOLICITACAO_LABEL,
  type SolicitacaoComPerfis,
} from "@/lib/types";

export default function SolicitacaoRow({
  solicitacao,
  currentUserId,
  souAprovador,
}: {
  solicitacao: SolicitacaoComPerfis;
  currentUserId: string;
  souAprovador: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [decidindo, setDecidindo] = useState<"aprovada" | "rejeitada" | null>(null);
  const [comentario, setComentario] = useState("");
  const [mensagem, setMensagem] = useState("");

  const st = STATUS_SOLICITACAO_STYLE[solicitacao.status];
  const tp = TIPO_SOLICITACAO_STYLE[solicitacao.tipo];
  const podeDecidir = solicitacao.status === "pendente" && souAprovador;
  const ehSolicitante = solicitacao.solicitante_id === currentUserId;
  const podeConversar = solicitacao.status === "pendente" && (souAprovador || ehSolicitante);

  function confirmarDecisao() {
    if (!decidindo) return;
    startTransition(async () => {
      await decidirSolicitacao(solicitacao.id, decidindo, comentario);
      setDecidindo(null);
      setComentario("");
    });
  }

  function enviarMensagem() {
    const texto = mensagem.trim();
    if (!texto) return;
    startTransition(async () => {
      await enviarComentario(solicitacao.id, texto);
      setMensagem("");
    });
  }

  return (
    <article
      className="animate-popin flex flex-col gap-3 rounded-2xl p-5"
      style={{
        border: "1px solid var(--border-subtle)",
        background: "var(--surface)",
        opacity: isPending ? 0.6 : 1,
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-[220px] flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11.5px] font-semibold" style={{ color: "var(--text-muted)" }}>
              Nº {solicitacao.numero}
            </span>
            <h3 className="text-base font-bold tracking-tight text-white">{solicitacao.titulo}</h3>
            <span
              className="rounded-md px-2 py-0.5 text-[10.5px] font-bold tracking-wider uppercase"
              style={{ color: tp.cor, background: tp.fundo }}
            >
              {TIPO_SOLICITACAO_LABEL[solicitacao.tipo]}
            </span>
            <span
              className="rounded-md px-2 py-0.5 text-[10.5px] font-bold tracking-wider uppercase"
              style={{ color: st.cor, background: st.fundo }}
            >
              {STATUS_SOLICITACAO_LABEL[solicitacao.status]}
            </span>
          </div>

          {solicitacao.descricao && (
            <p
              className="max-w-[70ch] text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: "var(--text-secondary)" }}
            >
              {solicitacao.descricao}
            </p>
          )}

          <div
            className="flex flex-wrap gap-4 font-mono text-[11.5px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            {solicitacao.valor != null && (
              <span style={{ color: "var(--foreground)" }}>{formatarValor(solicitacao.valor)}</span>
            )}
            <span>solicitado por {solicitacao.solicitante?.nome ?? "-"}</span>
            <span>{formatarDataHora(solicitacao.created_at)}</span>
          </div>

          {solicitacao.status !== "pendente" && (
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              {STATUS_SOLICITACAO_LABEL[solicitacao.status]} por{" "}
              <strong style={{ color: "var(--text-secondary)" }}>{solicitacao.decisor?.nome ?? "-"}</strong>
              {solicitacao.comentario_decisao && <>: “{solicitacao.comentario_decisao}”</>}
            </p>
          )}
        </div>

        {ehSolicitante && solicitacao.status === "pendente" && (
          <button
            onClick={() => {
              if (confirm("Cancelar esta solicitação?")) {
                startTransition(async () => {
                  await excluirSolicitacao(solicitacao.id);
                });
              }
            }}
            className="cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-[var(--accent)] hover:text-white"
            style={{
              border: "1px solid var(--accent-border)",
              background: "rgba(217,43,31,.14)",
              color: "#f2776d",
            }}
          >
            Cancelar
          </button>
        )}
      </div>

      {solicitacao.comentarios.length > 0 && (
        <div
          className="flex flex-col gap-2.5 border-t pt-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {solicitacao.comentarios.map((c) => (
            <div key={c.id} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{c.autor?.nome ?? "-"}</span>
                <span className="font-mono text-[10.5px]" style={{ color: "var(--text-muted)" }}>
                  {formatarDataHora(c.created_at)}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                {c.mensagem}
              </p>
            </div>
          ))}
        </div>
      )}

      {podeConversar && (
        <div
          className="flex gap-2 border-t pt-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <input
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                enviarMensagem();
              }
            }}
            placeholder={
              souAprovador ? "Perguntar ou pedir mais informações…" : "Responder…"
            }
            className="flex-1 rounded-lg px-3.5 py-2.5 text-sm text-white outline-none"
            style={{ border: "1px solid var(--border-medium)", background: "rgba(0,0,0,.38)" }}
          />
          <button
            onClick={enviarMensagem}
            disabled={isPending || !mensagem.trim()}
            className="cursor-pointer rounded-lg px-4 py-2.5 text-xs font-bold text-white transition-colors disabled:opacity-50"
            style={{ border: "1px solid var(--border-medium)" }}
          >
            Enviar
          </button>
        </div>
      )}

      {podeDecidir && (
        <div className="flex flex-col gap-2 border-t pt-3" style={{ borderColor: "var(--border-subtle)" }}>
          {decidindo ? (
            <>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={2}
                placeholder="Comentário (opcional)"
                className="resize-y rounded-lg px-3.5 py-2.5 text-sm text-white outline-none"
                style={{ border: "1px solid var(--border-medium)", background: "rgba(0,0,0,.38)" }}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDecidindo(null)}
                  className="cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-white hover:text-black"
                  style={{ border: "1px solid var(--border-medium)", color: "var(--text-secondary)" }}
                >
                  Voltar
                </button>
                <button
                  onClick={confirmarDecisao}
                  disabled={isPending}
                  className="cursor-pointer rounded-lg px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                  style={{
                    background: decidindo === "aprovada" ? "#16a34a" : "var(--accent)",
                  }}
                >
                  Confirmar {decidindo === "aprovada" ? "aprovação" : "rejeição"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setDecidindo("aprovada")}
                className="flex-1 cursor-pointer rounded-lg px-3.5 py-2.5 text-xs font-bold text-white transition-colors"
                style={{ background: "#16a34a" }}
              >
                Aprovar
              </button>
              <button
                onClick={() => setDecidindo("rejeitada")}
                className="flex-1 cursor-pointer rounded-lg px-3.5 py-2.5 text-xs font-bold text-white transition-colors"
                style={{ background: "var(--accent)" }}
              >
                Rejeitar
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
