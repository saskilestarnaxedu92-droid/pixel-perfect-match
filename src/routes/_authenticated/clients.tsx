import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, fieldClass, ghostBtn, primaryBtn } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/clients")({
  head: () => ({
    meta: [
      { title: "Clients — PayRelance" },
      { name: "description", content: "Gérez vos clients." },
      { property: "og:title", content: "Clients — PayRelance" },
      { property: "og:description", content: "Vos clients PayRelance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClientsPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(120),
  email: z.string().trim().email("Email invalide").max(255),
  company: z.string().trim().max(120),
  phone: z.string().trim().max(30),
});

function ClientsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "" });
  const [open, setOpen] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*, invoices(count)").order("name");
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async (v: z.infer<typeof schema>) => {
      const { error } = await supabase.from("clients").insert({ name: v.name, email: v.email, company: v.company || null, phone: v.phone || null });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Client ajouté");
      setForm({ name: "", email: "", company: "", phone: "" });
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: () => toast.error("Impossible d'ajouter le client"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Client supprimé");
      qc.invalidateQueries();
    },
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      toast.error(r.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    add.mutate(r.data);
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Clients</h1>
        <button onClick={() => setOpen(!open)} className={primaryBtn}>{open ? "Fermer" : "+ Nouveau client"}</button>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-6 grid gap-3 rounded-2xl border bg-card p-6 sm:grid-cols-2">
          <input className={fieldClass} placeholder="Nom *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={fieldClass} type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className={fieldClass} placeholder="Entreprise" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <input className={fieldClass} placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <button disabled={add.isPending} className={`${primaryBtn} sm:col-span-2`}>Enregistrer le client</button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="text-muted-foreground">Chargement…</p>
        ) : clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-muted-foreground">Aucun client pour l'instant. Ajoutez votre premier client.</div>
        ) : (
          clients.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-5">
              <div>
                <p className="font-semibold">{c.name}{c.company ? <span className="font-normal text-muted-foreground"> · {c.company}</span> : null}</p>
                <p className="text-sm text-muted-foreground">{c.email}{c.phone ? ` · ${c.phone}` : ""}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{c.invoices?.[0]?.count ?? 0} facture(s)</span>
                <button
                  className={ghostBtn}
                  onClick={() => { if (confirm(`Supprimer ${c.name} et ses factures ?`)) remove.mutate(c.id); }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
