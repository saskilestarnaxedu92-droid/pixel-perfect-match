import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, primaryBtn, ghostBtn } from "@/components/AppShell";
import { PLANS, paypalCheckoutUrl, type PlanId } from "@/lib/plans";
import { eur } from "@/lib/invoice-status";

export const Route = createFileRoute("/_authenticated/offres")({
  head: () => ({
    meta: [
      { title: "Offres — PayRelance" },
      { name: "description", content: "Choisissez votre offre PayRelance." },
      { property: "og:title", content: "Offres — PayRelance" },
      { property: "og:description", content: "Les offres PayRelance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlansPage,
});

function PlansPage() {
  const { user } = Route.useRouteContext();
  const { data: plan = "starter" } = useQuery({
    queryKey: ["profile-plan", user.id],
    queryFn: async () => (await supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle()).data?.plan ?? "starter",
  });

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Offres</h1>
      <p className="mt-1 text-sm text-muted-foreground">Passez à une offre supérieure pour gérer plus de factures.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const current = plan === p.id;
          const payUrl = p.id === "starter" ? null : paypalCheckoutUrl(p.id);
          return (
            <div key={p.id} className={`rounded-2xl border bg-card p-6 ${current ? "ring-2 ring-primary" : ""}`}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">{p.name}</h2>
                {current && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Votre offre</span>}
              </div>
              <p className="mt-2 font-display text-3xl font-bold">
                {p.price === 0 ? "Gratuit" : eur(p.price)}
                {p.price > 0 && <span className="text-sm font-normal text-muted-foreground"> / mois</span>}
              </p>
              <p className="mt-1 text-sm font-medium text-primary">{p.invoices}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-primary">✓</span>{f}</li>
                ))}
              </ul>
              <div className="mt-6">
                {p.id === "starter" ? (
                  current ? <span className="text-sm text-muted-foreground">Offre actuelle</span> : null
                ) : payUrl ? (
                  <a href={payUrl} target="_blank" rel="noopener noreferrer" className={`${primaryBtn} w-full`}>
                    Payer avec PayPal
                  </a>
                ) : (
                  <button disabled className={`${ghostBtn} w-full`} title="Le lien de paiement sera activé prochainement">
                    Paiement bientôt disponible
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
        Après votre paiement PayPal, votre compte est passé à l'offre choisie sous 24 h. Une question ? Contactez-nous depuis la page d'accueil.
      </p>
    </AppShell>
  );
}
