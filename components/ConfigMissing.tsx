export default function ConfigMissing() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold text-zinc-900">
        Configuração pendente
      </h1>
      <p className="text-sm text-zinc-600">
        Este app ainda não está conectado ao Supabase. Configure as variáveis{" "}
        <code className="mx-1 rounded bg-zinc-100 px-1.5 py-0.5">
          NEXT_PUBLIC_SUPABASE_URL
        </code>{" "}
        e{" "}
        <code className="mx-1 rounded bg-zinc-100 px-1.5 py-0.5">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>{" "}
        no arquivo{" "}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5">.env.local</code>{" "}
        (veja o README.md) e reinicie o servidor.
      </p>
    </div>
  );
}
