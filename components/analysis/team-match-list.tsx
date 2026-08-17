import { ResultLetter, Team, TeamMatchRecord } from "@/types";
import { getTeamById } from "@/data/teams";
import { getCompetitionById } from "@/data/competitions";
import { TeamBadge } from "@/components/shared/team-badge";
import { formatDateShort } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

const RESULT_STYLE: Record<ResultLetter, string> = {
  W: "bg-brand-green/15 text-brand-green-bright",
  D: "bg-brand-yellow/15 text-brand-yellow",
  L: "bg-brand-red/15 text-brand-red",
};
const RESULT_LETTER: Record<ResultLetter, string> = { W: "G", D: "E", L: "P" };

/** El resultado del rival es siempre el espejo del resultado del equipo investigado. */
function flipResult(result: ResultLetter): ResultLetter {
  if (result === "W") return "L";
  if (result === "L") return "W";
  return "D";
}

/** Insignia genérica para rivales que no son un equipo registrado en el sistema (solo texto libre). */
function fallbackTeamBadge(name: string): Pick<Team, "code" | "primaryColor" | "secondaryColor" | "name"> {
  const initials = name
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 3)
    .join("")
    .toUpperCase();
  return { code: initials || "?", primaryColor: "#475569", secondaryColor: "#E2E8F0", name };
}

interface RowData {
  key: string;
  badge: Pick<Team, "code" | "primaryColor" | "secondaryColor" | "name">;
  name: string;
  ft: number;
  h1?: number;
  h2?: number;
  shots?: number;
  corners?: number;
  yellowCards?: number;
  redCards?: number;
}

/**
 * Plantilla de columnas compartida entre el encabezado y cada fila para que
 * todo quede alineado: insignia, nombre, goles totales, goles en el primer
 * tiempo, goles en el segundo tiempo, remates, córners, amarillas, rojas,
 * total de tarjetas y, al final, el resultado.
 */
const GRID_COLS = "grid-cols-[24px_minmax(0,1.6fr)_repeat(6,1fr)_48px]";
const HEADER_GRID = cn("grid", GRID_COLS, "items-center gap-x-2");

function StatCell({ value, title, col }: { value: number | string; title: string; col: number }) {
  return (
    <span
      className="block w-full text-center text-[11px] tabular-nums text-muted-foreground"
      style={{ gridColumn: col }}
      title={title}
    >
      {value}
    </span>
  );
}

function CardCell({ value, title, col, tone }: { value: number | undefined; title: string; col: number; tone: "yellow" | "red" }) {
  return (
    <span className="flex justify-center" style={{ gridColumn: col }} title={title}>
      {value !== undefined ? (
        <span
          className={cn(
            "flex size-4 items-center justify-center rounded-[3px] text-[10px] font-bold",
            tone === "yellow" ? "bg-brand-yellow text-black" : "bg-brand-red text-white"
          )}
        >
          {value}
        </span>
      ) : (
        <span className="text-[11px] text-muted-foreground">0</span>
      )}
    </span>
  );
}

function MatchRowCells({ row, gridRow }: { row: RowData; gridRow: number }) {
  return (
    <>
      <span style={{ gridColumn: 1, gridRow }} className="flex items-center">
        <TeamBadge team={row.badge} size="xs" />
      </span>
      <span style={{ gridColumn: 2, gridRow }} className="truncate text-xs font-medium text-foreground">
        {row.name}
      </span>
      <span
        style={{ gridColumn: 3, gridRow }}
        className="text-center text-[11px] font-semibold tabular-nums text-foreground"
        title="Resultado Final (FT)"
      >
        {row.ft}
      </span>
      <StatCell col={4} value={row.h1 ?? "-"} title="Primer Tiempo (1T)" />
      <StatCell col={5} value={row.h2 ?? "-"} title="Segundo Tiempo (2T)" />
      <StatCell col={6} value={row.corners ?? "-"} title="Córners" />
      <CardCell col={7} value={row.yellowCards} title="Tarjetas amarillas" tone="yellow" />
      <CardCell col={8} value={row.redCards} title="Tarjetas rojas" tone="red" />
    </>
  );
}

/**
 * Lista de partidos estilo "match center": dos filas por encuentro (local
 * arriba, visitante abajo), con el desglose de goles por tiempo, remates,
 * córners, tarjetas amarillas/rojas y su total.
 */
export function TeamMatchList({ team, records }: { team: Team; records: TeamMatchRecord[] }) {
  if (records.length === 0) return null;

  const total = records.length;
  const missing1H = records.filter((r) => r.goalsForFirstHalf === undefined).length;
  const missingCorners = records.filter((r) => r.cornersFor === undefined).length;
  const missingCards = records.filter((r) => r.yellowCards === undefined || r.yellowCardsAgainst === undefined).length;

  const warnings: string[] = [];
  if (missing1H > 0) {
    warnings.push(`Goles 1T / 2T: datos confirmados en ${total - missing1H} de ${total} partidos (${missing1H} sin desglose al descanso).`);
  }
  if (missingCorners > 0) {
    warnings.push(`Córners: datos confirmados en ${total - missingCorners} de ${total} partidos (${missingCorners} no disponibles).`);
  }
  if (missingCards > 0) {
    warnings.push(`🛑 Tarjetas: datos incompletos en ${missingCards} de ${total} partidos (falta registro de tarjetas propias o del rival). SE RECOMIENDA NO APOSTAR en mercados de tarjetas para este equipo.`);
  }

  return (
    <div className="space-y-3">
      {warnings.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">
              ⚠️ Auditoría de Cobertura de Datos — Historial de {team.shortName}
            </p>
            <p className="leading-relaxed text-amber-200/90">
              Algunos partidos de este paquete no registran la totalidad de métricas en la fuente oficial. Los promedios y porcentajes consideran únicamente los partidos con datos disponibles:
            </p>
            <ul className="list-disc space-y-0.5 pl-4 font-medium text-amber-200/90">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
      <div className={cn(HEADER_GRID, "border-b border-border bg-muted/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground")}>
        <span />
        <span>Partidos últimos</span>
        <span className="text-center" title="Goles totales">
          Goles
        </span>
        <span className="text-center" title="Goles en el primer tiempo">
          1er tiempo
        </span>
        <span className="text-center" title="Goles en el segundo tiempo">
          2do tiempo
        </span>
        <span className="text-center" title="Córners">
          Córners
        </span>
        <span className="flex items-center justify-center gap-1" title="Tarjetas amarillas">
          <span className="inline-block size-2.5 shrink-0 rounded-[2px] bg-brand-yellow" />
          Amarillas
        </span>
        <span className="flex items-center justify-center gap-1" title="Tarjetas rojas">
          <span className="inline-block size-2.5 shrink-0 rounded-[2px] bg-brand-red" />
          Rojas
        </span>
        <span className="text-center" title="Resultado del encuentro">
          Res.
        </span>
      </div>

      <div className="divide-y divide-border">
        {records.map((r) => {
          const opponent = getTeamById(r.opponentId);
          const competition = getCompetitionById(r.competitionId);

          const h2Self =
            r.goalsForSecondHalf !== undefined
              ? r.goalsForSecondHalf
              : r.goalsForFirstHalf !== undefined
              ? r.goalsFor - r.goalsForFirstHalf
              : undefined;

          const h2Opponent =
            r.goalsAgainstSecondHalf !== undefined
              ? r.goalsAgainstSecondHalf
              : r.goalsAgainstFirstHalf !== undefined
              ? r.goalsAgainst - r.goalsAgainstFirstHalf
              : undefined;

          const selfRow: RowData = {
            key: "self",
            badge: team,
            name: team.shortName,
            ft: r.goalsFor,
            h1: r.goalsForFirstHalf,
            h2: h2Self,
            shots: r.shotsFor,
            corners: r.cornersFor,
            yellowCards: r.yellowCards,
            redCards: r.redCards,
          };
          const opponentRow: RowData = {
            key: "opponent",
            badge: opponent ?? fallbackTeamBadge(r.opponentId),
            name: opponent?.shortName ?? r.opponentId,
            ft: r.goalsAgainst,
            h1: r.goalsAgainstFirstHalf,
            h2: h2Opponent,
            shots: r.shotsAgainst,
            corners: r.cornersAgainst,
            yellowCards: r.yellowCardsAgainst,
            redCards: r.redCardsAgainst,
          };
          const rows = r.venue === "local" ? [selfRow, opponentRow] : [opponentRow, selfRow];

          return (
            <div key={r.matchId} className="px-3 py-2">
              <p className="mb-1.5 text-[10px] text-muted-foreground">
                {formatDateShort(r.date)} · {competition?.shortName ?? r.competitionId}
              </p>
              <div
                className={cn("grid", GRID_COLS, "items-center gap-x-2 gap-y-1")}
                style={{ gridTemplateRows: "repeat(2, auto)" }}
              >
                {rows.map((row, i) => (
                  <MatchRowCells key={row.key} row={row} gridRow={i + 1} />
                ))}
                <span
                  style={{ gridColumn: 9, gridRow: "1 / span 2" }}
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center justify-self-center rounded-full text-[10px] font-bold",
                    RESULT_STYLE[r.result]
                  )}
                  title="Resultado del encuentro"
                >
                  {RESULT_LETTER[r.result]}
                </span>
              </div>
              {r.note && <p className="mt-1.5 text-[10px] text-muted-foreground">{r.note}</p>}
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
}
