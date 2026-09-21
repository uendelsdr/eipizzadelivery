import ConfigMissing from "@/components/ConfigMissing";
import OkeiLogo from "@/components/OkeiMark";
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
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-2xl"
        style={{
          border: "1px solid var(--border-subtle)",
          background: "#151313",
        }}
      >
        <div className="mb-5">
          <OkeiLogo iconSize={40} textSize="text-2xl" />
        </div>
        <p className="mb-6 text-sm" style={{ color: "var(--text-tertiary)" }}>
          Gestão de Demandas · Ei Pizza Delivery
        </p>

        {error && (
          <p
            className="mb-4 rounded-lg px-3 py-2 text-sm"
            style={{
              background: "var(--accent-soft)",
              color: "#f2776d",
              border: "1px solid var(--accent-border)",
            }}
          >
            {error}
          </p>
        )}

        <form action={login} className="flex flex-col gap-3">
          <label
            className="flex flex-col gap-1.5 text-xs font-bold tracking-wide uppercase"
            style={{ color: "var(--text-tertiary)" }}
          >
            E-mail
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="rounded-lg px-3.5 py-2.5 text-sm font-normal text-white normal-case outline-none"
              style={{
                border: "1px solid var(--border-medium)",
                background: "rgba(0,0,0,.38)",
              }}
            />
          </label>
          <label
            className="flex flex-col gap-1.5 text-xs font-bold tracking-wide uppercase"
            style={{ color: "var(--text-tertiary)" }}
          >
            Senha
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="rounded-lg px-3.5 py-2.5 text-sm font-normal text-white normal-case outline-none"
              style={{
                border: "1px solid var(--border-medium)",
                background: "rgba(0,0,0,.38)",
              }}
            />
          </label>
          <button
            type="submit"
            className="mt-2 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-colors"
            style={{
              background: "var(--accent)",
              boxShadow: "0 6px 16px -8px rgba(206,32,24,.5)",
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
