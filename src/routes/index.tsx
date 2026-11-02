import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PayRelance — Relances automatiques de factures impayées" },
      { name: "description", content: "Automatisez les relances de vos factures impayées et soyez payé plus vite. Pour freelances, artisans et PME." },
      { property: "og:title", content: "PayRelance — Soyez payé plus vite" },
      { property: "og:description", content: "Relances automatiques, suivi des factures et tableau de bord clair." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const eur = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const btn = "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition";
const btnPrimary = `${btn} bg-primary text-primary-foreground shadow-glow hover:opacity-90`;
const btnGhost = `${btn} border bg-card text-foreground hover:bg-secondary`;

const features = [
  ["Relances automatiques", "Des rappels envoyés au bon moment : avant, le jour et après l'échéance."],
  ["Suivi en temps réel", "Visualisez ce qui est payé, en attente ou en retard en un coup d'œil."],
  ["Modèles personnalisables", "Des emails courtois et professionnels, à votre image."],
  ["Gestion des clients", "Historique des factures et des relances pour chaque client."],
  ["Import PDF", "Joignez vos factures existantes en quelques secondes."],
  ["Sécurisé", "Vos données sont isolées et protégées, accessibles à vous seul."],
];

const plans = [
  { name: "Starter", price: 0, desc: "Pour démarrer", items: ["Jusqu'à 5 factures", "Relances automatiques", "1 modèle d'email"] },
  { name: "Pro", price: 19, desc: "Pour les indépendants actifs", items: ["Jusqu'à 100 factures", "Tous les modèles", "Historique complet", "Support prioritaire"], highlight: true },
  { name: "Business", price: 49, desc: "Pour les équipes", items: ["Factures illimitées", "Automatisations avancées", "Logo et personnalisation", "Support dédié"] },
];

const faqs = [
  ["Mes clients savent-ils que la relance est automatique ?", "Non. Les emails partent en votre nom, avec votre ton et vos coordonnées."],
  ["Puis-je arrêter une relance ?", "Oui, à tout moment. Une facture marquée payée stoppe immédiatement les relances."],
  ["Puis-je changer d'offre ?", "Oui, vous pouvez passer à une offre supérieure ou annuler à tout moment."],
  ["Mes données sont-elles protégées ?", "Chaque compte n'accède qu'à ses propres données, et rien n'est partagé."],
];

function Index() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">P</span>
            PayRelance
          </a>
          <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
            <a href="#fonctionnalites" className="hover:text-foreground">Fonctionnalités</a>
            <a href="#tarifs" className="hover:text-foreground">Tarifs</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-4"><Link to="/auth" className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground">Connexion</Link>
          <Link to="/auth" search={{ mode: "signup" }} className={`${btnPrimary} px-4 py-2`}>Essayer gratuitement</Link></div>
        </div>
      </header>

      <section className="bg-hero">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 text-center md:pt-24">
          <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-accent-foreground">Fini les relances manuelles</span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Soyez payé plus vite, <span className="text-primary">sans courir après vos clients.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
            PayRelance suit vos factures et relance automatiquement vos clients, avec courtoisie et au bon moment.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/auth" search={{ mode: "signup" }} className={btnPrimary}>Essayer gratuitement</Link>
            <a href="#etapes" className={btnGhost}>Comment ça marche</a>
          </div>

          <div className="mx-auto mt-14 max-w-4xl rounded-3xl border bg-card p-5 text-left shadow-card md:p-8">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[["Impayé", 12480, "text-foreground"], ["En retard", 3920, "text-destructive"], ["Payé ce mois", 18650, "text-success"], ["À relancer", 7, "text-warning"]].map(([l, v, c]) => (
                <div key={l as string} className="rounded-2xl bg-secondary p-4">
                  <p className="text-xs text-muted-foreground">{l}</p>
                  <p className={`mt-1 font-display text-xl font-bold ${c}`}>{typeof v === "number" && l !== "À relancer" ? eur(v) : v}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex h-32 items-end gap-2">
              {[40, 65, 50, 80, 60, 90, 75, 95, 70, 85, 100, 88].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-md bg-primary/80" style={{ height: `${h}%` }} />
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Aperçu d'illustration</p>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Tout pour encaisser sereinement</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([t, d]) => (
            <div key={t} className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="h-10 w-10 rounded-xl bg-primary-soft" />
              <h3 className="mt-4 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="etapes" className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-center text-3xl font-bold md:text-4xl">3 étapes, et c'est réglé</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[["Ajoutez vos factures", "Saisissez-les ou importez le PDF."], ["Choisissez vos relances", "J-3, jour J, J+3, J+7, J+15."], ["Encaissez", "Les relances s'arrêtent dès le paiement."]].map(([t, d], i) => (
              <div key={t}>
                <span className="font-display text-5xl font-bold text-primary">0{i + 1}</span>
                <h3 className="mt-3 text-xl font-semibold">{t}</h3>
                <p className="mt-2 text-sm opacity-70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tarifs" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Des tarifs simples</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-3xl border p-7 ${p.highlight ? "border-primary bg-card shadow-glow" : "bg-card shadow-card"}`}>
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
              <p className="mt-5 font-display text-4xl font-bold">{eur(p.price)}<span className="text-base font-normal text-muted-foreground"> /mois</span></p>
              <ul className="mt-6 space-y-2 text-sm">
                {p.items.map((i) => <li key={i} className="flex gap-2"><span className="text-primary">✓</span>{i}</li>)}
              </ul>
              <Link to="/auth" search={{ mode: "signup" }} className={`mt-7 w-full ${p.highlight ? btnPrimary : btnGhost}`}>Essayer gratuitement</Link>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-5 pb-20">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Questions fréquentes</h2>
        <div className="mt-10 divide-y rounded-2xl border bg-card">
          {faqs.map(([q, a], i) => (
            <button key={q} onClick={() => setOpen(open === i ? null : i)} className="block w-full p-5 text-left">
              <span className="flex justify-between gap-4 font-medium">{q}<span className="text-primary">{open === i ? "−" : "+"}</span></span>
              {open === i && <p className="mt-2 text-sm text-muted-foreground">{a}</p>}
            </button>
          ))}
        </div>
      </section>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-muted-foreground md:flex-row md:justify-between">
          <p className="font-display font-bold text-foreground">PayRelance</p>
          <div className="flex gap-6"><a href="#fonctionnalites">Fonctionnalités</a><a href="#tarifs">Tarifs</a><a href="#faq">FAQ</a></div>
          <p>© {new Date().getFullYear()} PayRelance. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
