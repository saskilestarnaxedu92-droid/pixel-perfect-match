import { useState } from "react";
import { CalendarClock, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reminderDates, reminderMessage, type ReminderOffset } from "@/lib/reminders";
import { frDate } from "@/lib/invoice-status";

type Props = {
  invoice: { number: string; amount: number; due_date: string; status: string };
  clientName: string;
  recipient: string | null;
  defaultOpen?: boolean;
  demo?: boolean;
};

export function InvoiceReminders({ invoice, clientName, recipient, defaultOpen = false, demo = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [offset, setOffset] = useState<ReminderOffset>(-3);
  const message = reminderMessage({ ...invoice, clientName }, offset);
  const paid = invoice.status === "paid";

  return (
    <div className="mt-4 border-t pt-3">
      <Button variant="ghost" size="sm" onClick={() => setOpen(!open)} aria-expanded={open} className="max-w-full gap-2 text-muted-foreground">
        <CalendarClock aria-hidden="true" /> Relances {open ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
      </Button>
      {open && (
        <div className="mt-3 space-y-4">
          <p className={`text-sm ${paid ? "text-success" : "text-muted-foreground"}`}>
            {paid ? "Facture payée · aucune relance à envoyer." : demo ? "Relances automatiques programmées · 5 étapes" : "Envoi automatique non activé · aucun email envoyé."}
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={`Étapes de relance de ${invoice.number}`}>
            {reminderDates(invoice.due_date).map((stage) => (
              <Button key={stage.offset} variant={offset === stage.offset ? "default" : "outline"} className="h-auto min-w-20 flex-col gap-1 py-2" onClick={() => setOffset(stage.offset)} aria-pressed={offset === stage.offset}>
                <span>{stage.label}</span><span className="text-xs font-normal">{frDate(stage.date)}</span>
              </Button>
            ))}
          </div>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 font-semibold"><Mail className="size-4" aria-hidden="true" /> Aperçu du message</p>
            <p className="break-words text-muted-foreground">Destinataire : {recipient || "Adresse email manquante"}</p>
            <p className="break-words font-medium">Objet : {message.subject}</p>
            <p className="whitespace-pre-line break-words leading-relaxed text-muted-foreground">{message.body}</p>
          </div>
        </div>
      )}
    </div>
  );
}