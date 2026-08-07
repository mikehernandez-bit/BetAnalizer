import { TeamMatchRecord } from "@/types";
import { getTeamById } from "@/data/teams";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/utils/formatters";
import { RESULT_LETTER_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

const RESULT_STYLE = {
  W: "bg-brand-green/10 text-brand-green-bright border-brand-green/30",
  D: "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30",
  L: "bg-brand-red/10 text-brand-red border-brand-red/30",
};

export function TeamHistoryTable({ records }: { records: TeamMatchRecord[] }) {
  const notes = records.filter((record) => record.note);

  return (
    <>
      <div className="scrollbar-thin hidden overflow-x-auto rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Rival</TableHead>
              <TableHead>Cond.</TableHead>
              <TableHead>Res.</TableHead>
              <TableHead className="text-center">GF</TableHead>
              <TableHead className="text-center">GC</TableHead>
              <TableHead className="text-center">CF</TableHead>
              <TableHead className="text-center">CC</TableHead>
              <TableHead className="text-center">Rem.</TableHead>
              <TableHead className="text-center">Rem. rec.</TableHead>
              <TableHead className="text-center">T.Arco</TableHead>
              <TableHead className="text-center">T.Arco rec.</TableHead>
              <TableHead className="text-center">TA</TableHead>
              <TableHead className="text-center">Pos.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => {
              const opponent = getTeamById(r.opponentId);
              return (
                <TableRow key={r.matchId}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateShort(r.date)}</TableCell>
                  <TableCell className="font-medium">{opponent?.shortName ?? r.opponentId}</TableCell>
                  <TableCell className="text-muted-foreground">{r.venue === "local" ? "L" : "V"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", RESULT_STYLE[r.result])}>
                      {RESULT_LETTER_LABEL[r.result]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{r.goalsFor}</TableCell>
                  <TableCell className="text-center tabular-nums">{r.goalsAgainst}</TableCell>
                  <TableCell className="text-center tabular-nums">{r.cornersFor}</TableCell>
                  <TableCell className="text-center tabular-nums">{r.cornersAgainst}</TableCell>
                  <TableCell className="text-center tabular-nums">{r.shotsFor}</TableCell>
                  <TableCell className="text-center tabular-nums">{r.shotsAgainst}</TableCell>
                  <TableCell className="text-center tabular-nums">{r.shotsOnTargetFor}</TableCell>
                  <TableCell className="text-center tabular-nums">{r.shotsOnTargetAgainst}</TableCell>
                  <TableCell className="text-center tabular-nums">{r.yellowCards}</TableCell>
                  <TableCell className="text-center tabular-nums">{r.possession}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2 md:hidden">
        {records.map((r) => {
          const opponent = getTeamById(r.opponentId);
          return (
            <div key={r.matchId} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {formatDateShort(r.date)} · {r.venue === "local" ? "Local" : "Visitante"}
                </span>
                <Badge variant="outline" className={cn("text-[10px]", RESULT_STYLE[r.result])}>
                  {RESULT_LETTER_LABEL[r.result]}
                </Badge>
              </div>
              <p className="mt-1 text-sm font-medium">
                vs {opponent?.shortName ?? r.opponentId} · {r.goalsFor}-{r.goalsAgainst}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-center text-[11px] text-muted-foreground sm:grid-cols-5">
                <span>Córners {r.cornersFor}/{r.cornersAgainst}</span>
                <span>Rem. {r.shotsFor}/{r.shotsAgainst}</span>
                <span>T.Arco {r.shotsOnTargetFor}/{r.shotsOnTargetAgainst}</span>
                <span>TA {r.yellowCards}</span>
                <span>Pos. {r.possession}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {notes.map((record) => (
        <p key={`${record.matchId}-note`} className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {formatDateShort(record.date)} · {record.opponentId}: {record.note}
        </p>
      ))}
    </>
  );
}
