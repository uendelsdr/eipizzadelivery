"use client";

import { useState, useTransition } from "react";
import { atualizarPrioridade, atualizarStatus, excluirTarefa } from "@/app/actions";
import {
  PRIORIDADE_LABEL,
  STATUS_LABEL,
  type Prioridade,
  type Profile,
  type Status,
  type TaskComResponsavel,
} from "@/lib/types";
import TaskForm from "./TaskForm";

const PRIORIDADE_COR: Record<Prioridade, string> = {
  baixa: "bg-zinc-100 text-zinc-600",
  media: "bg-amber-100 text-amber-700",
  alta: "bg-red-100 text-red-700",
};

function formatarPrazo(prazo: string | null) {
  if (!prazo) return "Sem prazo";
  const [ano, mes, dia] = prazo.split("-");
  return `${dia}/${mes}/${ano}`;
}

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
  const atrasada = !!task.prazo && task.prazo < hoje && task.status !== "concluida";

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition-opacity ${
        atrasada ? "border-red-300 bg-red-50" : "border-zinc-200 bg-white"
      } ${isPending ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[200px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-zinc-900">{task.titulo}</h3>
            {atrasada && (
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
                Atrasada
              </span>
            )}
          </div>
          {task.observacoes && (
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-500">
              {task.observacoes}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
            <span>Prazo: {formatarPrazo(task.prazo)}</span>
            <span>·</span>
            <span>Responsável: {task.responsavel?.nome ?? "-"}</span>
            <span>·</span>
            <span>Criado por: {task.criador?.nome ?? "-"}</span>
          </div>
        </div>

        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${PRIORIDADE_COR[task.prioridade]}`}
        >
          {PRIORIDADE_LABEL[task.prioridade]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3">
        <select
          value={task.status}
          disabled={isPending}
          onChange={(e) => {
            const status = e.target.value as Status;
            startTransition(async () => {
              await atualizarStatus(task.id, status);
            });
          }}
          className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
        >
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
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
          className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
        >
          {Object.entries(PRIORIDADE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setEditando(true)}
          className="ml-auto text-sm font-medium text-zinc-500 hover:text-zinc-900"
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
          className="text-sm font-medium text-red-500 hover:text-red-700"
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
    </div>
  );
}
