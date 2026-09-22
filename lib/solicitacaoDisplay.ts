import type { StatusSolicitacao, TipoSolicitacao } from "@/lib/types";

export const STATUS_SOLICITACAO_STYLE: Record<
  StatusSolicitacao,
  { cor: string; fundo: string }
> = {
  pendente: { cor: "rgba(255,255,255,.72)", fundo: "rgba(255,255,255,.08)" },
  aprovada: { cor: "#4ade80", fundo: "rgba(34,197,94,.16)" },
  rejeitada: { cor: "#f2776d", fundo: "rgba(206,32,24,.16)" },
};

export const TIPO_SOLICITACAO_STYLE: Record<TipoSolicitacao, { cor: string; fundo: string }> = {
  compra: { cor: "#ffffff", fundo: "rgba(255,255,255,.12)" },
  mudanca: { cor: "#ffffff", fundo: "rgba(255,255,255,.12)" },
  outro: { cor: "rgba(255,255,255,.62)", fundo: "rgba(255,255,255,.07)" },
};

export function formatarValor(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarDataHora(iso: string) {
  const data = new Date(iso);
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatarTamanho(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
