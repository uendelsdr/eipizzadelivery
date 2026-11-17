import ConfigMissing from "@/components/ConfigMissing";
import OkeiLogo from "@/components/OkeiMark";
import RedefinirSenhaForm from "@/components/RedefinirSenhaForm";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export default function RedefinirSenhaPage() {
  if (!hasSupabaseConfig()) return <ConfigMissing />;

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-2xl"
        style={{ border: "1px solid var(--border-subtle)", background: "#121212" }}
      >
        <div className="mb-7 flex flex-col items-center">
          <OkeiLogo iconSize={64} textSize="text-3xl" showTagline stacked />
          <p className="mt-3 text-sm" style={{ color: "var(--text-tertiary)" }}>
            Criar nova senha
          </p>
        </div>
        <RedefinirSenhaForm />
      </div>
    </div>
  );
}
