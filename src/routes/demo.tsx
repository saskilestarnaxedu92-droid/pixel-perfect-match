import { createFileRoute, Link } from "@tanstack/react-router";
import { InvoiceReminders } from "@/components/InvoiceReminders";
import { eur, frDate } from "@/lib/invoice-status";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Démo PayRelance — Facture fictive et 5 relances" },
      { name: "description", content: "Découvrez PayRelance avec une facture fictive en retard et ses 5 relances automatiques." },
      { property: "og:title", content: "Démo PayRelance" },
      { property: "og:description", content: "Une facture fictive et ses 5 étapes de relance automatiques." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Demo,
});

// Fictional data only — nothing is saved and no email is ever sent.
const DEMO_INVOICE = { number: "FAC-2026-042", amount: 1450, due_date: "2026-10-15", status: "pending" };
const DEMO_CLIENT = { name: "Agence Dupont", email: "contact@agence-dupont.fr" };

function Demo() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">P</span>
            PayRelance
          </Link>
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-accent-foreground">Mode démo</span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-5 py-8">
        <h1 className="text-3xl font-bold">Factures</h1>
        <p className="mt-1 text-sm text-muted-foreground">Exemple fictif · aucun email n'est envoyé</p>
        <article className="mt-6 rounded-2xl border bg-card p-5 shadow-card">
          <p className="font-semibold">{DEMO_INVOICE.number} · {DEMO_CLIENT.name}</p>
          <p className="text-sm text-muted-foreground">Échéance le {frDate(DEMO_INVOICE.due_date)}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="font-display text-xl font-bold">{eur(DEMO_INVOICE.amount)}</span>
            <span className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">En retard</span>
          </div>
          <InvoiceReminders invoice={DEMO_INVOICE} clientName={DEMO_CLIENT.name} recipient={DEMO_CLIENT.email} defaultOpen demo />
        </article>
        <Link to="/auth" search={{ mode: "signup" }} className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
          Essayer gratuitement
        </Link>
      </main>
    </div>
  );
}
