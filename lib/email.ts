import { Resend } from "resend";

const FROM =
  process.env.EMAIL_FROM || "Gestão de Demandas <onboarding@resend.dev>";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function enviarEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    // Notificações por e-mail ainda não configuradas (falta RESEND_API_KEY).
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("Falha ao enviar e-mail de notificação:", err);
  }
}

export function emailMudancaStatus({
  titulo,
  statusLabel,
  autorNome,
}: {
  titulo: string;
  statusLabel: string;
  autorNome: string;
}) {
  return `
    <p>${autorNome} atualizou a demanda <strong>${titulo}</strong> para <strong>${statusLabel}</strong>.</p>
    <p><a href="${appUrl()}">Abrir Gestão de Demandas</a></p>
  `;
}

export function emailDemandasAtrasadas(
  tarefas: { titulo: string; prazo: string }[],
) {
  const itens = tarefas
    .map((t) => `<li>${t.titulo} — prazo: ${formatarPrazo(t.prazo)}</li>`)
    .join("");

  return `
    <p>Você tem ${tarefas.length} demanda(s) com o prazo vencido:</p>
    <ul>${itens}</ul>
    <p><a href="${appUrl()}">Abrir Gestão de Demandas</a></p>
  `;
}

function formatarPrazo(prazo: string) {
  const [ano, mes, dia] = prazo.split("-");
  return `${dia}/${mes}/${ano}`;
}
