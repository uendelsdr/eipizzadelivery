import { Resend } from "resend";

const FROM =
  process.env.EMAIL_FROM || "Gestão de Demandas <onboarding@resend.dev>";

const COR = {
  bg: "#f4f4f5",
  card: "#ffffff",
  texto: "#18181b",
  suave: "#71717a",
  borda: "#e4e4e7",
  destaque: "#d92b1f",
};

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

function badge(label: string, cor: string, fundo: string) {
  return `<span style="display:inline-block;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:${cor};background:${fundo};">${label}</span>`;
}

function botao(href: string, label: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px;">
      <tr>
        <td style="background:${COR.destaque};border-radius:8px;">
          <a href="${href}" style="display:inline-block;padding:12px 22px;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">${label}</a>
        </td>
      </tr>
    </table>`;
}

function linha(label: string, valor: string) {
  return `
    <tr>
      <td style="padding:6px 0;color:${COR.suave};font-size:12px;width:110px;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;color:${COR.texto};font-size:13px;font-weight:600;">${valor}</td>
    </tr>`;
}

function emailShell(preheader: string, tituloSecao: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:${COR.bg};font-family:Arial,Helvetica,sans-serif;">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COR.bg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:520px;background:${COR.card};border-radius:14px;overflow:hidden;border:1px solid ${COR.borda};">
            <tr>
              <td style="background:${COR.destaque};padding:20px 28px;">
                <span style="color:#ffffff;font-size:14px;font-weight:800;letter-spacing:.03em;font-family:Arial,Helvetica,sans-serif;">OKEI</span>
                <div style="color:rgba(255,255,255,.85);font-size:12px;margin-top:2px;">Gestão de Demandas · Ei Pizza Delivery</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 6px;color:${COR.suave};font-size:11.5px;text-transform:uppercase;letter-spacing:.05em;font-weight:700;">${tituloSecao}</p>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;border-top:1px solid ${COR.borda};">
                <span style="color:${COR.suave};font-size:11px;">Notificação automática do sistema de Gestão de Demandas — Ei Pizza Delivery. Não é necessário responder este e-mail.</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function emailNovaDemanda({
  numero,
  titulo,
  descricao,
  autorNome,
  responsavelNome,
  prioridadeLabel,
  prazoTexto,
}: {
  numero: number;
  titulo: string;
  descricao: string | null;
  autorNome: string;
  responsavelNome: string;
  prioridadeLabel: string;
  prazoTexto: string;
}) {
  const body = `
    <p style="margin:0 0 4px;color:${COR.suave};font-size:11.5px;font-weight:700;">Demanda nº ${numero}</p>
    <h1 style="margin:0 0 14px;color:${COR.texto};font-size:19px;font-weight:800;line-height:1.35;">${titulo}</h1>
    <p style="margin:0 0 18px;color:${COR.texto};font-size:14px;line-height:1.6;">
      <strong>${autorNome}</strong> criou uma nova demanda para você.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid ${COR.borda};padding-top:6px;">
      ${linha("Responsável", responsavelNome)}
      ${linha("Prioridade", prioridadeLabel)}
      ${linha("Prazo", prazoTexto)}
      ${descricao ? linha("Descrição", descricao) : ""}
    </table>
    ${botao(appUrl(), "Abrir OkEI")}
  `;
  return emailShell(`Nova demanda: ${titulo}`, "Nova demanda", body);
}

export function emailMudancaStatus({
  numero,
  titulo,
  statusLabel,
  autorNome,
  responsavelNome,
  prioridadeLabel,
  prazoTexto,
}: {
  numero: number;
  titulo: string;
  statusLabel: string;
  autorNome: string;
  responsavelNome: string;
  prioridadeLabel: string;
  prazoTexto: string;
}) {
  const body = `
    <p style="margin:0 0 4px;color:${COR.suave};font-size:11.5px;font-weight:700;">Demanda nº ${numero}</p>
    <h1 style="margin:0 0 14px;color:${COR.texto};font-size:19px;font-weight:800;line-height:1.35;">${titulo}</h1>
    <p style="margin:0 0 18px;color:${COR.texto};font-size:14px;line-height:1.6;">
      <strong>${autorNome}</strong> alterou o status desta demanda para ${badge(statusLabel, "#ffffff", COR.destaque)}.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid ${COR.borda};padding-top:6px;">
      ${linha("Responsável", responsavelNome)}
      ${linha("Prioridade", prioridadeLabel)}
      ${linha("Prazo", prazoTexto)}
    </table>
    ${botao(appUrl(), "Abrir OkEI")}
  `;
  return emailShell(`${titulo} foi atualizada para ${statusLabel}`, "Demanda atualizada", body);
}

export function emailDemandasAtrasadas(
  tarefas: { numero: number; titulo: string; prazo: string; prioridadeLabel: string }[],
) {
  const plural = tarefas.length > 1;
  const linhas = tarefas
    .map(
      (t) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${COR.borda};">
          <div style="color:${COR.texto};font-size:13.5px;font-weight:700;margin-bottom:4px;">Nº ${t.numero} — ${t.titulo}</div>
          <div>
            ${badge(t.prioridadeLabel, COR.texto, "#f4f4f5")}
            <span style="color:${COR.destaque};font-size:12px;font-weight:700;margin-left:8px;">Prazo: ${formatarData(t.prazo)}</span>
          </div>
        </td>
      </tr>`,
    )
    .join("");

  const body = `
    <h1 style="margin:0 0 16px;color:${COR.texto};font-size:19px;font-weight:800;">
      Você tem ${tarefas.length} demanda${plural ? "s" : ""} com o prazo vencido
    </h1>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${linhas}</table>
    ${botao(appUrl(), "Ver demandas atrasadas")}
  `;
  return emailShell(
    `${tarefas.length} demanda${plural ? "s" : ""} com prazo vencido`,
    "Prazos vencidos",
    body,
  );
}

export function emailNovaSolicitacao({
  numero,
  titulo,
  tipoLabel,
  descricao,
  valor,
  solicitanteNome,
}: {
  numero: number;
  titulo: string;
  tipoLabel: string;
  descricao: string | null;
  valor: number | null;
  solicitanteNome: string;
}) {
  const body = `
    <p style="margin:0 0 4px;color:${COR.suave};font-size:11.5px;font-weight:700;">Solicitação nº ${numero}</p>
    <h1 style="margin:0 0 14px;color:${COR.texto};font-size:19px;font-weight:800;line-height:1.35;">${titulo}</h1>
    <p style="margin:0 0 18px;color:${COR.texto};font-size:14px;line-height:1.6;">
      <strong>${solicitanteNome}</strong> pediu sua aprovação para uma solicitação de ${badge(tipoLabel, "#ffffff", COR.destaque)}.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid ${COR.borda};padding-top:6px;">
      ${linha("Solicitante", solicitanteNome)}
      ${linha("Tipo", tipoLabel)}
      ${valor != null ? linha("Valor", formatarValor(valor)) : ""}
      ${descricao ? linha("Descrição", descricao) : ""}
    </table>
    ${botao(appUrl() + "/solicitacoes", "Ver e decidir")}
  `;
  return emailShell(
    `${solicitanteNome} pediu aprovação: ${titulo}`,
    "Nova solicitação",
    body,
  );
}

export function emailDecisaoSolicitacao({
  numero,
  titulo,
  aprovada,
  decisorNome,
  comentario,
}: {
  numero: number;
  titulo: string;
  aprovada: boolean;
  decisorNome: string;
  comentario: string | null;
}) {
  const statusLabel = aprovada ? "Aprovada" : "Rejeitada";
  const body = `
    <p style="margin:0 0 4px;color:${COR.suave};font-size:11.5px;font-weight:700;">Solicitação nº ${numero}</p>
    <h1 style="margin:0 0 14px;color:${COR.texto};font-size:19px;font-weight:800;line-height:1.35;">${titulo}</h1>
    <p style="margin:0 0 18px;color:${COR.texto};font-size:14px;line-height:1.6;">
      <strong>${decisorNome}</strong> ${aprovada ? "aprovou" : "rejeitou"} sua solicitação: ${badge(statusLabel, "#ffffff", aprovada ? "#16a34a" : COR.destaque)}.
    </p>
    ${comentario ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid ${COR.borda};padding-top:6px;">${linha("Comentário", comentario)}</table>` : ""}
    ${botao(appUrl() + "/solicitacoes", "Abrir OkEI")}
  `;
  return emailShell(
    `Solicitação ${statusLabel.toLowerCase()}: ${titulo}`,
    "Solicitação decidida",
    body,
  );
}

export function emailComentarioSolicitacao({
  numero,
  titulo,
  autorNome,
  mensagem,
}: {
  numero: number;
  titulo: string;
  autorNome: string;
  mensagem: string;
}) {
  const body = `
    <p style="margin:0 0 4px;color:${COR.suave};font-size:11.5px;font-weight:700;">Solicitação nº ${numero}</p>
    <h1 style="margin:0 0 14px;color:${COR.texto};font-size:19px;font-weight:800;line-height:1.35;">${titulo}</h1>
    <p style="margin:0 0 10px;color:${COR.texto};font-size:14px;line-height:1.6;">
      <strong>${autorNome}</strong> deixou uma mensagem nesta solicitação:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid ${COR.borda};padding-top:12px;">
      <tr>
        <td style="padding:10px 14px;background:#f4f4f5;border-radius:8px;color:${COR.texto};font-size:13.5px;line-height:1.6;">${mensagem}</td>
      </tr>
    </table>
    ${botao(appUrl() + "/solicitacoes", "Responder no OkEI")}
  `;
  return emailShell(
    `${autorNome} comentou em: ${titulo}`,
    "Nova mensagem",
    body,
  );
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarValor(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
