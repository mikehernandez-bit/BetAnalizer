import {
  CrossPattern,
  CrossPatternStrength,
  MarketCategory,
  Pattern,
  PatternStrength,
  StatDistribution,
  StatKey,
  TeamForm,
  TeamMatchRecord,
  TrendDirection,
} from "@/types";
import { getTeamById } from "@/data/teams";
import { getMarketById } from "@/data/markets";

const STAT_KEYS: StatKey[] = [
  "goalsFor",
  "goalsAgainst",
  "cornersFor",
  "cornersAgainst",
  "shotsFor",
  "shotsAgainst",
  "shotsOnTargetFor",
  "shotsOnTargetAgainst",
  "possession",
];

export function mean(values: number[]): number {
  const valid = values.filter((v) => typeof v === "number" && !isNaN(v) && v !== null && v !== undefined);
  if (valid.length === 0) return 0;
  return valid.reduce((sum, v) => sum + v, 0) / valid.length;
}

export function median(values: number[]): number {
  const valid = values.filter((v) => typeof v === "number" && !isNaN(v) && v !== null && v !== undefined);
  if (valid.length === 0) return 0;
  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function stdDev(values: number[]): number {
  const valid = values.filter((v) => typeof v === "number" && !isNaN(v) && v !== null && v !== undefined);
  if (valid.length < 2) return 0;
  const avg = mean(valid);
  const variance = mean(valid.map((v) => (v - avg) ** 2));
  return Math.sqrt(variance);
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** records must be ordered most-recent-first. */
function trendFor(values: number[]): TrendDirection {
  const valid = values.filter((v) => typeof v === "number" && !isNaN(v) && v !== null && v !== undefined);
  if (valid.length < 4) return "estable";
  const half = Math.floor(valid.length / 2);
  const recent = mean(valid.slice(0, half));
  const older = mean(valid.slice(half));
  const delta = recent - older;
  const threshold = Math.max(0.25, mean(valid) * 0.12);
  if (delta > threshold) return "ascendente";
  if (delta < -threshold) return "descendente";
  return "estable";
}

export function aggregateStat(values: number[]): StatDistribution {
  const valid = values.filter((v) => typeof v === "number" && !isNaN(v) && v !== null && v !== undefined);
  return {
    average: round1(mean(valid)),
    median: round1(median(valid)),
    max: valid.length ? Math.max(...valid) : 0,
    min: valid.length ? Math.min(...valid) : 0,
    stdDev: round1(stdDev(valid)),
    trend: trendFor(valid),
  };
}

export function buildTeamForm(teamId: string, records: TeamMatchRecord[]): TeamForm {
  const stats = STAT_KEYS.reduce((acc, key) => {
    acc[key] = aggregateStat(records.map((r) => r[key] ?? 0));
    return acc;
  }, {} as Record<StatKey, StatDistribution>);

  return {
    teamId,
    sampleSize: records.length,
    matches: records,
    stats,
  };
}

// ----------------------------------------------------------------------------
// Pattern templates
// ----------------------------------------------------------------------------

export type PatternDirection = "for" | "against" | "match";

export interface PatternTemplate {
  id: string;
  category: MarketCategory;
  direction: PatternDirection;
  title: (hits: number, total: number) => string;
  predicate: (record: TeamMatchRecord) => boolean;
  marketId?: string;
  /**
   * Algunos campos (goles por tiempo, tarjetas del rival) son opcionales en
   * TeamMatchRecord porque rara vez están disponibles en la fuente — ver
   * lib/match-package-prompt.ts. Un patrón basado en esos campos NO puede
   * usar "records.length" como total: un partido sin el dato no es un fallo
   * del patrón, es un partido sin muestra. `sampleFilter` reduce la muestra
   * a los registros donde el dato realmente existe antes de calcular
   * hits/total; sin este filtro, "undefined" se leería como "no cumplió" y
   * el porcentaje quedaría artificialmente bajo. Si no se define, se usa
   * toda la muestra (comportamiento de siempre).
   */
  sampleFilter?: (record: TeamMatchRecord) => boolean;
  /** Mínimo de registros CON el dato (tras sampleFilter) para mostrar el patrón. Default: 4. */
  minApplicable?: number;
}

const MATCH_CORNERS_THRESHOLDS = [6.5, 7.5, 8.5, 9.5, 10.5, 11.5] as const;
const MATCH_CORNERS_UNDER_THRESHOLDS = MATCH_CORNERS_THRESHOLDS;

function thresholdId(threshold: number): string {
  return String(threshold).replace(".", "");
}

const MATCH_CORNERS_PATTERN_TEMPLATES: PatternTemplate[] = MATCH_CORNERS_THRESHOLDS.map((threshold) => ({
  id: `match_corners_over${thresholdId(threshold)}`,
  category: "corners",
  direction: "match",
  title: (h, t) => `Hubo más de ${threshold} córners en ${h} de ${t} partidos`,
  predicate: (r) => (r.cornersFor ?? 0) + (r.cornersAgainst ?? 0) > threshold,
  marketId: `corners_over_${thresholdId(threshold)}`,
}));

const MATCH_CORNERS_UNDER_PATTERN_TEMPLATES: PatternTemplate[] = MATCH_CORNERS_UNDER_THRESHOLDS.map((threshold) => ({
  id: `match_corners_under${thresholdId(threshold)}`,
  category: "corners",
  direction: "match",
  title: (h, t) => `Hubo menos de ${threshold} córners en ${h} de ${t} partidos`,
  predicate: (r) => (r.cornersFor ?? 0) + (r.cornersAgainst ?? 0) < threshold,
  marketId: `corners_under_${thresholdId(threshold)}`,
}));

export const PATTERN_TEMPLATES: PatternTemplate[] = [
  {
    id: "goals_for_ge1",
    category: "goles",
    direction: "for",
    title: (h, t) => `Marcó al menos un gol en ${h} de ${t} partidos`,
    predicate: (r) => r.goalsFor >= 1,
    marketId: "goals_over_05",
  },
  {
    id: "goals_against_ge1",
    category: "goles",
    direction: "against",
    title: (h, t) => `Recibió al menos un gol en ${h} de ${t} partidos`,
    predicate: (r) => r.goalsAgainst >= 1,
  },
  {
    id: "clean_sheet",
    category: "goles",
    direction: "against",
    title: (h, t) => `Terminó sin recibir goles en ${h} de ${t} partidos`,
    predicate: (r) => r.goalsAgainst === 0,
  },
  {
    id: "btts",
    category: "ambos_marcan",
    direction: "match",
    title: (h, t) => `Ambos equipos marcaron en ${h} de ${t} partidos`,
    predicate: (r) => r.goalsFor >= 1 && r.goalsAgainst >= 1,
    marketId: "btts_yes",
  },
  {
    id: "match_over25",
    category: "goles",
    direction: "match",
    title: (h, t) => `Hubo más de 2.5 goles en ${h} de ${t} partidos`,
    predicate: (r) => r.goalsFor + r.goalsAgainst > 2.5,
    marketId: "goals_over_25",
  },
  ...MATCH_CORNERS_PATTERN_TEMPLATES,
  ...MATCH_CORNERS_UNDER_PATTERN_TEMPLATES,
  {
    id: "corners_for_gt45",
    category: "corners",
    direction: "for",
    title: (h, t) => `Superó 4.5 córners a favor en ${h} de ${t} partidos`,
    predicate: (r) => (r.cornersFor ?? 0) > 4.5,
    marketId: "corners_home_over_45",
  },
  {
    id: "corners_for_gt35",
    category: "corners",
    direction: "for",
    title: (h, t) => `Superó 3.5 córners a favor en ${h} de ${t} partidos`,
    predicate: (r) => (r.cornersFor ?? 0) > 3.5,
    marketId: "corners_home_over_35",
  },
  {
    id: "corners_against_gt45",
    category: "corners",
    direction: "against",
    title: (h, t) => `Concedió más de 4.5 córners en ${h} de ${t} partidos`,
    predicate: (r) => (r.cornersAgainst ?? 0) > 4.5,
  },
  {
    id: "corners_against_gt35",
    category: "corners",
    direction: "against",
    title: (h, t) => `Concedió más de 3.5 córners en ${h} de ${t} partidos`,
    predicate: (r) => (r.cornersAgainst ?? 0) > 3.5,
  },
  {
    id: "shots_for_ge9",
    category: "remates",
    direction: "for",
    title: (h, t) => `Superó los 8.5 remates en ${h} de ${t} partidos`,
    predicate: (r) => (r.shotsFor ?? 0) > 8.5,
    marketId: "shots_home_over_85",
  },

  // Primera parte — goles ----------------------------------------------------
  {
    id: "first_half_for_ge1",
    category: "primera_parte",
    direction: "for",
    title: (h, t) => `Marcó en el primer tiempo (+0.5 1T) en ${h} de ${t} partidos`,
    predicate: (r) => (r.goalsForFirstHalf ?? 0) >= 1,
    marketId: "first_half_home_over_05",
  },
  {
    id: "first_half_against_ge1",
    category: "primera_parte",
    direction: "against",
    title: (h, t) => `Recibió gol en el primer tiempo en ${h} de ${t} partidos`,
    predicate: (r) => (r.goalsAgainstFirstHalf ?? 0) >= 1,
  },
  {
    id: "first_half_match_over05",
    category: "primera_parte",
    direction: "match",
    title: (h, t) => `Hubo más de 0.5 goles en el primer tiempo en ${h} de ${t} partidos`,
    predicate: (r) => (r.goalsForFirstHalf ?? 0) + (r.goalsAgainstFirstHalf ?? 0) > 0.5,
    marketId: "first_half_over_05",
  },
  {
    id: "first_half_match_over15",
    category: "primera_parte",
    direction: "match",
    title: (h, t) => `Hubo más de 1.5 goles totales (ambos equipos) en el primer tiempo en ${h} de ${t} partidos`,
    predicate: (r) => (r.goalsForFirstHalf ?? 0) + (r.goalsAgainstFirstHalf ?? 0) > 1.5,
    marketId: "first_half_over_15",
  },
  {
    id: "first_half_match_under25",
    category: "primera_parte",
    direction: "match",
    title: (h, t) => `Hubo menos de 2.5 goles totales (ambos equipos) en el primer tiempo en ${h} de ${t} partidos`,
    predicate: (r) => r.goalsForFirstHalf !== undefined && r.goalsAgainstFirstHalf !== undefined && r.goalsForFirstHalf + r.goalsAgainstFirstHalf < 2.5,
    marketId: "first_half_under_25",
  },
  {
    id: "first_half_match_under35",
    category: "primera_parte",
    direction: "match",
    title: (h, t) => `Hubo menos de 3.5 goles totales (ambos equipos) en el primer tiempo en ${h} de ${t} partidos`,
    predicate: (r) => r.goalsForFirstHalf !== undefined && r.goalsAgainstFirstHalf !== undefined && r.goalsForFirstHalf + r.goalsAgainstFirstHalf < 3.5,
    marketId: "first_half_under_35",
  },
  {
    id: "first_half_btts_match",
    category: "primera_parte",
    direction: "match",
    title: (h, t) => `Ambos equipos marcaron en el primer tiempo en ${h} de ${t} partidos`,
    predicate: (r) => (r.goalsForFirstHalf ?? 0) >= 1 && (r.goalsAgainstFirstHalf ?? 0) >= 1,
    marketId: "first_half_btts",
  },

  // Segunda parte — goles ------------------------------------------------
  {
    id: "second_half_for_ge1",
    category: "segunda_parte",
    direction: "for",
    title: (h, t) => `Marcó en el segundo tiempo (+0.5 2T) en ${h} de ${t} partidos`,
    predicate: (r) => (r.goalsForSecondHalf ?? 0) >= 1,
    marketId: "second_half_home_over_05",
  },
  {
    id: "second_half_against_ge1",
    category: "segunda_parte",
    direction: "against",
    title: (h, t) => `Recibió gol en el segundo tiempo en ${h} de ${t} partidos`,
    predicate: (r) => (r.goalsAgainstSecondHalf ?? 0) >= 1,
  },
  {
    id: "second_half_match_over05",
    category: "segunda_parte",
    direction: "match",
    title: (h, t) => `Hubo más de 0.5 goles en el segundo tiempo en ${h} de ${t} partidos`,
    predicate: (r) => (r.goalsForSecondHalf ?? 0) + (r.goalsAgainstSecondHalf ?? 0) > 0.5,
    marketId: "second_half_over_05",
  },
  {
    id: "second_half_match_over15",
    category: "segunda_parte",
    direction: "match",
    title: (h, t) => `Hubo más de 1.5 goles totales (ambos equipos) en el segundo tiempo en ${h} de ${t} partidos`,
    predicate: (r) => (r.goalsForSecondHalf ?? 0) + (r.goalsAgainstSecondHalf ?? 0) > 1.5,
    marketId: "second_half_over_15",
  },
  {
    id: "second_half_match_under25",
    category: "segunda_parte",
    direction: "match",
    title: (h, t) => `Hubo menos de 2.5 goles totales (ambos equipos) en el segundo tiempo en ${h} de ${t} partidos`,
    predicate: (r) => r.goalsForSecondHalf !== undefined && r.goalsAgainstSecondHalf !== undefined && r.goalsForSecondHalf + r.goalsAgainstSecondHalf < 2.5,
    marketId: "second_half_under_25",
  },
  {
    id: "second_half_match_under35",
    category: "segunda_parte",
    direction: "match",
    title: (h, t) => `Hubo menos de 3.5 goles totales (ambos equipos) en el segundo tiempo en ${h} de ${t} partidos`,
    predicate: (r) => r.goalsForSecondHalf !== undefined && r.goalsAgainstSecondHalf !== undefined && r.goalsForSecondHalf + r.goalsAgainstSecondHalf < 3.5,
    marketId: "second_half_under_35",
  },
  {
    id: "second_half_btts_match",
    category: "segunda_parte",
    direction: "match",
    title: (h, t) => `Ambos equipos marcaron en el segundo tiempo en ${h} de ${t} partidos`,
    predicate: (r) => (r.goalsForSecondHalf ?? 0) >= 1 && (r.goalsAgainstSecondHalf ?? 0) >= 1,
    marketId: "second_half_btts",
  },

  // Tarjetas ------------------------------------------------------------
  {
    id: "cards_for_gt05",
    category: "tarjetas",
    direction: "for",
    title: (h, t) => `Recibió más de 0.5 tarjetas amarillas en ${h} de ${t} partidos`,
    predicate: (r) => (r.yellowCards ?? 0) > 0.5,
    marketId: "cards_home_over_05",
  },
  {
    id: "cards_for_gt15",
    category: "tarjetas",
    direction: "for",
    title: (h, t) => `Recibió más de 1.5 tarjetas amarillas en ${h} de ${t} partidos`,
    predicate: (r) => (r.yellowCards ?? 0) > 1.5,
    marketId: "cards_home_over_15",
  },
  {
    id: "cards_for_gt25",
    category: "tarjetas",
    direction: "for",
    title: (h, t) => `Recibió más de 2.5 tarjetas amarillas en ${h} de ${t} partidos`,
    predicate: (r) => (r.yellowCards ?? 0) > 2.5,
    marketId: "cards_home_over_25",
  },
  {
    id: "cards_against_gt05",
    category: "tarjetas",
    direction: "against",
    title: (h, t) => `El rival recibió más de 0.5 tarjetas amarillas en ${h} de ${t} partidos`,
    predicate: (r) => (r.yellowCardsAgainst ?? 0) > 0.5,
  },
  {
    id: "cards_against_gt15",
    category: "tarjetas",
    direction: "against",
    title: (h, t) => `El rival recibió más de 1.5 tarjetas amarillas en ${h} de ${t} partidos`,
    predicate: (r) => (r.yellowCardsAgainst ?? 0) > 1.5,
  },
  {
    id: "cards_against_gt25",
    category: "tarjetas",
    direction: "against",
    title: (h, t) => `El rival recibió más de 2.5 tarjetas amarillas en ${h} de ${t} partidos`,
    predicate: (r) => (r.yellowCardsAgainst ?? 0) > 2.5,
  },
  {
    id: "cards_btts_match",
    category: "tarjetas",
    direction: "match",
    title: (h, t) => `Ambos equipos recibieron tarjeta amarilla en ${h} de ${t} partidos`,
    predicate: (r) => (r.yellowCards ?? 0) >= 1 && (r.yellowCardsAgainst ?? 0) >= 1,
    marketId: "cards_btts",
  },
  {
    id: "cards_total_match_over15",
    category: "tarjetas",
    direction: "match",
    title: (h, t) => `Hubo más de 1.5 tarjetas amarillas totales en ${h} de ${t} partidos`,
    predicate: (r) => (r.yellowCards ?? 0) + (r.yellowCardsAgainst ?? 0) > 1.5,
    marketId: "cards_total_over_15",
  },
  {
    id: "cards_total_match_over25",
    category: "tarjetas",
    direction: "match",
    title: (h, t) => `Hubo más de 2.5 tarjetas amarillas totales en ${h} de ${t} partidos`,
    predicate: (r) => (r.yellowCards ?? 0) + (r.yellowCardsAgainst ?? 0) > 2.5,
    marketId: "cards_total_over_25",
  },
  {
    id: "cards_total_match_over35",
    category: "tarjetas",
    direction: "match",
    title: (h, t) => `Hubo más de 3.5 tarjetas amarillas totales en ${h} de ${t} partidos`,
    predicate: (r) => (r.yellowCards ?? 0) + (r.yellowCardsAgainst ?? 0) > 3.5,
    marketId: "cards_total_over_35",
  },
  {
    id: "cards_total_match_over45",
    category: "tarjetas",
    direction: "match",
    title: (h, t) => `Hubo más de 4.5 tarjetas amarillas totales en ${h} de ${t} partidos`,
    predicate: (r) => (r.yellowCards ?? 0) + (r.yellowCardsAgainst ?? 0) > 4.5,
    marketId: "cards_total_over_45",
  },
  {
    id: "red_card_match_ge1",
    category: "tarjetas",
    direction: "match",
    title: (h, t) => `Hubo al menos una tarjeta roja (propia o del rival) en ${h} de ${t} partidos`,
    predicate: (r) => (r.redCards ?? 0) >= 1 || (r.redCardsAgainst ?? 0) >= 1,
    marketId: "red_card_shown",
  },
  {
    id: "no_win_away",
    category: "resultado",
    direction: "match",
    title: (h, t) => `No ganó en ${h} de sus últimos ${t} partidos como visitante`,
    predicate: (r) => r.venue === "visitante" && r.result !== "W",
  },
];

// ----------------------------------------------------------------------------
// Patrones dinámicos de "peor caso" (techo/piso real observado)
//
// A diferencia de PATTERN_TEMPLATES (umbrales fijos, ej. "más/menos de 6.5
// córners"), estos patrones no prueban una lista de líneas predefinidas: para
// cada estadística relevante calculan el máximo y el mínimo que realmente
// ocurrió en la muestra, y arman el patrón directamente a partir de ese
// extremo real ("nunca superó los X", "siempre llegó al menos a Y"). Como se
// derivan del propio máximo/mínimo de la muestra, siempre dan 100% de
// aciertos — el límite de fuerza por tamaño de muestra (strengthFromPercentage)
// evita que eso se lea como más confiable de lo que la muestra permite.
// ----------------------------------------------------------------------------

interface ExtremeStatDefinition {
  key: string;
  label: string;
  category: MarketCategory;
  direction: PatternDirection;
  value: (r: TeamMatchRecord) => number;
  /**
   * Si es true, esta estadística también se agrupa en "Rangos combinados"
   * (computeExtremeCrossPatterns), juntando la muestra de ambos equipos.
   * Para goles/córners/remates/tiros al arco "match" es for+against (el
   * total real de ESE partido); para tarjetas no existe un "against" en
   * TeamMatchRecord (no se registran las tarjetas del rival), así que se
   * agrupan directamente los valores propios de cada equipo — el resultado
   * sigue siendo honesto ("ninguno de los dos recibió más de X en sus
   * partidos recientes"), solo que no es "total del partido". Los campos
   * opcionales yellowCardsAgainst/redCardsAgainst existen en el tipo para
   * cuando la fuente sí publica las tarjetas del rival, pero como rara vez
   * están disponibles, "Rangos" no depende de ellos todavía — se calcula
   * siempre con el dato propio de cada equipo, que es el que sí es 100%
   * confiable en toda la muestra.
   */
  poolAcrossTeams?: boolean;
}

/** Una tarjeta roja pesa el doble que una amarilla en las métricas de disciplina. */
function cardPoints(yellow: number, red: number): number {
  return yellow + red * 2;
}

const EXTREME_STAT_DEFINITIONS: ExtremeStatDefinition[] = [
  { key: "goals_for", label: "goles a favor", category: "goles", direction: "for", value: (r) => r.goalsFor },
  { key: "goals_against", label: "goles en contra", category: "goles", direction: "against", value: (r) => r.goalsAgainst },
  {
    key: "match_goals",
    label: "goles totales del partido",
    category: "goles",
    direction: "match",
    value: (r) => r.goalsFor + r.goalsAgainst,
    poolAcrossTeams: true,
  },
  { key: "corners_for", label: "córners a favor", category: "corners", direction: "for", value: (r) => r.cornersFor ?? 0 },
  { key: "corners_against", label: "córners en contra", category: "corners", direction: "against", value: (r) => r.cornersAgainst ?? 0 },
  {
    key: "match_corners",
    label: "córners totales del partido",
    category: "corners",
    direction: "match",
    value: (r) => (r.cornersFor ?? 0) + (r.cornersAgainst ?? 0),
    poolAcrossTeams: true,
  },
  { key: "shots_for", label: "remates a favor", category: "remates", direction: "for", value: (r) => r.shotsFor ?? 0 },
  { key: "shots_against", label: "remates en contra", category: "remates", direction: "against", value: (r) => r.shotsAgainst ?? 0 },
  {
    key: "match_shots",
    label: "remates totales del partido",
    category: "remates",
    direction: "match",
    value: (r) => (r.shotsFor ?? 0) + (r.shotsAgainst ?? 0),
    poolAcrossTeams: true,
  },
  {
    key: "card_points",
    label: "puntos de tarjetas (amarilla=1, roja=2)",
    category: "tarjetas",
    direction: "for",
    value: (r) => cardPoints(r.yellowCards ?? 0, r.redCards ?? 0),
    poolAcrossTeams: true,
  },
  {
    key: "yellow_cards_for",
    label: "tarjetas amarillas",
    category: "tarjetas",
    direction: "for",
    value: (r) => r.yellowCards ?? 0,
    poolAcrossTeams: true,
  },
  {
    key: "red_cards_for",
    label: "tarjetas rojas",
    category: "tarjetas",
    direction: "for",
    value: (r) => r.redCards ?? 0,
    poolAcrossTeams: true,
  },
];

/**
 * Techo/piso real por equipo para cada estadística de EXTREME_STAT_DEFINITIONS
 * (goles, córners, remates, tiros al arco — a favor/en contra/totales del
 * partido). A diferencia de computeTeamPatterns, no se mezcla con esos
 * patrones: se pensó para la pestaña "Rangos" del análisis, separada de
 * "Patrones" para no saturarla.
 */
export function computeExtremeTeamPatterns(teamId: string, records: TeamMatchRecord[]): Pattern[] {
  if (records.length < 4) return [];
  const total = records.length;
  const patterns: Pattern[] = [];
  const matchIds = records.map((r) => r.matchId);

  EXTREME_STAT_DEFINITIONS.forEach((def) => {
    const values = records.map(def.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const ceilingLine = round1(max + 0.5);

    const ceilingTitle = `Nunca superó los ${ceilingLine} ${def.label} en sus últimos ${total} partidos (máximo real: ${max})`;
    patterns.push({
      id: `${teamId}-extreme-${def.key}-ceiling`,
      teamId,
      category: def.category,
      title: ceilingTitle,
      description: ceilingTitle,
      hits: total,
      total,
      percentage: 100,
      strength: strengthFromPercentage(100, total),
      trend: "estable",
      relatedMatchIds: matchIds,
    });

    // Un mínimo de 0 no aporta ("siempre llegó al menos a 0" no dice nada).
    if (min > 0) {
      const floorLine = round1(min - 0.5);
      const floorTitle = `Siempre llegó al menos a ${min} ${def.label} en sus últimos ${total} partidos (más de ${floorLine} en todos)`;
      patterns.push({
        id: `${teamId}-extreme-${def.key}-floor`,
        teamId,
        category: def.category,
        title: floorTitle,
        description: floorTitle,
        hits: total,
        total,
        percentage: 100,
        strength: strengthFromPercentage(100, total),
        trend: "estable",
        relatedMatchIds: matchIds,
      });
    }
  });

  return patterns;
}

/**
 * A pattern that's "100%" over 4-5 real matches is not the same signal as 100%
 * over 15-20 — with so few games a single result swings the percentage wildly.
 * The label is capped by sample size so "muy fuerte" only appears once the
 * sample is actually large enough to trust, independent of how high the raw
 * percentage looks.
 */
function strengthFromPercentage(pct: number, total: number): PatternStrength {
  const ceiling: PatternStrength = total >= 10 ? "muy_fuerte" : total >= 6 ? "fuerte" : "moderado";
  const raw: PatternStrength = pct >= 80 ? "muy_fuerte" : pct >= 65 ? "fuerte" : pct >= 50 ? "moderado" : "debil";
  const rank: Record<PatternStrength, number> = { debil: 0, moderado: 1, fuerte: 2, muy_fuerte: 3 };
  return rank[raw] <= rank[ceiling] ? raw : ceiling;
}

function trendFromBooleans(hitFlags: boolean[]): TrendDirection {
  if (hitFlags.length < 4) return "estable";
  const half = Math.floor(hitFlags.length / 2);
  const recentRate = hitFlags.slice(0, half).filter(Boolean).length / half;
  const olderRate = hitFlags.slice(half).filter(Boolean).length / (hitFlags.length - half);
  const delta = recentRate - olderRate;
  if (delta > 0.2) return "ascendente";
  if (delta < -0.2) return "descendente";
  return "estable";
}

export function computeTeamPatterns(teamId: string, records: TeamMatchRecord[], limit?: number): Pattern[] {
  if (records.length < 4) return [];

  const patterns: Pattern[] = PATTERN_TEMPLATES.filter((tpl) => tpl.id !== "no_win_away")
    .map((tpl) => {
      const applicable = tpl.sampleFilter ? records.filter(tpl.sampleFilter) : records;
      const minApplicable = tpl.minApplicable ?? 4;
      if (applicable.length < minApplicable) return null;

      const flags = records.map((r) => tpl.predicate(r));
      const hits = flags.filter(Boolean).length;
      const total = records.length;
      const percentage = Math.round((hits / total) * 100);
      return {
        id: `${teamId}-${tpl.id}`,
        teamId,
        category: tpl.category,
        title: tpl.title(hits, total),
        description: tpl.title(hits, total),
        hits,
        total,
        percentage,
        strength: strengthFromPercentage(percentage, total),
        trend: trendFromBooleans(flags),
        relatedMatchIds: records.filter((r) => tpl.predicate(r)).map((r) => r.matchId),
      };
    })
    .filter((p): p is Pattern => p !== null);

  const awayRecords = records.filter((r) => r.venue === "visitante");
  if (awayRecords.length >= 3) {
    const flags = awayRecords.map((r) => r.result !== "W");
    const hits = flags.filter(Boolean).length;
    if (hits >= 3) {
      patterns.push({
        id: `${teamId}-no_win_away`,
        teamId,
        category: "resultado",
        title: `No ganó en ${hits} de sus últimos ${awayRecords.length} partidos como visitante`,
        description: `No ganó en ${hits} de sus últimos ${awayRecords.length} partidos como visitante`,
        hits,
        total: awayRecords.length,
        percentage: Math.round((hits / awayRecords.length) * 100),
        strength: strengthFromPercentage(Math.round((hits / awayRecords.length) * 100), awayRecords.length),
        trend: "estable",
        relatedMatchIds: awayRecords.filter((r) => r.result !== "W").map((r) => r.matchId),
      });
    }
  }

  const sorted = patterns.sort((a, b) => b.percentage - a.percentage);
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

// ----------------------------------------------------------------------------
// Cross patterns (coincidencias entre fortalezas y debilidades)
// ----------------------------------------------------------------------------

interface CrossPairDefinition {
  forTemplateId: string;
  againstTemplateId: string;
  marketId: string;
  side: "home" | "away" | "both";
}

const CROSS_PAIRS: CrossPairDefinition[] = [
  ...MATCH_CORNERS_THRESHOLDS.map<CrossPairDefinition>((threshold) => ({
    forTemplateId: `match_corners_over${thresholdId(threshold)}`,
    againstTemplateId: `match_corners_over${thresholdId(threshold)}`,
    marketId: `corners_over_${thresholdId(threshold)}`,
    side: "both",
  })),
  ...MATCH_CORNERS_UNDER_THRESHOLDS.map<CrossPairDefinition>((threshold) => ({
    forTemplateId: `match_corners_under${thresholdId(threshold)}`,
    againstTemplateId: `match_corners_under${thresholdId(threshold)}`,
    marketId: `corners_under_${thresholdId(threshold)}`,
    side: "both",
  })),
  { forTemplateId: "corners_for_gt35", againstTemplateId: "corners_against_gt35", marketId: "corners_home_over_35", side: "home" },
  { forTemplateId: "corners_for_gt45", againstTemplateId: "corners_against_gt45", marketId: "corners_home_over_45", side: "home" },
  { forTemplateId: "corners_for_gt35", againstTemplateId: "corners_against_gt35", marketId: "corners_away_over_35", side: "away" },
  { forTemplateId: "corners_for_gt45", againstTemplateId: "corners_against_gt45", marketId: "corners_away_over_45", side: "away" },
  { forTemplateId: "goals_for_ge1", againstTemplateId: "goals_against_ge1", marketId: "home_team_scores", side: "home" },
  { forTemplateId: "goals_for_ge1", againstTemplateId: "goals_against_ge1", marketId: "away_team_scores", side: "away" },
  { forTemplateId: "sot_for_ge4", againstTemplateId: "sot_against_ge4", marketId: "sot_home_over_35", side: "home" },
  { forTemplateId: "sot_for_ge4", againstTemplateId: "sot_against_ge4", marketId: "sot_away_over_25", side: "away" },

  // Primera parte / segunda parte — solo aporta partidos con dato real de descanso (ver sampleFilter).
  { forTemplateId: "first_half_match_over05", againstTemplateId: "first_half_match_over05", marketId: "first_half_over_05", side: "both" },
  { forTemplateId: "first_half_match_over15", againstTemplateId: "first_half_match_over15", marketId: "first_half_over_15", side: "both" },
  { forTemplateId: "first_half_match_under25", againstTemplateId: "first_half_match_under25", marketId: "first_half_under_25", side: "both" },
  { forTemplateId: "first_half_match_under35", againstTemplateId: "first_half_match_under35", marketId: "first_half_under_35", side: "both" },
  { forTemplateId: "first_half_btts_match", againstTemplateId: "first_half_btts_match", marketId: "first_half_btts", side: "both" },
  { forTemplateId: "second_half_match_over05", againstTemplateId: "second_half_match_over05", marketId: "second_half_over_05", side: "both" },
  { forTemplateId: "second_half_match_over15", againstTemplateId: "second_half_match_over15", marketId: "second_half_over_15", side: "both" },
  { forTemplateId: "second_half_match_under25", againstTemplateId: "second_half_match_under25", marketId: "second_half_under_25", side: "both" },
  { forTemplateId: "second_half_match_under35", againstTemplateId: "second_half_match_under35", marketId: "second_half_under_35", side: "both" },
  { forTemplateId: "second_half_btts_match", againstTemplateId: "second_half_btts_match", marketId: "second_half_btts", side: "both" },

  // Tarjetas — individuales requieren solo el dato propio; total/roja requieren el dato del rival (ver sampleFilter).
  { forTemplateId: "cards_for_gt05", againstTemplateId: "cards_against_gt05", marketId: "cards_home_over_05", side: "home" },
  { forTemplateId: "cards_for_gt15", againstTemplateId: "cards_against_gt15", marketId: "cards_home_over_15", side: "home" },
  { forTemplateId: "cards_for_gt25", againstTemplateId: "cards_against_gt25", marketId: "cards_home_over_25", side: "home" },
  { forTemplateId: "cards_for_gt05", againstTemplateId: "cards_against_gt05", marketId: "cards_away_over_05", side: "away" },
  { forTemplateId: "cards_for_gt15", againstTemplateId: "cards_against_gt15", marketId: "cards_away_over_15", side: "away" },
  { forTemplateId: "cards_for_gt25", againstTemplateId: "cards_against_gt25", marketId: "cards_away_over_25", side: "away" },
  { forTemplateId: "cards_btts_match", againstTemplateId: "cards_btts_match", marketId: "cards_btts", side: "both" },
  { forTemplateId: "cards_total_match_over15", againstTemplateId: "cards_total_match_over15", marketId: "cards_total_over_15", side: "both" },
  { forTemplateId: "cards_total_match_over25", againstTemplateId: "cards_total_match_over25", marketId: "cards_total_over_25", side: "both" },
  { forTemplateId: "cards_total_match_over35", againstTemplateId: "cards_total_match_over35", marketId: "cards_total_over_35", side: "both" },
  { forTemplateId: "cards_total_match_over45", againstTemplateId: "cards_total_match_over45", marketId: "cards_total_over_45", side: "both" },
  { forTemplateId: "red_card_match_ge1", againstTemplateId: "red_card_match_ge1", marketId: "red_card_shown", side: "both" },
];

function classifyCrossStrength(pctFor: number, pctAgainst: number, totalFor: number, totalAgainst: number): CrossPatternStrength {
  const divergence = Math.abs(pctFor - pctAgainst);
  const combined = (pctFor + pctAgainst) / 2;
  if (divergence > 42 && Math.min(pctFor, pctAgainst) < 55) return "contradictorio";

  const raw: CrossPatternStrength = combined >= 80 ? "muy_fuerte" : combined >= 65 ? "fuerte" : combined >= 50 ? "moderado" : "debil";
  // Same sample-size discipline as individual patterns: a cross-signal built from two
  // small samples shouldn't read as "muy fuerte" just because the raw percentage is high.
  const smallestSample = Math.min(totalFor, totalAgainst);
  const ceiling: CrossPatternStrength = smallestSample >= 10 ? "muy_fuerte" : smallestSample >= 6 ? "fuerte" : "moderado";
  const rank: Record<CrossPatternStrength, number> = { debil: 0, moderado: 1, fuerte: 2, muy_fuerte: 3, contradictorio: 3 };
  return rank[raw] <= rank[ceiling] ? raw : ceiling;
}

function templateStatsFor(records: TeamMatchRecord[], templateId: string): { hits: number; total: number; pct: number } {
  const tpl = PATTERN_TEMPLATES.find((t) => t.id === templateId);
  if (!tpl) return { hits: 0, total: 0, pct: 0 };
  if (records.length === 0) return { hits: 0, total: 0, pct: 0 };
  const hits = records.filter((r) => tpl.predicate(r)).length;
  return { hits, total: records.length, pct: Math.round((hits / records.length) * 100) };
}

export function computeCrossPatterns(
  homeTeamId: string,
  homeRecords: TeamMatchRecord[],
  awayTeamId: string,
  awayRecords: TeamMatchRecord[]
): CrossPattern[] {
  const homeTeam = getTeamById(homeTeamId);
  const awayTeam = getTeamById(awayTeamId);

  const crossPairPatterns: CrossPattern[] = CROSS_PAIRS.map((pair) => {
    const market = getMarketById(pair.marketId);
    const isSharedMatchPattern = pair.side === "both";
    const attackingTeamId = isSharedMatchPattern ? homeTeamId : pair.side === "home" ? homeTeamId : awayTeamId;
    const attackingRecords = isSharedMatchPattern ? homeRecords : pair.side === "home" ? homeRecords : awayRecords;
    const defendingTeamId = isSharedMatchPattern ? awayTeamId : pair.side === "home" ? awayTeamId : homeTeamId;
    const defendingRecords = isSharedMatchPattern ? awayRecords : pair.side === "home" ? awayRecords : homeRecords;

    const attackingStat = templateStatsFor(attackingRecords, pair.forTemplateId);
    const defendingStat = templateStatsFor(defendingRecords, pair.againstTemplateId);
    const strength = classifyCrossStrength(attackingStat.pct, defendingStat.pct, attackingStat.total, defendingStat.total);
    const combinedConfidence = Math.round((attackingStat.pct + defendingStat.pct) / 2);

    const attackingTeamLabel = isSharedMatchPattern
      ? homeTeam?.shortName ?? "Equipo 1"
      : pair.side === "home"
        ? homeTeam?.shortName ?? "Equipo local"
        : awayTeam?.shortName ?? "Equipo visitante";
    const defendingTeamLabel = isSharedMatchPattern
      ? awayTeam?.shortName ?? "Equipo 2"
      : pair.side === "home"
        ? awayTeam?.shortName ?? "Equipo visitante"
        : homeTeam?.shortName ?? "Equipo local";

    const strengthLabel: Record<CrossPatternStrength, string> = {
      muy_fuerte: "muy fuerte",
      fuerte: "fuerte",
      moderado: "moderada",
      debil: "débil",
      contradictorio: "contradictoria",
    };

    const conclusion = isSharedMatchPattern
      ? strength === "contradictorio"
        ? `Señal contradictoria: ${attackingTeamLabel} cumple ${attackingStat.hits} de ${attackingStat.total}, mientras ${defendingTeamLabel} cumple ${defendingStat.hits} de ${defendingStat.total}.`
        : `Coincidencia ${strengthLabel[strength]}: ${attackingTeamLabel} cumple ${attackingStat.hits} de ${attackingStat.total} y ${defendingTeamLabel} cumple ${defendingStat.hits} de ${defendingStat.total} para ${market?.name ?? "el mercado"}.`
      : strength === "contradictorio"
        ? `Señal contradictoria: ${attackingTeamLabel} solo cumple ${attackingStat.hits} de ${attackingStat.total}, mientras ${defendingTeamLabel} lo permite ${defendingStat.hits} de ${defendingStat.total}.`
        : `Coincidencia ${strengthLabel[strength]} para ${market?.name ?? "el mercado"} (${attackingTeamLabel}).`;

    const risks: string[] = [];
    if (attackingRecords.length < 6 || defendingRecords.length < 6) {
      risks.push("La muestra disponible es limitada para uno de los dos equipos.");
    }
    if (strength === "contradictorio") {
      risks.push("Las tendencias de ambos equipos no coinciden en la misma dirección.");
    }
    if (Math.abs(attackingStat.pct - defendingStat.pct) > 25 && strength !== "contradictorio") {
      risks.push("Existe cierta dispersión entre el dato ofensivo y el defensivo.");
    }

    return {
      id: `cross-${attackingTeamId}-${defendingTeamId}-${pair.marketId}`,
      category: market?.category ?? "goles",
      marketId: pair.marketId,
      marketLabel: market?.name ?? pair.marketId,
      teamAId: attackingTeamId,
      teamBId: defendingTeamId,
      teamAStat: {
        description: `Cumple en ${attackingStat.hits} de sus últimos ${attackingStat.total} partidos`,
        hits: attackingStat.hits,
        total: attackingStat.total,
        percentage: attackingStat.pct,
      },
      teamBStat: {
        description: `${isSharedMatchPattern ? "También cumple" : "Lo permite"} en ${defendingStat.hits} de sus últimos ${defendingStat.total} partidos`,
        hits: defendingStat.hits,
        total: defendingStat.total,
        percentage: defendingStat.pct,
      },
      combinedConfidence,
      strength,
      conclusion,
      risks,
    };
  });

  // Pares construidos sobre un campo opcional (descanso, tarjetas del rival) sin ningún
  // partido con ese dato real en ninguno de los dos equipos no aportan nada mostrable
  // ("cumple en 0 de sus últimos 0 partidos" no es un patrón, es la ausencia de muestra).
  return crossPairPatterns
    .filter((p) => p.teamAStat.total > 0 && p.teamBStat.total > 0)
    .sort((a, b) => b.combinedConfidence - a.combinedConfidence);
}

/**
 * "Peor caso combinado": junta los partidos de ambos equipos en una sola
 * muestra (para goles/córners/remates/tiros al arco totales del partido, y
 * también para tarjetas amarillas aunque ahí no exista un "total del
 * partido" real, ver poolAcrossTeams) y calcula el techo/piso real de esa
 * muestra conjunta — ej. "ni [A] ni [B] tuvieron un partido con más de 12
 * córners en su muestra reciente". No se mezcla con computeCrossPatterns:
 * alimenta la pestaña "Rangos", separada de "Patrones cruzados".
 */
export function computeExtremeCrossPatterns(
  homeTeamId: string,
  homeRecords: TeamMatchRecord[],
  awayTeamId: string,
  awayRecords: TeamMatchRecord[]
): CrossPattern[] {
  const homeTeam = getTeamById(homeTeamId);
  const awayTeam = getTeamById(awayTeamId);
  const homeLabel = homeTeam?.shortName ?? "el equipo local";
  const awayLabel = awayTeam?.shortName ?? "el equipo visitante";
  const patterns: CrossPattern[] = [];

  EXTREME_STAT_DEFINITIONS.filter((def) => def.poolAcrossTeams).forEach((def) => {
    const homeValues = homeRecords.map(def.value);
    const awayValues = awayRecords.map(def.value);
    const pooled = [...homeValues, ...awayValues];
    if (homeValues.length === 0 || awayValues.length === 0) return;

    const strength = classifyCrossStrength(100, 100, homeValues.length, awayValues.length);
    const risks: string[] = [];
    if (homeValues.length < 6 || awayValues.length < 6) risks.push("La muestra disponible es limitada para uno de los dos equipos.");

    const max = Math.max(...pooled);
    const ceilingLine = round1(max + 0.5);
    patterns.push({
      id: `cross-extreme-${homeTeamId}-${awayTeamId}-${def.key}-ceiling`,
      category: def.category,
      marketId: `${def.key}_extreme_under`,
      marketLabel: `Techo dinámico de ${def.label}`,
      teamAId: homeTeamId,
      teamBId: awayTeamId,
      teamAStat: {
        description: `Máximo real en sus últimos ${homeValues.length} partidos: ${Math.max(...homeValues)}`,
        hits: homeValues.length,
        total: homeValues.length,
        percentage: 100,
      },
      teamBStat: {
        description: `Máximo real en sus últimos ${awayValues.length} partidos: ${Math.max(...awayValues)}`,
        hits: awayValues.length,
        total: awayValues.length,
        percentage: 100,
      },
      combinedConfidence: 100,
      strength,
      conclusion: `Ni ${homeLabel} ni ${awayLabel} tuvieron un partido con más de ${max} ${def.label} en su muestra reciente (${homeValues.length} y ${awayValues.length} partidos respectivamente) — el peor caso combinado se queda por debajo de ${ceilingLine}.`,
      risks,
    });

    const min = Math.min(...pooled);
    if (min > 0) {
      const floorLine = round1(min - 0.5);
      patterns.push({
        id: `cross-extreme-${homeTeamId}-${awayTeamId}-${def.key}-floor`,
        category: def.category,
        marketId: `${def.key}_extreme_over`,
        marketLabel: `Piso dinámico de ${def.label}`,
        teamAId: homeTeamId,
        teamBId: awayTeamId,
        teamAStat: {
          description: `Mínimo real en sus últimos ${homeValues.length} partidos: ${Math.min(...homeValues)}`,
          hits: homeValues.length,
          total: homeValues.length,
          percentage: 100,
        },
        teamBStat: {
          description: `Mínimo real en sus últimos ${awayValues.length} partidos: ${Math.min(...awayValues)}`,
          hits: awayValues.length,
          total: awayValues.length,
          percentage: 100,
        },
        combinedConfidence: 100,
        strength,
        conclusion: `Tanto en los partidos de ${homeLabel} como en los de ${awayLabel} siempre hubo al menos ${min} ${def.label} — el peor caso combinado se mantiene por encima de ${floorLine}.`,
        risks,
      });
    }
  });

  return patterns;
}

export function ratioMeetingThreshold(
  records: TeamMatchRecord[],
  key: keyof TeamMatchRecord,
  comparator: "gt" | "lt" | "gte" | "lte",
  threshold: number
): { hits: number; total: number; pct: number } {
  const total = records.length;
  if (total === 0) return { hits: 0, total: 0, pct: 0 };
  const hits = records.filter((r) => {
    const value = r[key] as number;
    if (comparator === "gt") return value > threshold;
    if (comparator === "lt") return value < threshold;
    if (comparator === "gte") return value >= threshold;
    return value <= threshold;
  }).length;
  return { hits, total, pct: Math.round((hits / total) * 100) };
}
