import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, fieldClass, ghostBtn, primaryBtn } from "@/components/AppShell";
import { eur, frDate, invoiceStatus, statusLabel, PLAN_LIMITS, type InvoiceStatus } from "@/lib/invoice-status";
import { InvoiceReminders } from "@/components/InvoiceReminders";

export const Route = createFileRoute("/_authenticated/factures")({
  head: () => ({
    meta: [
      { title: "Factures — PayRelance" },
      { name: "description", content: "Suivez et gérez vos factures." },
      { property: "og:title", content: "Factures — PayRelance" },
      { property: "og:description", content: "Vos factures PayRelance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InvoicesPage,
});

const schema = z.object({
  client_id: z.string().uuid("Choisissez un client"),
  number: z.string().trim().min(1, "Numéro requis").max(50),
  amount: z.coerce.number().positive("Montant invalide").max(10_000_000),
  issue_date: z.string().min(1),
  due_date: z.string().min(1, "Échéance requise"),
  notes: z.string().trim().max(500),
});

const badge: Record<InvoiceStatus, string> = {
  paid: "bg-primary/10 text-primary",
  pending: "bg-secondary text-foreground",
  overdue: "bg-destructive/10 text-destructive",
};

const today = () => new Date().toISOString().slice(0, 10);

function InvoicesPage() {
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | InvoiceStatus>("all");
  const empty = { client_id: "", number: "", amount: "", issue_date: today(), due_date: "", notes: "" };
  const [form, setForm] = useState(empty);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-min"],
    queryFn: async () => (await supabase.from("clients").select("id, name").order("name")).data ?? [],
  });
  const { data: plan } = useQuery({
    queryKey: ["profile-plan", user.id],
    queryFn: async () => (await supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle()).data?.plan ?? "starter",
  });
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices", "with-reminder-recipient"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*, clients(name, email)").order("due_date");
      if (error) throw error;
      return data;
    },
  });

  const limit = PLAN_LIMITS[plan ?? "starter"] ?? null;
  const atLimit = limit !== null && invoices.length >= limit;

  const add = useMutation({
    mutationFn: async (v: z.infer<typeof schema>) => {
      const { error } = await supabase.from("invoices").insert({ ...v, notes: v.notes || null });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Facture créée");
      setForm(empty);
      setOpen(false);
      qc.invalidateQueries();
    },
    onError: (e: Error) =>
      toast.error(e.message.includes("INVOICE_LIMIT") ? "Limite de factures atteinte pour votre offre." : "Impossible de créer la facture"),
  });

  const setPaid = useMutation({
    mutationFn: async ({ id, paid }: { id: string; paid: boolean }) => {
      const { error } = await supabase.from("invoices").update({ status: paid ? "paid" : "pending", paid_at: paid ? new Date().toISOString() : null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.paid ? "Facture marquée payée" : "Facture remise en attente");
      qc.invalidateQueries();
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Facture supprimée"); qc.invalidateQueries(); },
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) { toast.error(r.error.issues[0]?.message ?? "Formulaire invalide"); return; }
    if (r.data.due_date < r.data.issue_date) { toast.error("L'échéance doit suivre la date d'émission"); return; }
    add.mutate(r.data);
  }

  const rows = invoices.filter((i) => filter === "all" || invoiceStatus(i) === filter);

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Factures</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {invoices.length}{limit !== null ? ` / ${limit}` : ""} facture(s) · offre {plan === "pro" ? "Pro" : plan === "business" ? "Business" : "Starter"}
          </p>
        </div>
        <button onClick={() => setOpen(!open)} disabled={atLimit && !open} className={primaryBtn}>
          {open ? "Fermer" : "+ Nouvelle facture"}
        </button>
      </div>

      {atLimit && (
        <p className="mt-4 rounded-xl bg-primary/10 p-4 text-sm">Vous avez atteint la limite de {limit} factures de votre offre. <Link to="/" hash="tarifs" className="font-semibold text-primary">Voir les offres</Link></p>
      )}

      {open && (
        clients.length === 0 ? (
          <div className="mt-6 rounded-2xl border bg-card p-6 text-sm">Ajoutez d'abord un client. <Link to="/clients" className="font-semibold text-primary">Aller aux clients</Link></div>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-3 rounded-2xl border bg-card p-6 sm:grid-cols-2">
            <select className={fieldClass} value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
              <option value="">Client *</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className={fieldClass} placeholder="N° de facture *" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
            <input className={fieldClass} type="number" step="0.01" min="0" placeholder="Montant TTC (€) *" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <label className="text-xs text-muted-foreground">Date d'émission
              <input className={`${fieldClass} mt-1`} type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
            </label>
            <label className="text-xs text-muted-foreground">Date d'échéance *
              <input className={`${fieldClass} mt-1`} type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </label>
            <input className={fieldClass} placeholder="Note (facultatif)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button disabled={add.isPending} className={`${primaryBtn} sm:col-span-2`}>Créer la facture</button>
          </form>
        )
      )}

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {(["all", "pending", "overdue", "paid"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${filter === f ? "bg-primary text-primary-foreground" : "border bg-card"}`}>
            {f === "all" ? "Toutes" : statusLabel[f]}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? <p className="text-muted-foreground">Chargement…</p> : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-muted-foreground">Aucune facture ici.</div>
        ) : rows.map((i) => {
          const s = invoiceStatus(i);
          return (
            <div key={i.id} className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{i.number} · {i.clients?.name}</p>
                <p className="text-sm text-muted-foreground">Échéance le {frDate(i.due_date)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-lg font-bold">{eur(Number(i.amount))}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge[s]}`}>{statusLabel[s]}</span>
                <button className={ghostBtn} onClick={() => setPaid.mutate({ id: i.id, paid: s !== "paid" })}>
                  {s === "paid" ? "Annuler paiement" : "Marquer payée"}
                </button>
                <button className={ghostBtn} onClick={() => { if (confirm("Supprimer cette facture ?")) remove.mutate(i.id); }}>Supprimer</button>
              </div>
              </div>
              <InvoiceReminders invoice={{ number: i.number, amount: Number(i.amount), due_date: i.due_date, status: i.status }} clientName={i.clients?.name ?? ""} recipient={i.clients?.email ?? null} />
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
