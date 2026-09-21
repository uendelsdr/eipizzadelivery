"use client";

import { useState, useTransition } from "react";
import { atualizarTarefa, criarTarefa } from "@/app/actions";
import { PRIORIDADE_STYLE } from "@/lib/taskDisplay";
import { PRIORIDADE_LABEL, type Prioridade, type Profile, type TaskComResponsavel } from "@/lib/types";

const inputStyle = {
  border: "1px solid var(--border-medium)",
  background: "rgba(0,0,0,.38)",
};

const labelClass =
  "flex flex-col gap-1.5 text-[11px] font-bold tracking-wide uppercase";

export default function TaskForm({
  profiles,
  currentUserId,
  task,
  onClose,
}: {
  profiles: Profile[];
  currentUserId: string;
  task?: TaskComResponsavel;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [prioridade, setPrioridade] = useState<Prioridade>(task?.prioridade ?? "media");

  function handleSubmit(formData: FormData) {
    formData.set("prioridade", prioridade);
    startTransition(async () => {
      if (task) {
        await atualizarTarefa(task.id, formData);
      } else {
        await criarTarefa(formData);
      }
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.74)", backdropFilter: "blur(6px)" }}
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
          <h2 className="text-lg font-bold tracking-tight text-white">
            {task ? `Editar demanda nº ${task.numero}` : "Nova demanda"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-lg text-white/60 transition-colors hover:bg-white hover:text-black"
            style={{ border: "1px solid var(--border-medium)" }}
          >
            ×
          </button>
        </div>

        <form
          id="task-form"
          action={handleSubmit}
          className="flex flex-col gap-4 px-6 py-5.5"
        >
          <label className={labelClass} style={{ color: "var(--text-tertiary)" }}>
            Título
            <input
              name="titulo"
              required
              defaultValue={task?.titulo}
              placeholder="Ex: Revisar tabela de preços do delivery"
              className="rounded-lg px-3.5 py-3 text-sm font-normal text-white normal-case outline-none"
              style={inputStyle}
            />
          </label>

          <label className={labelClass} style={{ color: "var(--text-tertiary)" }}>
            Descrição
            <textarea
              name="descricao"
              rows={3}
              defaultValue={task?.descricao ?? ""}
              placeholder="O que precisa ser feito e por quê"
              className="resize-y rounded-lg px-3.5 py-3 text-sm leading-relaxed font-normal text-white normal-case outline-none"
              style={inputStyle}
            />
          </label>

          <label className={labelClass} style={{ color: "var(--text-tertiary)" }}>
            Observações
            <textarea
              name="observacoes"
              rows={2}
              defaultValue={task?.observacoes ?? ""}
              placeholder="Notas adicionais (opcional)"
              className="resize-y rounded-lg px-3.5 py-3 text-sm leading-relaxed font-normal text-white normal-case outline-none"
              style={inputStyle}
            />
          </label>

          <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
            <label className={labelClass} style={{ color: "var(--text-tertiary)" }}>
              Responsável
              <select
                name="responsavel_id"
                defaultValue={task?.responsavel_id ?? currentUserId}
                className="cursor-pointer rounded-lg px-3.5 py-3 text-sm font-normal text-white normal-case outline-none"
                style={inputStyle}
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id} style={{ background: "#1a1817" }}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass} style={{ color: "var(--text-tertiary)" }}>
              Prazo
              <input
                type="date"
                name="prazo"
                defaultValue={task?.prazo ?? ""}
                className="cursor-pointer rounded-lg px-3.5 py-3 text-sm font-normal text-white normal-case outline-none"
                style={inputStyle}
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: "var(--text-tertiary)" }}>
              Prioridade
            </span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PRIORIDADE_LABEL) as Prioridade[]).map((p) => {
                const ativo = prioridade === p;
                const s = PRIORIDADE_STYLE[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrioridade(p)}
                    className="cursor-pointer rounded-lg px-4.5 py-2.5 text-[13px] font-bold transition-colors"
                    style={{
                      border: `1px solid ${ativo ? s.borda : "var(--border-medium)"}`,
                      background: ativo ? s.fraca : "transparent",
                      color: ativo ? s.cor : "var(--text-secondary)",
                    }}
                  >
                    {PRIORIDADE_LABEL[p]}
                  </button>
                );
              })}
            </div>
          </div>
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
            form="task-form"
            disabled={isPending}
            className="cursor-pointer rounded-lg px-6 py-3 text-[13.5px] font-bold text-white transition-colors disabled:opacity-50"
            style={{ background: "var(--accent)", boxShadow: "0 6px 16px -8px rgba(206,32,24,.5)" }}
          >
            {isPending ? "Salvando..." : task ? "Salvar alterações" : "Criar demanda"}
          </button>
        </div>
      </div>
    </div>
  );
}
