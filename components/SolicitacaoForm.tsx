"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { criarSolicitacao } from "@/app/solicitacoes/actions";
import { TIPO_SOLICITACAO_STYLE } from "@/lib/solicitacaoDisplay";
import { TIPO_SOLICITACAO_LABEL, type TipoSolicitacao } from "@/lib/types";

const inputStyle = {
  border: "1px solid var(--border-medium)",
  background: "rgba(0,0,0,.38)",
};

const labelClass = "flex flex-col gap-1.5 text-[11px] font-bold tracking-wide uppercase";

export default function SolicitacaoForm({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [tipo, setTipo] = useState<TipoSolicitacao>("outro");

  function handleSubmit(formData: FormData) {
    formData.set("tipo", tipo);
    startTransition(async () => {
      await criarSolicitacao(formData);
      onClose();
    });
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(6,5,5,.9)" }}
      onClick={onClose}
    >
      <div
        className="animate-popin w-full max-w-lg overflow-hidden rounded-[20px] shadow-2xl"
        style={{ border: "1px solid var(--border-medium)", background: "#151313" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-3 px-6 py-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <span className="h-5.5 w-2 rounded-full" style={{ background: "var(--accent)" }} />
          <h2 className="text-lg font-bold tracking-tight text-white">Nova solicitação</h2>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-lg text-white/60 transition-colors hover:bg-white hover:text-black"
            style={{ border: "1px solid var(--border-medium)" }}
          >
            ×
          </button>
        </div>

        <form id="solicitacao-form" action={handleSubmit} className="flex flex-col gap-4 px-6 py-5.5">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--text-tertiary)" }}>
              Tipo
            </span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TIPO_SOLICITACAO_LABEL) as TipoSolicitacao[]).map((t) => {
                const ativo = tipo === t;
                const s = TIPO_SOLICITACAO_STYLE[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className="cursor-pointer rounded-lg px-4.5 py-2.5 text-[13px] font-bold transition-colors"
                    style={{
                      border: `1px solid ${ativo ? "var(--accent-border)" : "var(--border-medium)"}`,
                      background: ativo ? s.fundo : "transparent",
                      color: ativo ? s.cor : "var(--text-secondary)",
                    }}
                  >
                    {TIPO_SOLICITACAO_LABEL[t]}
                  </button>
                );
              })}
            </div>
          </div>

          <label className={labelClass} style={{ color: "var(--text-tertiary)" }}>
            Título
            <input
              name="titulo"
              required
              placeholder="Ex: Compra de novo forno para a filial"
              className="rounded-lg px-3.5 py-3 text-sm font-normal text-white normal-case outline-none"
              style={inputStyle}
            />
          </label>

          <label className={labelClass} style={{ color: "var(--text-tertiary)" }}>
            Descrição
            <textarea
              name="descricao"
              rows={3}
              placeholder="Detalhe o que está sendo solicitado e por quê"
              className="resize-y rounded-lg px-3.5 py-3 text-sm leading-relaxed font-normal text-white normal-case outline-none"
              style={inputStyle}
            />
          </label>

          {tipo === "compra" && (
            <label className={labelClass} style={{ color: "var(--text-tertiary)" }}>
              Valor estimado (R$)
              <input
                name="valor"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className="rounded-lg px-3.5 py-3 text-sm font-normal text-white normal-case outline-none"
                style={inputStyle}
              />
            </label>
          )}

          <label className={labelClass} style={{ color: "var(--text-tertiary)" }}>
            Anexos (opcional)
            <input
              name="arquivos"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              className="cursor-pointer rounded-lg px-3.5 py-2.5 text-sm font-normal text-white normal-case outline-none file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--accent)] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
              style={inputStyle}
            />
          </label>
        </form>

        <div
          className="flex justify-end gap-2.5 px-6 py-4.5"
          style={{ borderTop: "1px solid var(--border-subtle)", background: "rgba(0,0,0,.22)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg px-4.5 py-3 text-[13.5px] font-semibold transition-colors hover:bg-white hover:text-black"
            style={{ border: "1px solid var(--border-medium)", color: "var(--text-secondary)" }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="solicitacao-form"
            disabled={isPending}
            className="cursor-pointer rounded-lg px-6 py-3 text-[13.5px] font-bold text-white transition-colors disabled:opacity-50"
            style={{ background: "var(--accent)", boxShadow: "0 6px 16px -8px rgba(217,43,31,.5)" }}
          >
            {isPending ? "Enviando..." : "Enviar solicitação"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
