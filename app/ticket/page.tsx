import { TicketGenerator } from "@/components/tickets/ticket-generator";

export const metadata = {
  title: "Generador de Tickets | BetAnalyzer",
  description: "Genera apuestas combinadas automáticas de los partidos del día filtrando por % de Confianza y % de Probabilidad.",
};

export default function TicketPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
      <TicketGenerator />
    </div>
  );
}
