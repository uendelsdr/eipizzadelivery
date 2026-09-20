"use client";

import { useMemo, useState, useTransition } from "react";
import { sair } from "@/app/actions";
import { STATUS_LABEL, type Profile, type Status, type TaskComResponsavel } from "@/lib/types";
import TaskForm from "./TaskForm";
import TaskRow from "./TaskRow";

type FiltroStatus = "todas" | Status;

export default function TaskApp({
  initialTasks,
  profiles,
  currentUserId,
}: {
  initialTasks: TaskComResponsavel[];
  profiles: Profile[];
  currentUserId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todas");
  const [filtroResponsavel, setFiltroResponsavel] = useState("todos");
  const [somenteAtrasadas, setSomenteAtrasadas] = useState(false);
  const [, startTransition] = useTransition();

  const hoje = new Date().toISOString().slice(0, 10);
  const currentUser = profiles.find((p) => p.id === currentUserId);

  const tasks = useMemo(() => {
    return initialTasks.filter((t) => {
      if (filtroStatus !== "todas" && t.status !== filtroStatus) return false;
      if (filtroResponsavel !== "todos" && t.responsavel_id !== filtroResponsavel)
        return false;
      if (somenteAtrasadas) {
        const atrasada = !!t.prazo && t.prazo < hoje && t.status !== "concluida";
        if (!atrasada) return false;
      }
      return true;
    });
  }, [initialTasks, filtroStatus, filtroResponsavel, somenteAtrasadas, hoje]);

  const totalAtrasadas = initialTasks.filter(
    (t) => !!t.prazo && t.prazo < hoje && t.status !== "concluida",
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Gestão de Demandas
          </h1>
          <p className="text-sm text-zinc-500">
            Olá, {currentUser?.nome ?? "usuário"}
            {totalAtrasadas > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                {totalAtrasadas} atrasada{totalAtrasadas > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() =>
            startTransition(async () => {
              await sair();
            })
          }
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
        >
          Sair
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          + Nova demanda
        </button>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
        >
          <option value="todas">Todos os status</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filtroResponsavel}
          onChange={(e) => setFiltroResponsavel(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
        >
          <option value="todos">Todos os responsáveis</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={somenteAtrasadas}
            onChange={(e) => setSomenteAtrasadas(e.target.checked)}
          />
          Somente atrasadas
        </label>
      </div>

      <div className="flex flex-col gap-3">
        {tasks.length === 0 && (
          <p className="rounded-lg border border-dashed border-zinc-300 py-10 text-center text-sm text-zinc-500">
            Nenhuma demanda encontrada.
          </p>
        )}
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} profiles={profiles} hoje={hoje} />
        ))}
      </div>

      {showForm && (
        <TaskForm
          profiles={profiles}
          currentUserId={currentUserId}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
