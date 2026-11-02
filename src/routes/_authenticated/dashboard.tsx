import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — PayRelance" },
      { name: "description", content: "Suivez vos factures et relances." },
      { property: "og:title", content: "Tableau de bord — PayRelance" },
      { property: "og:description", content: "Votre espace PayRelance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const planLabel: Record<string, string> = { starter: "Starter", pro: "Pro", business: "Business" };

function Dashboard() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const name = profile?.full_name || user.email;

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">P</span>
            PayRelance
          </Link>
          <button onClick={signOut} className="rounded-full border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
            Déconnexion
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-3xl font-bold">Bonjour {name} 👋</h1>
        <p className="mt-2 text-muted-foreground">
          Offre actuelle : <span className="font-semibold text-primary">{planLabel[profile?.plan ?? "starter"]}</span>
          {profile?.company_name ? ` · ${profile.company_name}` : ""}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {["Factures en attente", "Factures en retard", "Montant encaissé"].map((t) => (
            <div key={t} className="rounded-2xl border bg-card p-6">
              <p className="text-sm text-muted-foreground">{t}</p>
              <p className="mt-2 font-display text-2xl font-bold">—</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-dashed bg-card p-8 text-center text-muted-foreground">
          Vos clients et factures apparaîtront ici très bientôt.
        </div>
      </main>
    </div>
  );
}
