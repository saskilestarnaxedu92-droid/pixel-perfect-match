import { describe, expect, it } from "vitest";
import { latestReminderDue, reminderDates } from "@/lib/reminders";

describe("Reminder schedule", () => {
  const stages = reminderDates("2026-11-10");
  it("schedules J-3 three days before the due date", () => {
    expect(stages.find((s) => s.offset === -3)?.date).toBe("2026-11-07");
  });
  it("schedules Jour J on the due date", () => {
    expect(stages.find((s) => s.offset === 0)?.date).toBe("2026-11-10");
  });
  it("schedules J+3 three days after the due date", () => {
    expect(stages.find((s) => s.offset === 3)?.date).toBe("2026-11-13");
  });
  it("schedules J+7 seven days after the due date", () => {
    expect(stages.find((s) => s.offset === 7)?.date).toBe("2026-11-17");
  });
  it("schedules J+15 fifteen days after the due date", () => {
    expect(stages.find((s) => s.offset === 15)?.date).toBe("2026-11-25");
  });
  it("stops eligibility for paid invoices", () => {
    expect(latestReminderDue({ status: "paid", due_date: "2026-11-10" }, "2026-11-25")).toBeNull();
  });
  it("does not choose a reminder before J-3", () => {
    expect(latestReminderDue({ status: "pending", due_date: "2026-11-10" }, "2026-11-06")).toBeNull();
  });
  it("chooses only the latest due stage after a missed day", () => {
    expect(latestReminderDue({ status: "pending", due_date: "2026-11-10" }, "2026-11-20")?.offset).toBe(7);
  });
  it("handles a month and year boundary", () => {
    expect(reminderDates("2027-01-01")[0]?.date).toBe("2026-12-29");
  });
});