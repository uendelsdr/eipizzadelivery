import type { Prioridade, Status } from "@/lib/types";

export const PRIORIDADE_STYLE: Record<
  Prioridade,
  { cor: string; fraca: string; borda: string }
> = {
  alta: { cor: "#e7483c", fraca: "rgba(206,32,24,.18)", borda: "rgba(206,32,24,.55)" },
  media: { cor: "#ffffff", fraca: "rgba(255,255,255,.12)", borda: "rgba(255,255,255,.4)" },
  baixa: { cor: "rgba(255,255,255,.62)", fraca: "rgba(255,255,255,.07)", borda: "rgba(255,255,255,.2)" },
};

export const STATUS_STYLE: Record<
  Status,
  { cor: string; fundo: string; ponto: string }
> = {
  pendente: { cor: "rgba(255,255,255,.72)", fundo: "rgba(255,255,255,.08)", ponto: "rgba(255,255,255,.5)" },
  em_andamento: { cor: "#f2776d", fundo: "rgba(206,32,24,.16)", ponto: "#ce2018" },
  concluida: { cor: "rgba(255,255,255,.5)", fundo: "rgba(255,255,255,.05)", ponto: "rgba(255,255,255,.3)" },
};

export const PROXIMO_STATUS: Record<Status, Status> = {
  pendente: "em_andamento",
  em_andamento: "concluida",
  concluida: "concluida",
};

export const AVANCAR_LABEL: Record<Status, string> = {
  pendente: "Iniciar",
  em_andamento: "Concluir",
  concluida: "Reabrir",
};

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function prazoInfo(prazo: string | null, status: Status, hoje: string) {
  if (!prazo) {
    return { texto: "Sem prazo", curto: "sem prazo", cor: "var(--text-muted)" };
  }

  if (status === "concluida") {
    return {
      texto: `Entregue · ${formatarData(prazo)}`,
      curto: formatarData(prazo),
      cor: "var(--text-muted)",
    };
  }

  const dias = Math.round(
    (new Date(prazo + "T12:00:00").getTime() - new Date(hoje + "T12:00:00").getTime()) /
      86400000,
  );

  if (dias < 0) {
    return {
      texto: `Atrasada ${Math.abs(dias)}d · ${formatarData(prazo)}`,
      curto: `atrasada ${Math.abs(dias)}d`,
      cor: "#e7483c",
    };
  }
  if (dias === 0) {
    return { texto: `Vence hoje · ${formatarData(prazo)}`, curto: "vence hoje", cor: "#e7483c" };
  }
  if (dias <= 3) {
    return {
      texto: `Faltam ${dias}d · ${formatarData(prazo)}`,
      curto: `faltam ${dias}d`,
      cor: "#ffffff",
    };
  }
  return {
    texto: `Prazo ${formatarData(prazo)}`,
    curto: formatarData(prazo),
    cor: "var(--text-tertiary)",
  };
}

export function ehAtrasada(prazo: string | null, status: Status, hoje: string) {
  return !!prazo && status !== "concluida" && prazo < hoje;
}
