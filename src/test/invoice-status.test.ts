import { describe, it, expect } from "vitest";
import { invoiceStatus, PLAN_LIMITS } from "@/lib/invoice-status";

const today = new Date("2026-11-02T12:00:00Z");

describe("invoiceStatus", () => {
  it("is overdue when unpaid past due date", () => {
    expect(invoiceStatus({ status: "pending", due_date: "2026-11-01" }, today)).toBe("overdue");
  });
  it("is pending on the due date", () => {
    expect(invoiceStatus({ status: "pending", due_date: "2026-11-02" }, today)).toBe("pending");
  });
  it("paid stays paid even if late", () => {
    expect(invoiceStatus({ status: "paid", due_date: "2026-10-01" }, today)).toBe("paid");
  });
});

describe("plan limits", () => {
  it("Starter 5, Pro 100, Business unlimited", () => {
    expect(PLAN_LIMITS["starter"]).toBe(5);
    expect(PLAN_LIMITS["pro"]).toBe(100);
    expect(PLAN_LIMITS["business"]).toBeNull();
  });
});
