"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Estado = "verificando" | "pronto" | "invalido";

const inputStyle = { border: "1px solid var(--border-medium)", background: "rgba(0,0,0,.38)" };
const inputClass =
  "rounded-lg px-3.5 py-2.5 text-sm font-normal text-white normal-case outline-none";

export default function RedefinirSenhaForm() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("verificando");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const iniciou = useRef(false);

  useEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;

    async function prepararSessao() {
      const supabase = createClient();
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const query = url.searchParams;

      let ok = false;

      if (hash.get("access_token") && hash.get("refresh_token")) {
        const { error } = await supabase.auth.setSession({
          access_token: hash.get("access_token")!,
          refresh_token: hash.get("refresh_token")!,
        });
        ok = !error;
      } else if (query.get("code")) {
        const { error } = await supabase.auth.exchangeCodeForSession(query.get("code")!);
        ok = !error;
      } else if (query.get("token_hash")) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: query.get("token_hash")!,
          type: "recovery",
        });
        ok = !error;
      } else if (!hash.get("error")) {
        const { data } = await supabase.auth.getSession();
        ok = !!data.session;
      }

      window.history.replaceState(null, "", window.location.pathname);
      setEstado(ok ? "pronto" : "invalido");
    }

    prepararSessao();
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmacao) {
      setErro("As senhas não são iguais.");
      return;
    }

    setSalvando(true);
    const { error } = await createClient().auth.updateUser({ password: senha });
    if (error) {
      setErro("Não foi possível salvar a nova senha. Peça um novo link e tente de novo.");
      setSalvando(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  if (estado === "verificando") {
    return (
      <p className="text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
        Verificando o link…
      </p>
    );
  }

  if (estado === "invalido") {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p
          className="rounded-lg px-3 py-3 text-sm leading-relaxed"
          style={{
            background: "var(--accent-soft)",
            color: "#f2776d",
            border: "1px solid var(--accent-border)",
          }}
        >
          Este link expirou ou já foi usado. Peça um novo link para criar a senha.
        </p>
        <Link
          href="/esqueci-senha"
          className="rounded-lg px-4 py-2.5 text-sm font-bold text-white"
          style={{ background: "var(--accent)" }}
        >
          Pedir novo link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-3">
      {erro && (
        <p
          className="rounded-lg px-3 py-2 text-sm"
          style={{
            background: "var(--accent-soft)",
            color: "#f2776d",
            border: "1px solid var(--accent-border)",
          }}
        >
          {erro}
        </p>
      )}
      <label
        className="flex flex-col gap-1.5 text-xs font-bold tracking-wide uppercase"
        style={{ color: "var(--text-tertiary)" }}
      >
        Nova senha
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          className={inputClass}
          style={inputStyle}
        />
      </label>
      <label
        className="flex flex-col gap-1.5 text-xs font-bold tracking-wide uppercase"
        style={{ color: "var(--text-tertiary)" }}
      >
        Repita a nova senha
        <input
          type="password"
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          className={inputClass}
          style={inputStyle}
        />
      </label>
      <button
        type="submit"
        disabled={salvando}
        className="mt-2 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-60"
        style={{ background: "var(--accent)", boxShadow: "0 6px 16px -8px rgba(217,43,31,.5)" }}
      >
        {salvando ? "Salvando…" : "Salvar nova senha"}
      </button>
    </form>
  );
}
