import { describe, it, expect } from "vitest";
import { PLANS, paypalCheckoutUrl, PAYPAL_ME_LINK } from "@/lib/plans";

describe("plans PayRelance", () => {
  it("Pro coûte 19 €/mois et Business 49 €/mois", () => {
    expect(PLANS.find((p) => p.id === "pro")?.price).toBe(19);
    expect(PLANS.find((p) => p.id === "business")?.price).toBe(49);
    expect(PLANS.find((p) => p.id === "starter")?.price).toBe(0);
  });

  it("le lien PayPal du vendeur est configuré", () => {
    expect(PAYPAL_ME_LINK).toBe("https://paypal.me/DoucoureMohamed696");
  });

  it("le bouton Pro renvoie vers PayPal avec 19 EUR pré-rempli", () => {
    expect(paypalCheckoutUrl("pro")).toBe("https://paypal.me/DoucoureMohamed696/19EUR");
  });

  it("le bouton Business renvoie vers PayPal avec 49 EUR pré-rempli", () => {
    expect(paypalCheckoutUrl("business")).toBe("https://paypal.me/DoucoureMohamed696/49EUR");
  });
});
