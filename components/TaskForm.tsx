"use client";

import { useTransition } from "react";
import { atualizarTarefa, criarTarefa } from "@/app/actions";
import type { Profile, TaskComResponsavel } from "@/lib/types";

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

  function handleSubmit(formData: FormData) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">
          {task ? "Editar demanda" : "Nova demanda"}
        </h2>
        <form action={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Título
            <input
              name="titulo"
              required
              defaultValue={task?.titulo}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Prazo
            <input
              type="date"
              name="prazo"
              defaultValue={task?.prazo ?? ""}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Prioridade
            <select
              name="prioridade"
              defaultValue={task?.prioridade ?? "media"}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Responsável
            <select
              name="responsavel_id"
              defaultValue={task?.responsavel_id ?? currentUserId}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Observações
            <textarea
              name="observacoes"
              rows={3}
              defaultValue={task?.observacoes ?? ""}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
            />
          </label>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
