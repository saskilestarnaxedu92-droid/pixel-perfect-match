/** Lien PayPal.me du vendeur. */
export const PAYPAL_ME_LINK = "https://paypal.me/DoucoureMohamed696";

export type PlanId = "starter" | "pro" | "business";

export const PLANS: {
  id: PlanId;
  name: string;
  price: number;
  invoices: string;
  features: string[];
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    invoices: "5 factures",
    features: ["5 factures maximum", "Suivi des statuts", "Aperçu des relances"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    invoices: "100 factures",
    features: ["100 factures", "Relances automatiques J−3 à J+15", "Historique des relances"],
  },
  {
    id: "business",
    name: "Business",
    price: 49,
    invoices: "Factures illimitées",
    features: ["Factures illimitées", "Relances automatiques J−3 à J+15", "Automatisations avancées", "Support prioritaire"],
  },
];

/** Lien de paiement PayPal pour un forfait payant, ou null si le lien n'est pas encore configuré. */
export function paypalCheckoutUrl(plan: Exclude<PlanId, "starter">): string | null {
  if (!PAYPAL_ME_LINK) return null;
  const amount = PLANS.find((p) => p.id === plan)?.price ?? 0;
  return `${PAYPAL_ME_LINK}/${amount}EUR`;
}
