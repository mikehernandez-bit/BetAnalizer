import type { TennisAnalysis, TennisAuditSummary, TennisMarketAuditResult, TennisRecordedOutcome } from "@/types/tennis";

export interface TennisPredictionAuditItem {
  id: string;
  predictedWinner: string;
  outcome?: Pick<TennisRecordedOutcome, "winner">;
}

export function summarizeTennisPredictions(items: TennisPredictionAuditItem[]): TennisAuditSummary {
  const resolved = items.filter((item) => item.outcome);
  const hits = resolved.filter((item) => item.outcome?.winner === item.predictedWinner).length;
  const audited = resolved.length;
  return {
    audited,
    hits,
    misses: audited - hits,
    pending: items.length - audited,
    accuracy: audited ? Math.round((hits / audited) * 100) : 0,
  };
}

interface ParsedSet {
  player1Games: number;
  player2Games: number;
}

function parseOutcomeSets(analysis: TennisAnalysis, outcome: TennisRecordedOutcome): ParsedSet[] {
  const winnerIsPlayer1 = outcome.winner === analysis.input.player1.name;
  return outcome.score.trim().split(/\s+/).map((token) => {
    const match = token.match(/^(\d{1,2})(?:\(\d{1,2}\))?-(\d{1,2})(?:\(\d{1,2}\))?$/);
    if (!match) throw new Error(`Set inválido: ${token}. Usa marcadores como 6-3 4-6 6-2.`);
    const winnerGames = Number(match[1]);
    const loserGames = Number(match[2]);
    return winnerIsPlayer1
      ? { player1Games: winnerGames, player2Games: loserGames }
      : { player1Games: loserGames, player2Games: winnerGames };
  });
}

function overUnder(selection: string, value: number): boolean | undefined {
  const match = selection.match(/^(Más|Menos) de (\d+(?:\.\d+)?)/);
  if (!match) return undefined;
  const line = Number(match[2]);
  return match[1] === "Más" ? value > line : value < line;
}

function handicap(selection: string, suffix: "juegos" | "sets", player1: string, player2: string, player1Value: number, player2Value: number): boolean | undefined {
  const match = selection.match(new RegExp(`\\s([+-]\\d+(?:\\.\\d+)?)\\s${suffix}$`));
  if (!match) return undefined;
  const player = selection.slice(0, match.index).trim();
  const adjustment = Number(match[1]);
  if (player === player1) return player1Value - player2Value + adjustment > 0;
  if (player === player2) return player2Value - player1Value + adjustment > 0;
  return undefined;
}

function exactSet(selection: string, set: ParsedSet | undefined, player1: string, player2: string): boolean | undefined {
  if (!set) return undefined;
  const match = selection.match(/\s(\d{1,2})-(\d{1,2})$/);
  if (!match) return undefined;
  const player = selection.slice(0, match.index).trim();
  const expectedPlayerGames = Number(match[1]);
  const expectedOpponentGames = Number(match[2]);
  if (player === player1) return set.player1Games === expectedPlayerGames && set.player2Games === expectedOpponentGames;
  if (player === player2) return set.player2Games === expectedPlayerGames && set.player1Games === expectedOpponentGames;
  return undefined;
}

export function auditTennisMarkets(analysis: TennisAnalysis, outcome: TennisRecordedOutcome): TennisMarketAuditResult[] {
  const sets = parseOutcomeSets(analysis, outcome);
  const p1 = analysis.input.player1.name;
  const p2 = analysis.input.player2.name;
  const setWinners = sets.map((set) => set.player1Games > set.player2Games ? p1 : p2);
  const p1Sets = setWinners.filter((winner) => winner === p1).length;
  const p2Sets = sets.length - p1Sets;
  const p1Games = sets.reduce((sum, set) => sum + set.player1Games, 0);
  const p2Games = sets.reduce((sum, set) => sum + set.player2Games, 0);
  const actualScore = `${outcome.winner} ${Math.max(p1Sets, p2Sets)}-${Math.min(p1Sets, p2Sets)}`;

  return analysis.markets.map((market) => {
    let hit: boolean | undefined;
    let actual = outcome.winner;
    switch (market.id) {
      case "match-winner": hit = market.selection === outcome.winner; break;
      case "set-1-winner": actual = setWinners[0] ?? "Sin set"; hit = market.selection === setWinners[0]; break;
      case "set-2-winner": actual = setWinners[1] ?? "Sin set"; hit = market.selection === setWinners[1]; break;
      case "match-total-games": actual = `${p1Games + p2Games} juegos`; hit = overUnder(market.selection, p1Games + p2Games); break;
      case "total-games-handicap": actual = `${p1} ${p1Games}–${p2Games} ${p2}`; hit = handicap(market.selection, "juegos", p1, p2, p1Games, p2Games); break;
      case "match-handicap": actual = `${p1} ${p1Sets}–${p2Sets} ${p2}`; hit = handicap(market.selection, "sets", p1, p2, p1Sets, p2Sets); break;
      case "set-1-games-handicap": actual = sets[0] ? `${sets[0].player1Games}-${sets[0].player2Games}` : "Sin set"; hit = sets[0] ? handicap(market.selection, "juegos", p1, p2, sets[0].player1Games, sets[0].player2Games) : undefined; break;
      case "set-2-games-handicap": actual = sets[1] ? `${sets[1].player1Games}-${sets[1].player2Games}` : "Sin set"; hit = sets[1] ? handicap(market.selection, "juegos", p1, p2, sets[1].player1Games, sets[1].player2Games) : undefined; break;
      case "set-1-total": actual = sets[0] ? `${sets[0].player1Games + sets[0].player2Games} juegos` : "Sin set"; hit = sets[0] ? overUnder(market.selection, sets[0].player1Games + sets[0].player2Games) : undefined; break;
      case "set-2-total": actual = sets[1] ? `${sets[1].player1Games + sets[1].player2Games} juegos` : "Sin set"; hit = sets[1] ? overUnder(market.selection, sets[1].player1Games + sets[1].player2Games) : undefined; break;
      case "set-1-score": actual = sets[0] ? `${setWinners[0]} ${Math.max(sets[0].player1Games, sets[0].player2Games)}-${Math.min(sets[0].player1Games, sets[0].player2Games)}` : "Sin set"; hit = exactSet(market.selection, sets[0], p1, p2); break;
      case "set-2-score": actual = sets[1] ? `${setWinners[1]} ${Math.max(sets[1].player1Games, sets[1].player2Games)}-${Math.min(sets[1].player1Games, sets[1].player2Games)}` : "Sin set"; hit = exactSet(market.selection, sets[1], p1, p2); break;
      case "total-sets": actual = `${sets.length} sets`; hit = overUnder(market.selection, sets.length); break;
      case "both-win-set": { const yes = p1Sets > 0 && p2Sets > 0; actual = yes ? "Sí" : "No"; hit = market.selection === actual; break; }
      case "correct-match-score": actual = `${outcome.winner} gana ${Math.max(p1Sets, p2Sets)}-${Math.min(p1Sets, p2Sets)}`; hit = market.selection === actual; break;
      case "player-1-wins-set": actual = p1Sets > 0 ? "Sí" : "No"; hit = market.selection === actual; break;
      case "player-2-wins-set": actual = p2Sets > 0 ? "Sí" : "No"; hit = market.selection === actual; break;
      default: actual = actualScore;
    }
    return { marketId: market.id, market: market.market, selection: market.selection, actual, status: hit === undefined ? "void" : hit ? "hit" : "miss" };
  });
}

export function summarizeTennisMarketAudits(audits: TennisMarketAuditResult[], pending: number): TennisAuditSummary {
  const hits = audits.filter((item) => item.status === "hit").length;
  const misses = audits.filter((item) => item.status === "miss").length;
  const audited = hits + misses;
  return { audited, hits, misses, pending, accuracy: audited ? Math.round(hits / audited * 100) : 0 };
}
