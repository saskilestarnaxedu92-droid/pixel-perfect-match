export type InvoiceStatus = "paid" | "pending" | "overdue";

/** Statut affiché : "en retard" si non payée et échéance dépassée. */
export function invoiceStatus(inv: { status: string; due_date: string }, today = new Date()): InvoiceStatus {
  if (inv.status === "paid") return "paid";
  const t = today.toISOString().slice(0, 10);
  return inv.due_date < t ? "overdue" : "pending";
}

export const statusLabel: Record<InvoiceStatus, string> = { paid: "Payée", pending: "En attente", overdue: "En retard" };

export const PLAN_LIMITS: Record<string, number | null> = { starter: 5, pro: 100, business: null };

export const eur = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
export const frDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("fr-FR");
