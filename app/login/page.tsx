import ConfigMissing from "@/components/ConfigMissing";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!hasSupabaseConfig()) return <ConfigMissing />;

  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-zinc-900">
          Gestão de Demandas
        </h1>
        <p className="mb-6 text-sm text-zinc-500">
          Entre com seu e-mail e senha
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <form action={login} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            E-mail
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Senha
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
