import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — PayRelance" },
      { name: "description", content: "Choisissez un nouveau mot de passe pour votre compte PayRelance." },
      { property: "og:title", content: "Nouveau mot de passe — PayRelance" },
      { property: "og:description", content: "Réinitialisez votre mot de passe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("8 caractères minimum"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error("Le lien a expiré. Refaites une demande."); return; }
    toast.success("Mot de passe mis à jour");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-3xl border bg-card p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold">Nouveau mot de passe</h1>
        <input type="password" autoComplete="new-password" placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        <button disabled={loading} className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {loading ? "Patientez…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
