export type Prioridade = "baixa" | "media" | "alta";
export type Status = "pendente" | "em_andamento" | "concluida";
export type TipoSolicitacao = "compra" | "mudanca" | "outro";
export type StatusSolicitacao = "pendente" | "aprovada" | "rejeitada";

export type Profile = {
  id: string;
  nome: string;
  email: string;
};

export type Task = {
  id: string;
  numero: number;
  titulo: string;
  descricao: string | null;
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

export type Solicitacao = {
  id: string;
  numero: number;
  titulo: string;
  tipo: TipoSolicitacao;
  descricao: string | null;
  valor: number | null;
  solicitante_id: string;
  status: StatusSolicitacao;
  decidido_por: string | null;
  comentario_decisao: string | null;
  created_at: string;
  decided_at: string | null;
};

export type SolicitacaoComentario = {
  id: string;
  solicitacao_id: string;
  autor_id: string;
  mensagem: string;
  created_at: string;
};

export type ComentarioComAutor = SolicitacaoComentario & {
  autor: Profile | null;
};

export type SolicitacaoAnexo = {
  id: string;
  solicitacao_id: string;
  nome_arquivo: string;
  caminho: string;
  tamanho: number | null;
  tipo: string | null;
  enviado_por: string;
  created_at: string;
};

export type AnexoComUrl = SolicitacaoAnexo & { url: string | null };

export type SolicitacaoComPerfis = Solicitacao & {
  solicitante: Profile | null;
  decisor: Profile | null;
  comentarios: ComentarioComAutor[];
  anexos: AnexoComUrl[];
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

export const TIPO_SOLICITACAO_LABEL: Record<TipoSolicitacao, string> = {
  compra: "Compra",
  mudanca: "Mudança",
  outro: "Outro",
};

export const STATUS_SOLICITACAO_LABEL: Record<StatusSolicitacao, string> = {
  pendente: "Pendente",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
};
