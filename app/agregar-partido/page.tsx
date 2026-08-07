import { UploadCloud } from "lucide-react";
import { AddMatchWorkspace } from "@/components/import/add-match-workspace";

export const metadata = {
  title: "Agregar partido — BetAnalyzer",
};

export default function AgregarPartidoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <span className="flex size-10 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green-bright">
          <UploadCloud className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Agregar partido</h2>
          <p className="text-sm text-muted-foreground">
            Investiga un partido con otra IA, importa el JSON resultante y se integra al instante en partidos, dashboard, análisis e
            historial.
          </p>
        </div>
      </div>

      <AddMatchWorkspace />
    </div>
  );
}
