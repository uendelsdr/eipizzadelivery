"use client";

import { useMemo, useState } from "react";
import { hojeBrasil } from "@/lib/date";
import { ehAtrasada } from "@/lib/taskDisplay";
import { STATUS_LABEL, type Profile, type Status, type TaskComResponsavel } from "@/lib/types";
import AppHeader from "./AppHeader";
import TaskBoard from "./TaskBoard";
import TaskForm from "./TaskForm";
import TaskRow from "./TaskRow";

type FiltroStatus = "todas" | Status;
type Visao = "lista" | "quadro";

export default function TaskApp({
  initialTasks,
  profiles,
  currentUserId,
  souAprovador,
}: {
  initialTasks: TaskComResponsavel[];
  profiles: Profile[];
  currentUserId: string;
  souAprovador: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<TaskComResponsavel | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todas");
  const [filtroResponsavel, setFiltroResponsavel] = useState("todos");
  const [somenteAtrasadas, setSomenteAtrasadas] = useState(false);
  const [visao, setVisao] = useState<Visao>("quadro");

  const hoje = hojeBrasil();
  const currentUser = profiles.find((p) => p.id === currentUserId);

  const tasks = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return initialTasks.filter((t) => {
      if (filtroStatus !== "todas" && t.status !== filtroStatus) return false;
      if (filtroResponsavel !== "todos" && t.responsavel_id !== filtroResponsavel)
        return false;
      if (somenteAtrasadas && !ehAtrasada(t.prazo, t.status, hoje)) return false;
      if (
        q &&
        !`${t.numero} ${t.titulo} ${t.descricao ?? ""} ${t.observacoes ?? ""} ${t.responsavel?.nome ?? ""}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [initialTasks, busca, filtroStatus, filtroResponsavel, somenteAtrasadas, hoje]);

  const abertas = initialTasks.filter((t) => t.status !== "concluida").length;
  const andamento = initialTasks.filter((t) => t.status === "em_andamento").length;
  const atrasadas = initialTasks.filter((t) => ehAtrasada(t.prazo, t.status, hoje)).length;
  const concluidas = initialTasks.filter((t) => t.status === "concluida").length;

  const cards: {
    label: string;
    valor: number;
    ativo: boolean;
    destaque?: boolean;
    onClick: () => void;
  }[] = [
    {
      label: "Em aberto",
      valor: abertas,
      ativo: filtroStatus === "pendente" && !somenteAtrasadas,
      onClick: () => {
        setFiltroStatus("pendente");
        setSomenteAtrasadas(false);
      },
    },
    {
      label: "Em andamento",
      valor: andamento,
      ativo: filtroStatus === "em_andamento" && !somenteAtrasadas,
      onClick: () => {
        setFiltroStatus("em_andamento");
        setSomenteAtrasadas(false);
      },
    },
    {
      label: "Atrasadas",
      valor: atrasadas,
      ativo: somenteAtrasadas,
      destaque: true,
      onClick: () => {
        setFiltroStatus("todas");
        setSomenteAtrasadas(true);
      },
    },
    {
      label: "Concluídas",
      valor: concluidas,
      ativo: filtroStatus === "concluida" && !somenteAtrasadas,
      onClick: () => {
        setFiltroStatus("concluida");
        setSomenteAtrasadas(false);
      },
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      <AppHeader profiles={profiles} currentUserId={currentUserId} souAprovador={souAprovador} />

      <main className="mx-auto max-w-[1220px] px-5 pt-7 sm:px-7">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="mb-1.5 text-[28px] font-extrabold tracking-tight text-white">
              Olá, {currentUser?.nome ?? "usuário"}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {abertas} demandas em aberto · {atrasadas} atrasadas · {concluidas} concluídas
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex cursor-pointer items-center gap-2 rounded-[11px] px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-px"
            style={{ background: "var(--accent)", boxShadow: "0 6px 16px -8px rgba(217,43,31,.5)" }}
          >
            <span className="text-base leading-none">+</span>Nova demanda
          </button>
        </div>

        <div className="mb-5.5 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          {cards.map((c) => (
            <button
              key={c.label}
              onClick={c.onClick}
              className="flex cursor-pointer flex-col gap-2 rounded-2xl px-4.5 py-4 text-left transition-transform hover:-translate-y-0.5"
              style={{
                border: `1px solid ${c.ativo ? (c.destaque ? "var(--accent)" : "var(--border-strong)") : "var(--border-subtle)"}`,
                background: c.ativo
                  ? c.destaque
                    ? "var(--accent-soft)"
                    : "rgba(255,255,255,.1)"
                  : "var(--surface)",
              }}
            >
              <span
                className="text-[11px] font-bold tracking-wider uppercase"
                style={{ color: c.destaque ? "#ef4136" : "var(--text-secondary)" }}
              >
                {c.label}
              </span>
              <span className="text-[28px] leading-none font-extrabold tracking-tight text-white">
                {c.valor}
              </span>
            </button>
          ))}
        </div>

        <div
          className="mb-5.5 flex flex-wrap items-center gap-2.5 rounded-2xl p-3"
          style={{ border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,.025)" }}
        >
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar demanda ou responsável…"
            className="min-w-[220px] flex-1 rounded-[10px] px-3.5 py-2.5 text-[13.5px] text-white outline-none"
            style={{ border: "1px solid var(--border-medium)", background: "rgba(0,0,0,.35)" }}
          />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}
            className="cursor-pointer rounded-[10px] px-3.5 py-2.5 text-[13.5px] text-white outline-none"
            style={{ border: "1px solid var(--border-medium)", background: "rgba(0,0,0,.35)" }}
          >
            <option value="todas" style={{ background: "#1a1817" }}>Todos os status</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value} style={{ background: "#1a1817" }}>{label}</option>
            ))}
          </select>
          <select
            value={filtroResponsavel}
            onChange={(e) => setFiltroResponsavel(e.target.value)}
            className="cursor-pointer rounded-[10px] px-3.5 py-2.5 text-[13.5px] text-white outline-none"
            style={{ border: "1px solid var(--border-medium)", background: "rgba(0,0,0,.35)" }}
          >
            <option value="todos" style={{ background: "#1a1817" }}>Todos os responsáveis</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id} style={{ background: "#1a1817" }}>{p.nome}</option>
            ))}
          </select>
          <button
            onClick={() => setSomenteAtrasadas((v) => !v)}
            className="flex cursor-pointer items-center gap-2 rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold transition-colors"
            style={{
              border: `1px solid ${somenteAtrasadas ? "var(--accent)" : "var(--border-medium)"}`,
              background: somenteAtrasadas ? "var(--accent)" : "transparent",
              color: somenteAtrasadas ? "#ffffff" : "var(--text-secondary)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: somenteAtrasadas ? "#ffffff" : "rgba(255,255,255,.35)" }}
            />
            Somente atrasadas
          </button>
          <div
            className="flex gap-[3px] rounded-[10px] p-[3px]"
            style={{ background: "rgba(0,0,0,.38)", border: "1px solid var(--border-subtle)" }}
          >
            {(["lista", "quadro"] as Visao[]).map((v) => (
              <button
                key={v}
                onClick={() => setVisao(v)}
                className="cursor-pointer rounded-lg px-4 py-2 text-[12.5px] font-bold transition-colors"
                style={{
                  background: visao === v ? "var(--accent)" : "transparent",
                  color: visao === v ? "#ffffff" : "var(--text-secondary)",
                }}
              >
                {v === "lista" ? "Lista" : "Quadro"}
              </button>
            ))}
          </div>
        </div>

        {tasks.length === 0 ? (
          <div
            className="rounded-2xl px-6 py-16 text-center"
            style={{ border: "1px dashed var(--border-medium)" }}
          >
            <p className="mb-1.5 text-[15px] font-bold text-white">
              Nenhuma demanda com esses filtros
            </p>
            <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              Ajuste a busca ou limpe os filtros para ver tudo.
            </p>
          </div>
        ) : visao === "lista" ? (
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                profiles={profiles}
                hoje={hoje}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        ) : (
          <TaskBoard
            tarefas={tasks}
            hoje={hoje}
            currentUserId={currentUserId}
            onEditar={setEditando}
          />
        )}
      </main>

      {showForm && (
        <TaskForm
          profiles={profiles}
          currentUserId={currentUserId}
          onClose={() => setShowForm(false)}
        />
      )}

      {editando && (
        <TaskForm
          profiles={profiles}
          currentUserId={editando.criado_por}
          task={editando}
          onClose={() => setEditando(null)}
        />
      )}
    </div>
  );
}
