import Link from "next/link";
import { SavedAnalysis } from "@/types";
import { getTeamById } from "@/data/teams";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ClipboardList } from "lucide-react";
import { formatDateShort, formatOdds } from "@/utils/formatters";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<SavedAnalysis["status"], string> = {
  ganada: "border-brand-green/25 bg-brand-green/10 text-brand-green-bright",
  perdida: "border-brand-red/25 bg-brand-red/10 text-brand-red",
  pendiente: "border-brand-blue/25 bg-brand-blue/10 text-brand-blue",
  anulada: "border-border bg-muted text-muted-foreground",
};

const STATUS_LABEL: Record<SavedAnalysis["status"], string> = {
  ganada: "Ganada",
  perdida: "Perdida",
  pendiente: "Pendiente",
  anulada: "Anulada",
};

export function RecentAnalysesTable({ items }: { items: SavedAnalysis[] }) {
  return (
    <section className="space-y-4">
      <SectionHeader title="Últimos análisis" description="Seguimiento de tus análisis más recientes" href="/historial" />
      {items.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Todavía no generaste análisis" description="Analiza tu primer partido desde el asistente." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partido</TableHead>
                <TableHead>Mercado recomendado</TableHead>
                <TableHead>Confianza</TableHead>
                <TableHead>Cuota</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const home = getTeamById(item.homeTeamId);
                const away = getTeamById(item.awayTeamId);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {home?.shortName} vs {away?.shortName}
                    </TableCell>
                    <TableCell className="max-w-40 truncate text-muted-foreground">{item.recommendedMarket}</TableCell>
                    <TableCell className="tabular-nums">{item.confidence}%</TableCell>
                    <TableCell className="tabular-nums">{formatOdds(item.odds)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]", STATUS_STYLE[item.status])}>
                        {STATUS_LABEL[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateShort(item.date)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/analisis/${item.analysisId}`}>Ver</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
