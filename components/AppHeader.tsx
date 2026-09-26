"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { sair } from "@/app/actions";
import type { Profile } from "@/lib/types";
import { OkeiIcon } from "./OkeiMark";

export default function AppHeader({
  profiles,
  currentUserId,
  souAprovador,
}: {
  profiles: Profile[];
  currentUserId: string;
  souAprovador: boolean;
}) {
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const currentUser = profiles.find((p) => p.id === currentUserId);

  const abas = [
    ...(souAprovador ? [{ href: "/", label: "Demandas" }] : []),
    { href: "/solicitacoes", label: "Solicitações" },
  ];

  return (
    <header
      className="sticky top-0 z-20 backdrop-blur-lg"
      style={{ background: "rgba(12,11,11,.84)", borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-center gap-4.5 px-5 py-3.5 sm:px-7">
        <OkeiIcon size={32} />
        <div className="h-6.5 w-px" style={{ background: "var(--border-medium)" }} />
        <div className="flex flex-col gap-0.5">
          <span
            className="text-lg leading-none font-black text-white"
            style={{ fontFamily: "var(--font-brand)", letterSpacing: "-0.05em" }}
          >
            OkEI
          </span>
          <span className="text-[11.5px]" style={{ color: "var(--text-tertiary)" }}>
            Gestão de Demandas · Ei Pizza Delivery
          </span>
        </div>

        <nav className="ml-2 flex gap-1">
          {abas.map((aba) => {
            const ativo = pathname === aba.href;
            return (
              <Link
                key={aba.href}
                href={aba.href}
                className="rounded-lg px-3.5 py-2 text-[12.5px] font-bold transition-colors"
                style={{
                  background: ativo ? "var(--accent)" : "transparent",
                  color: ativo ? "#ffffff" : "var(--text-secondary)",
                }}
              >
                {aba.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center gap-2.5 rounded-full py-1.5 pr-3.5 pl-1.5"
            style={{ border: "1px solid var(--border-medium)", background: "rgba(255,255,255,.03)" }}
          >
            <div
              className="grid h-6.5 w-6.5 place-items-center rounded-full text-[11px] font-extrabold text-white"
              style={{ background: "var(--accent)" }}
            >
              {(currentUser?.nome ?? "?").slice(0, 1).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-white">{currentUser?.nome ?? "usuário"}</span>
          </div>
          <button
            onClick={() => startTransition(async () => await sair())}
            className="cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white hover:text-black"
            style={{ border: "1px solid var(--border-medium)" }}
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
