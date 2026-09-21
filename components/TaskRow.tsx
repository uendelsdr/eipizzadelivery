"use client";

import { useState, useTransition } from "react";
import { atualizarPrioridade, atualizarStatus, excluirTarefa } from "@/app/actions";
import { PRIORIDADE_STYLE, prazoInfo, STATUS_STYLE } from "@/lib/taskDisplay";
import {
  PRIORIDADE_LABEL,
  STATUS_LABEL,
  type Prioridade,
  type Profile,
  type Status,
  type TaskComResponsavel,
} from "@/lib/types";
import TaskForm from "./TaskForm";

export default function TaskRow({
  task,
  profiles,
  hoje,
}: {
  task: TaskComResponsavel;
  profiles: Profile[];
  hoje: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [editando, setEditando] = useState(false);

  const prio = PRIORIDADE_STYLE[task.prioridade];
  const st = STATUS_STYLE[task.status];
  const prazo = prazoInfo(task.prazo, task.status, hoje);

  return (
    <article
      className="animate-popin flex flex-wrap items-start gap-4 rounded-2xl p-5 transition-colors"
      style={{
        border: "1px solid var(--border-subtle)",
        background: "var(--surface)",
        opacity: isPending ? 0.6 : 1,
      }}
    >
      <div
        className="min-h-[58px] w-[3px] self-stretch rounded-full"
        style={{ background: prio.cor }}
      />

      <div className="flex min-w-[240px] flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11.5px] font-semibold" style={{ color: "var(--text-muted)" }}>
            Nº {task.numero}
          </span>
          <h3 className="text-base font-bold tracking-tight text-white">
            {task.titulo}
          </h3>
          <span
            className="rounded-md px-2 py-0.5 text-[10.5px] font-bold tracking-wider uppercase"
            style={{ color: prio.cor, background: prio.fraca }}
          >
            {PRIORIDADE_LABEL[task.prioridade]}
          </span>
          <span
            className="rounded-md px-2 py-0.5 text-[10.5px] font-bold tracking-wider uppercase"
            style={{ color: st.cor, background: st.fundo }}
          >
            {STATUS_LABEL[task.status]}
          </span>
        </div>

        {task.descricao && (
          <p
            className="max-w-[70ch] text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: "var(--text-secondary)" }}
          >
            {task.descricao}
          </p>
        )}

        {task.observacoes && (
          <p
            className="max-w-[70ch] text-xs leading-relaxed whitespace-pre-wrap"
            style={{ color: "var(--text-tertiary)" }}
          >
            <strong style={{ color: "var(--text-secondary)" }}>Obs:</strong> {task.observacoes}
          </p>
        )}

        <div
          className="flex flex-wrap gap-4 font-mono text-[11.5px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          <span style={{ color: prazo.cor }}>{prazo.texto}</span>
          <span>resp. {task.responsavel?.nome ?? "-"}</span>
          <span>por {task.criador?.nome ?? "-"}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={task.status}
          disabled={isPending}
          onChange={(e) => {
            const status = e.target.value as Status;
            startTransition(async () => {
              await atualizarStatus(task.id, status);
            });
          }}
          className="cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold text-white outline-none"
          style={{ border: "1px solid var(--border-medium)", background: "rgba(0,0,0,.38)" }}
        >
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value} style={{ background: "#1a1817" }}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={task.prioridade}
          disabled={isPending}
          onChange={(e) => {
            const prioridade = e.target.value as Prioridade;
            startTransition(async () => {
              await atualizarPrioridade(task.id, prioridade);
            });
          }}
          className="cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold text-white outline-none"
          style={{ border: "1px solid var(--border-medium)", background: "rgba(0,0,0,.38)" }}
        >
          {Object.entries(PRIORIDADE_LABEL).map(([value, label]) => (
            <option key={value} value={value} style={{ background: "#1a1817" }}>
              {label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setEditando(true)}
          className="cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white hover:text-black"
          style={{ border: "1px solid var(--border-medium)" }}
        >
          Editar
        </button>
        <button
          onClick={() => {
            if (confirm("Excluir esta demanda?")) {
              startTransition(async () => {
                await excluirTarefa(task.id);
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
          Excluir
        </button>
      </div>

      {editando && (
        <TaskForm
          profiles={profiles}
          currentUserId={task.criado_por}
          task={task}
          onClose={() => setEditando(false)}
        />
      )}
    </article>
  );
}
