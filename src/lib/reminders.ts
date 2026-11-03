import { addDays, format, parseISO, isValid } from "date-fns";
import { eur, frDate } from "./invoice-status";

export const REMINDER_STAGES = [
  { offset: -3, label: "J−3" },
  { offset: 0, label: "Jour J" },
  { offset: 3, label: "J+3" },
  { offset: 7, label: "J+7" },
  { offset: 15, label: "J+15" },
] as const;

export type ReminderOffset = (typeof REMINDER_STAGES)[number]["offset"];

export function reminderDates(dueDate: string) {
  const date = parseISO(dueDate);
  if (!isValid(date)) return [];
  return REMINDER_STAGES.map((stage) => ({ ...stage, date: format(addDays(date, stage.offset), "yyyy-MM-dd") }));
}

/** Only the latest stage due is eligible; paid invoices have no next reminder. */
export function latestReminderDue(invoice: { status: string; due_date: string }, today: string) {
  if (invoice.status === "paid") return null;
  return reminderDates(invoice.due_date).filter((stage) => stage.date <= today).at(-1) ?? null;
}

export function reminderMessage(invoice: { number: string; amount: number; due_date: string; clientName: string }, offset: ReminderOffset) {
  const reference = `la facture ${invoice.number}, d’un montant de ${eur(invoice.amount)}`;
  const date = frDate(invoice.due_date);
  const content: Record<ReminderOffset, string> = {
    [-3]: `Nous vous rappelons que ${reference} arrive à échéance le ${date}. Nous vous remercions par avance de bien vouloir prévoir son règlement.`,
    [0]: `Nous vous rappelons que ${reference} arrive à échéance aujourd’hui, le ${date}. Nous vous remercions de bien vouloir procéder à son règlement.`,
    [3]: `Sauf erreur de notre part, le règlement de ${reference}, échue le ${date}, ne nous est pas encore parvenu. Pourriez-vous nous confirmer la date prévue de paiement ?`,
    [7]: `Nous revenons vers vous concernant ${reference}, échue le ${date}, dont le règlement reste en attente. Nous vous remercions de bien vouloir procéder au paiement ou nous informer d’une éventuelle difficulté.`,
    [15]: `Le règlement de ${reference}, échue le ${date}, reste en attente. Merci de régulariser la situation dans les meilleurs délais et de nous confirmer la date de paiement. Nous restons disponibles pour échanger avec vous.`,
  };
  return {
    subject: `${offset <= 0 ? "Rappel" : "Relance"} — Facture ${invoice.number}`,
    body: `Bonjour ${invoice.clientName},\n\n${content[offset]}\n\nSi vous avez déjà effectué le règlement, veuillez ne pas tenir compte de ce message.\n\nNous vous remercions pour votre attention.\n\nCordialement`,
  };
}