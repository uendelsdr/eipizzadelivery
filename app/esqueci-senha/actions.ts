"use server";

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function solicitarRedefinicao(formData: FormData) {
  const email = String(formData.get("email") || "").trim();

  if (email) {
    const h = await headers();
    const origin = h.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Fluxo implícito: o link do e-mail funciona em qualquer navegador/aparelho,
    // sem depender de cookie criado no navegador que pediu a troca.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false } },
    );

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/redefinir-senha`,
    });
  }

  // Sempre a mesma resposta, para não revelar quais e-mails têm conta.
  redirect("/esqueci-senha?enviado=1");
}
