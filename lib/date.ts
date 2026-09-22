// Data de "hoje" no fuso de Brasília (America/Sao_Paulo), independente do fuso
// do navegador ou do servidor onde o código roda (ex: Vercel roda em UTC).
export function hojeBrasil(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(
    new Date(),
  );
}
