export type Prioridade = "baixa" | "media" | "alta";
export type Status = "pendente" | "em_andamento" | "concluida";

export type Profile = {
  id: string;
  nome: string;
  email: string;
};

export type Task = {
  id: string;
  titulo: string;
  observacoes: string | null;
  prioridade: Prioridade;
  status: Status;
  prazo: string | null; // YYYY-MM-DD
  responsavel_id: string;
  criado_por: string;
  created_at: string;
  updated_at: string;
};

export type TaskComResponsavel = Task & {
  responsavel: Profile | null;
  criador: Profile | null;
};

export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export const STATUS_LABEL: Record<Status, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
};
