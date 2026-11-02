import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode | undefined } => ({
    mode: s["mode"] === "signup" || s["mode"] === "forgot" ? (s["mode"] as Mode) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Connexion — PayRelance" },
      { name: "description", content: "Connectez-vous ou créez votre compte PayRelance gratuitement." },
      { property: "og:title", content: "Connexion — PayRelance" },
      { property: "og:description", content: "Accédez à votre espace PayRelance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Adresse email invalide").max(255);
const passwordSchema = z.string().min(8, "8 caractères minimum").max(72);

const input = "w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";
const btnPrimary = "inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60";

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => setMode(search.mode ?? "signin"), [search.mode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/dashboard", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    const em = emailSchema.safeParse(email);
    if (!em.success) { toast.error(em.error.issues[0]?.message ?? "Email invalide"); return; }
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(em.data, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent("Si un compte existe, un lien de réinitialisation vient de vous être envoyé.");
        return;
      }
      const pw = passwordSchema.safeParse(password);
      if (!pw.success) { toast.error(pw.error.issues[0]?.message ?? "Mot de passe invalide"); return; }
      if (mode === "signup") {
        const name = fullName.trim().slice(0, 100);
        if (!name) { toast.error("Indiquez votre nom"); return; }
        const { error } = await supabase.auth.signUp({
          email: em.data,
          password: pw.data,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: { full_name: name, company_name: company.trim().slice(0, 120) || null },
          },
        });
        if (error) throw error;
        setSent("Compte créé ! Cliquez sur le lien reçu par email pour confirmer votre adresse.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: em.data, password: pw.data });
        if (error) throw new Error("Email ou mot de passe incorrect");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  async function oauth(provider: "google" | "lovable") {
    const res = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" });
    if (res.error) toast.error("Connexion impossible, réessayez.");
  }

  const title = mode === "signup" ? "Créer votre compte" : mode === "forgot" ? "Mot de passe oublié" : "Bon retour !";

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-display text-xl font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">P</span>
          PayRelance
        </Link>
        <div className="rounded-3xl border bg-card p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          {sent ? (
            <p className="mt-4 rounded-xl bg-primary/10 p-4 text-sm text-foreground">{sent}</p>
          ) : (
            <>
              {mode !== "forgot" && (
                <div className="mt-6 space-y-3">
                  <button type="button" onClick={() => oauth("google")} className="inline-flex w-full items-center justify-center gap-2 rounded-full border bg-background px-6 py-3 text-sm font-semibold hover:bg-secondary">
                    Continuer avec Google
                  </button>
                  <button type="button" onClick={() => oauth("lovable")} className="lovable-auth-button w-full">
                    Continue with Lovable
                  </button>
                  <div className="flex items-center gap-3 py-2 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />ou<span className="h-px flex-1 bg-border" />
                  </div>
                </div>
              )}
              <form onSubmit={onSubmit} className={`space-y-3 ${mode === "forgot" ? "mt-6" : ""}`}>
                {mode === "signup" && (
                  <>
                    <input className={input} placeholder="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
                    <input className={input} placeholder="Entreprise (facultatif)" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={120} />
                  </>
                )}
                <input className={input} type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {mode !== "forgot" && (
                  <input className={input} type="password" placeholder="Mot de passe" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                )}
                {mode === "signin" && (
                  <button type="button" onClick={() => setMode("forgot")} className="text-xs font-medium text-primary hover:underline">
                    Mot de passe oublié ?
                  </button>
                )}
                <button disabled={loading} className={btnPrimary}>
                  {loading ? "Patientez…" : mode === "signup" ? "Créer mon compte" : mode === "forgot" ? "Envoyer le lien" : "Se connecter"}
                </button>
              </form>
            </>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>Déjà un compte ? <button onClick={() => { setSent(null); setMode("signin"); }} className="font-semibold text-primary">Se connecter</button></>
            ) : (
              <>Pas encore de compte ? <button onClick={() => { setSent(null); setMode("signup"); }} className="font-semibold text-primary">Créer un compte</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
