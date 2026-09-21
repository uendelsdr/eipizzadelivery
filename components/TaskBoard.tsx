"use client";

import { useTransition } from "react";
import { atualizarStatus } from "@/app/actions";
import {
  AVANCAR_LABEL,
  PRIORIDADE_STYLE,
  prazoInfo,
  PROXIMO_STATUS,
  STATUS_STYLE,
} from "@/lib/taskDisplay";
import { PRIORIDADE_LABEL, STATUS_LABEL, type Status, type TaskComResponsavel } from "@/lib/types";

const COLUNAS: Status[] = ["pendente", "em_andamento", "concluida"];

export default function TaskBoard({
  tarefas,
  hoje,
  currentUserId,
  onEditar,
}: {
  tarefas: TaskComResponsavel[];
  hoje: string;
  currentUserId: string;
  onEditar: (task: TaskComResponsavel) => void;
}) {
  return (
    <div className="grid items-start gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))" }}>
      {COLUNAS.map((status) => {
        const itens = tarefas.filter((t) => t.status === status);
        const st = STATUS_STYLE[status];
        return (
          <section
            key={status}
            className="flex min-h-[170px] flex-col gap-3 rounded-2xl p-3.5"
            style={{ border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,.022)" }}
          >
            <div
              className="flex items-center gap-2 px-1 pb-2.5"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: st.ponto }} />
              <span className="text-xs font-bold tracking-wide text-white">
                {STATUS_LABEL[status]}
              </span>
              <span
                className="ml-auto font-mono text-[11.5px]"
                style={{ color: "var(--text-tertiary)" }}
              >
                {itens.length}
              </span>
            </div>

            {itens.map((task) => (
              <BoardCard
                key={task.id}
                task={task}
                hoje={hoje}
                currentUserId={currentUserId}
                onEditar={() => onEditar(task)}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}

function BoardCard({
  task,
  hoje,
  currentUserId,
  onEditar,
}: {
  task: TaskComResponsavel;
  hoje: string;
  currentUserId: string;
  onEditar: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const prio = PRIORIDADE_STYLE[task.prioridade];
  const prazo = prazoInfo(task.prazo, task.status, hoje);
  const souResponsavel = task.responsavel_id === currentUserId;
  const avancarConclui = task.status === "em_andamento";
  const avancarBloqueado = avancarConclui && !souResponsavel;

  return (
    <article
      className="animate-popin flex flex-col gap-2.5 rounded-xl p-4 transition-transform"
      style={{
        border: "1px solid var(--border-subtle)",
        background: "var(--surface-hover)",
        opacity: isPending ? 0.6 : 1,
      }}
    >
      <div className="flex items-start gap-2">
        <h4 className="flex-1 text-sm leading-snug font-bold tracking-tight text-white">
          <span className="font-mono text-[10.5px] font-semibold" style={{ color: "var(--text-muted)" }}>
            Nº {task.numero}
          </span>{" "}
          {task.titulo}
        </h4>
        <span
          className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
          style={{ color: prio.cor, background: prio.fraca }}
        >
          {PRIORIDADE_LABEL[task.prioridade]}
        </span>
      </div>

      {task.descricao && (
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {task.descricao}
        </p>
      )}

      <div className="flex items-center gap-2.5 font-mono text-[11px]" style={{ color: "var(--text-tertiary)" }}>
        <span style={{ color: prazo.cor }}>{prazo.curto}</span>
        <span className="ml-auto">{task.responsavel?.nome ?? "-"}</span>
      </div>

      <div className="flex gap-1.5 pt-0.5">
        <button
          disabled={isPending || avancarBloqueado}
          title={
            avancarBloqueado
              ? "Só o responsável pela demanda pode concluí-la"
              : undefined
          }
          onClick={() =>
            startTransition(async () => {
              const proximo =
                task.status === "concluida" ? "pendente" : PROXIMO_STATUS[task.status];
              await atualizarStatus(task.id, proximo);
            })
          }
          className="flex-1 cursor-pointer rounded-lg px-2.5 py-2 text-[11.5px] font-bold text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-white"
          style={{ border: "1px solid var(--border-medium)", background: "rgba(255,255,255,.06)" }}
        >
          {AVANCAR_LABEL[task.status]}
        </button>
        <button
          onClick={onEditar}
          className="cursor-pointer rounded-lg px-2.5 py-2 text-[11.5px] font-semibold transition-colors hover:text-white"
          style={{ border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
        >
          Editar
        </button>
      </div>
    </article>
  );
}
