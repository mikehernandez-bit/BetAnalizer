import { Match } from "@/types";

// ============================================================================
// Agrupa partidos por fecha relativa al día de hoy, para que en "Encuentros
// analizados" lo urgente (hoy/mañana) quede arriba y lo viejo se vaya para
// atrás en vez de mezclarse sin orden con lo próximo.
// ============================================================================

export type MatchDateGroupKey = "hoy" | "manana" | "proximos" | "ayer" | "pasados";

export interface MatchDateGroup {
  key: MatchDateGroupKey;
  label: string;
  matches: Match[];
}

const GROUP_LABELS: Record<MatchDateGroupKey, string> = {
  hoy: "Hoy",
  manana: "Mañana",
  proximos: "Próximos partidos",
  ayer: "Ayer",
  pasados: "Partidos anteriores",
};

const DAY_MS = 86400000;

function daysFromToday(dateIso: string, todayIso: string): number {
  const target = new Date(`${dateIso}T12:00:00Z`).getTime();
  const today = new Date(`${todayIso}T12:00:00Z`).getTime();
  return Math.round((target - today) / DAY_MS);
}

function byDateTimeAsc(a: Match, b: Match): number {
  return a.date + a.time < b.date + b.time ? -1 : 1;
}

function byDateTimeDesc(a: Match, b: Match): number {
  return a.date + a.time > b.date + b.time ? -1 : 1;
}

/**
 * Devuelve solo los grupos que tienen al menos un partido, en este orden:
 * Hoy, Mañana, Próximos, Ayer, Anteriores — lo relevante ahora y a futuro
 * primero, lo viejo al final (pero visible, con su fecha real en cada tarjeta).
 */
export function groupMatchesByRelativeDate(matches: Match[], todayIso: string): MatchDateGroup[] {
  const buckets: Record<MatchDateGroupKey, Match[]> = { hoy: [], manana: [], proximos: [], ayer: [], pasados: [] };

  matches.forEach((match) => {
    const diff = daysFromToday(match.date, todayIso);
    if (diff === 0) buckets.hoy.push(match);
    else if (diff === 1) buckets.manana.push(match);
    else if (diff > 1) buckets.proximos.push(match);
    else if (diff === -1) buckets.ayer.push(match);
    else buckets.pasados.push(match);
  });

  const order: MatchDateGroupKey[] = ["hoy", "manana", "proximos", "ayer", "pasados"];
  const sorters: Record<MatchDateGroupKey, (a: Match, b: Match) => number> = {
    hoy: byDateTimeAsc,
    manana: byDateTimeAsc,
    proximos: byDateTimeAsc,
    ayer: byDateTimeAsc,
    pasados: byDateTimeDesc,
  };

  return order
    .map((key) => ({ key, label: GROUP_LABELS[key], matches: [...buckets[key]].sort(sorters[key]) }))
    .filter((group) => group.matches.length > 0);
}
