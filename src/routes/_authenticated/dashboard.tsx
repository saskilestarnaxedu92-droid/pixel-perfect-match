import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, primaryBtn } from "@/components/AppShell";
import { eur, frDate, invoiceStatus, statusLabel } from "@/lib/invoice-status";

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
  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data,
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*, clients(name)").order("due_date");
      if (error) throw error;
      return data;
    },
  });

  const sum = (s: string) => invoices.filter((i) => invoiceStatus(i) === s).reduce((a, i) => a + Number(i.amount), 0);
  const count = (s: string) => invoices.filter((i) => invoiceStatus(i) === s).length;
  const stats = [
    { t: "En attente", v: eur(sum("pending")), n: count("pending") },
    { t: "En retard", v: eur(sum("overdue")), n: count("overdue") },
    { t: "Encaissé", v: eur(sum("paid")), n: count("paid") },
  ];
  const upcoming = invoices.filter((i) => i.status !== "paid").slice(0, 5);

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Bonjour {profile?.full_name || user.email} 👋</h1>
      <p className="mt-2 text-muted-foreground">
        Offre actuelle : <span className="font-semibold text-primary">{planLabel[profile?.plan ?? "starter"]}</span>
        {profile?.company_name ? ` · ${profile.company_name}` : ""}
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.t} className="rounded-2xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">{s.t}</p>
            <p className="mt-2 font-display text-2xl font-bold">{s.v}</p>
            <p className="text-xs text-muted-foreground">{s.n} facture(s)</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">À encaisser</h2>
          <Link to="/factures" className="text-sm font-semibold text-primary">Tout voir</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>Aucune facture en attente.</p>
            <Link to="/factures" className={`${primaryBtn} mt-4`}>Créer une facture</Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y">
            {upcoming.map((i) => {
              const s = invoiceStatus(i);
              return (
                <li key={i.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span><span className="font-semibold">{i.clients?.name}</span> · {i.number}</span>
                  <span className="text-right">
                    {eur(Number(i.amount))}
                    <span className={`ml-2 text-xs ${s === "overdue" ? "text-destructive" : "text-muted-foreground"}`}>{statusLabel[s]} · {frDate(i.due_date)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
