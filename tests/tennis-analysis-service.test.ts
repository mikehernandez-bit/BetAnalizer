import { describe, expect, it } from "vitest";
import { analyzeTennisMatch, formatTennisHistoryText, parseTennisHistoryText, validateTennisInput } from "@/services/tennis-analysis-service";
import {
  ALIASSSIME_CINCINNATI_HISTORY,
  ALIASSIME_CINCINNATI_R8_HISTORY,
  ALVES_CANCUN_HISTORY,
  ANDREEVA_CINCINNATI_HISTORY,
  ANISIMOVA_CINCINNATI_HISTORY,
  BARRIOS_VERA_CANCUN_HISTORY,
  BEJLEK_CINCINNATI_HISTORY,
  BLANCH_CANCUN_HISTORY,
  BLANCHET_QUEBEC_HISTORY,
  BONZI_QUEBEC_HISTORY,
  BORGES_CINCINNATI_HISTORY,
  BOULAIS_QUEBEC_HISTORY,
  BOUZKOVA_CINCINNATI_HISTORY,
  BUENO_KINGSTON_HISTORY,
  CERUNDOLO_CINCINNATI_HISTORY,
  CHAN_QUEBEC_HISTORY,
  CIRSTEA_CINCINNATI_HISTORY,
  COBOLLI_CINCINNATI_HISTORY,
  COLEMAN_WONG_CANCUN_HISTORY,
  DANIEL_QUEBEC_HISTORY,
  DE_JONG_QUEBEC_HISTORY,
  DE_MINAUR_CINCINNATI_HISTORY,
  ECHARGUI_CANCUN_HISTORY,
  FARIA_CINCINNATI_HISTORY,
  FARIA_CINCINNATI_R8_HISTORY,
  FEARNLEY_QUEBEC_HISTORY,
  FILS_CINCINNATI_HISTORY,
  FRITZ_CINCINNATI_HISTORY,
  GALARNEAU_QUEBEC_HISTORY,
  GAUFF_CINCINNATI_HISTORY,
  JACQUET_QUEBEC_HISTORY,
  JODAR_CINCINNATI_HISTORY,
  KEYS_CINCINNATI_HISTORY,
  KOSTYUK_CINCINNATI_HISTORY,
  KOUAME_CANCUN_HISTORY,
  KWON_QUEBEC_HISTORY,
  LLOYD_HARRIS_CANCUN_HISTORY,
  MAESTRELLI_QUEBEC_HISTORY,
  MAGADAN_CANCUN_HISTORY,
  MCDONALD_QUEBEC_HISTORY,
  MEDVEDEV_CINCINNATI_HISTORY,
  MEJIA_CANCUN_HISTORY,
  MENSIK_CINCINNATI_HISTORY,
  MOCHIZUKI_QUEBEC_HISTORY,
  MULLER_CANCUN_HISTORY,
  MUSETTI_CINCINNATI_HISTORY,
  NAKAGAWA_CANCUN_HISTORY,
  NAKASHIMA_CINCINNATI_HISTORY,
  NOSKOVA_CINCINNATI_HISTORY,
  OCONNELL_CINCINNATI_HISTORY,
  ONCLIN_CANCUN_HISTORY,
  PACHECO_CANCUN_HISTORY,
  PAUL_CINCINNATI_HISTORY,
  PARRY_CINCINNATI_HISTORY,
  PEGULA_CINCINNATI_HISTORY,
  POPYRIN_QUEBEC_HISTORY,
  PRIZMIC_QUEBEC_HISTORY,
  RUBLEV_CINCINNATI_HISTORY,
  RYBAKINA_CINCINNATI_HISTORY,
  SABALENKA_CINCINNATI_HISTORY,
  SABALENKA_CINCINNATI_R8_HISTORY,
  SAKELLARIDIS_QUEBEC_HISTORY,
  SCHWARZLER_KINGSTON_HISTORY,
  SHNAIDER_CINCINNATI_HISTORY,
  SKATOV_CANCUN_HISTORY,
  SWIATEK_CINCINNATI_HISTORY,
  SWEENY_QUEBEC_HISTORY,
  MIYOSHI_KINGSTON_HISTORY,
  TIAFOE_CINCINNATI_HISTORY,
  TIRANTE_CINCINNATI_HISTORY,
  UGO_CARABELLI_CANCUN_HISTORY,
  VIRTANEN_CANCUN_HISTORY,
  VUKIC_QUEBEC_HISTORY,
  WALTON_CINCINNATI_HISTORY,
  WILLWERTH_KINGSTON_HISTORY,
  XINYU_WANG_CINCINNATI_HISTORY,
  XIYU_WANG_CINCINNATI_HISTORY,
  ZVEREV_CINCINNATI_HISTORY,
  tennisEvents,
} from "@/data/tennis-events";
import type { TennisHistoryMatch, TennisMatchInput } from "@/types/tennis";

function history(wins: number, surface: TennisHistoryMatch["surface"] = "hard"): TennisHistoryMatch[] {
  return Array.from({ length: 20 }, (_, index) => {
    const won = index < wins;
    return {
      date: `2026-07-${String(28 - index).padStart(2, "0")}`,
      opponent: `Rival ${index + 1}`,
      surface,
      status: "completed" as const,
      sets: won
        ? [{ playerGames: 6, opponentGames: 3 }, { playerGames: 6, opponentGames: 4 }]
        : [{ playerGames: 4, opponentGames: 6 }, { playerGames: 3, opponentGames: 6 }],
    };
  });
}

function input(): TennisMatchInput {
  return {
    tournament: "ATP Prueba",
    date: "2026-08-18",
    surface: "hard",
    bestOf: 3,
    player1: { name: "Jugador Uno", ranking: 10, matches: history(16) },
    player2: { name: "Jugador Dos", ranking: 70, matches: history(6) },
  };
}

describe("tennis analysis service", () => {
  it("parses the compact 20-match input format and preserves RET status", () => {
    const parsed = parseTennisHistoryText([
      "2026-08-10 | Dura | Rival A | 6-4 3-6 6-2",
      "2026-08-04 | Arcilla | Rival B | 6-7(5) 6-3 2-1 | RET",
    ].join("\n"));

    expect(parsed.errors).toEqual([]);
    expect(parsed.matches).toHaveLength(2);
    expect(parsed.matches[0].surface).toBe("hard");
    expect(parsed.matches[1].status).toBe("retired");
    expect(parsed.matches[1].sets[0]).toEqual({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 5,
      opponentTiebreakPoints: 7,
    });
  });

  it("requires exactly 20 official entries for each player", () => {
    const invalid = input();
    invalid.player2.matches = invalid.player2.matches.slice(0, 19);
    expect(validateTennisInput(invalid)).toContain("Jugador Dos debe tener exactamente 20 partidos.");
  });

  it("produces every requested tennis market without treating exact scores as strong bets", () => {
    const analysis = analyzeTennisMatch(input());
    const categories = new Set(analysis.markets.map((item) => item.category));

    expect(analysis.projectedWinner).toBe("Jugador Uno");
    expect(analysis.projectedWinnerProbability).toBeGreaterThan(60);
    expect(analysis.markets).toHaveLength(17);
    expect(categories).toEqual(new Set([
      "match_winner",
      "set_winner",
      "match_total_games",
      "total_games_handicap",
      "match_set_handicap",
      "set_games_handicap",
      "set_total_games",
      "set_score",
      "match_total_sets",
      "both_win_set",
      "correct_set_score",
      "player_wins_set",
    ]));
    expect(analysis.markets.find((item) => item.id === "correct-match-score")?.recommendation).not.toBe("fuerte");
  });

  it("preserves the 20+20 Cincinnati screenshot rows and exact extended tiebreaks", () => {
    expect(RUBLEV_CINCINNATI_HISTORY).toHaveLength(20);
    expect(BORGES_CINCINNATI_HISTORY).toHaveLength(20);
    expect(RUBLEV_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);
    expect(BORGES_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);
    expect(RUBLEV_CINCINNATI_HISTORY[8].sets[4]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 12,
      opponentTiebreakPoints: 14,
    });
    expect(BORGES_CINCINNATI_HISTORY[8].sets[0]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 9,
      opponentTiebreakPoints: 11,
    });
    expect(parseTennisHistoryText(formatTennisHistoryText(RUBLEV_CINCINNATI_HISTORY)).matches).toMatchObject(
      RUBLEV_CINCINNATI_HISTORY.map(({ playerIsHome, winner, ...rest }) => rest)
    );
    expect(parseTennisHistoryText(formatTennisHistoryText(BORGES_CINCINNATI_HISTORY)).matches).toMatchObject(
      BORGES_CINCINNATI_HISTORY.map(({ playerIsHome, winner, ...rest }) => rest)
    );
    expect(tennisEvents[0].actualResult).toMatchObject({ winner: "Nuno Borges", sets: [{ playerGames: 3, opponentGames: 6 }, { playerGames: 4, opponentGames: 6 }] });
  });

  it("preserves the 20+20 Brandon Nakashima and Daniil Medvedev screenshot rows", () => {
    expect(NAKASHIMA_CINCINNATI_HISTORY).toHaveLength(20);
    expect(MEDVEDEV_CINCINNATI_HISTORY).toHaveLength(20);
    expect(NAKASHIMA_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);
    expect(MEDVEDEV_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);

    // Verify Nakashima 5-set Wimbledon match tiebreak
    expect(NAKASHIMA_CINCINNATI_HISTORY[11].sets[4]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 7,
      opponentTiebreakPoints: 10,
    });

    // Verify Medvedev walkover match
    expect(MEDVEDEV_CINCINNATI_HISTORY[16]).toMatchObject({
      date: "2026-05-09",
      opponent: "Tomas Machac",
      status: "walkover",
      sets: [],
    });

    const event = tennisEvents.find((item) => item.id === "atp-cincinnati-2026-nakashima-medvedev");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(19); // 19 completed + 1 WO
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Jan-Lennard Struff", "Daniel Altmaier", "Tomas Martin Etcheverry"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Willwerth and Gonzalo Bueno screenshot rows", () => {
    expect(WILLWERTH_KINGSTON_HISTORY).toHaveLength(20);
    expect(BUENO_KINGSTON_HISTORY).toHaveLength(20);
    expect(WILLWERTH_KINGSTON_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);
    expect(BUENO_KINGSTON_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);

    // Verify Willwerth tiebreak vs Yi Zhou
    expect(WILLWERTH_KINGSTON_HISTORY[4].sets[1]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 8,
      opponentTiebreakPoints: 6,
    });

    // Verify Bueno tiebreak vs Tiago Pereira
    expect(BUENO_KINGSTON_HISTORY[6].sets[2]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 7,
      opponentTiebreakPoints: 5,
    });

    const event = tennisEvents.find((item) => item.id === "atp-challenger-kingston-2026-willwerth-bueno");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.profiles.player2.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Jaime Faria and Adam Walton screenshot rows", () => {
    expect(FARIA_CINCINNATI_HISTORY).toHaveLength(20);
    expect(WALTON_CINCINNATI_HISTORY).toHaveLength(20);
    expect(FARIA_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);
    expect(WALTON_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);

    // Verify Faria tiebreak vs Christopher O'Connell
    expect(FARIA_CINCINNATI_HISTORY[5].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 10,
      opponentTiebreakPoints: 8,
    });

    // Verify Walton tiebreak vs Jacob Fearnley
    expect(WALTON_CINCINNATI_HISTORY[8].sets[1]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 8,
      opponentTiebreakPoints: 10,
    });

    const event = tennisEvents.find((item) => item.id === "atp-cincinnati-2026-faria-walton");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Ženson Bruksbi"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Jesper De Jong and Dane Sweeny screenshot rows", () => {
    expect(DE_JONG_QUEBEC_HISTORY).toHaveLength(20);
    expect(SWEENY_QUEBEC_HISTORY).toHaveLength(20);
    expect(DE_JONG_QUEBEC_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);
    expect(SWEENY_QUEBEC_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);

    // Verify De Jong tiebreak vs Enrico Dalla Valle
    expect(DE_JONG_QUEBEC_HISTORY[8].sets[1]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 9,
      opponentTiebreakPoints: 7,
    });

    // Verify Sweeny tiebreak vs Jacob Fearnley (18-16)
    expect(SWEENY_QUEBEC_HISTORY[9].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 18,
      opponentTiebreakPoints: 16,
    });

    const event = tennisEvents.find((item) => item.id === "atp-challenger-quebec-2026-dejong-sweeny");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Juan Manuel Cerundolo and Felix Auger-Aliassime screenshot rows", () => {
    expect(CERUNDOLO_CINCINNATI_HISTORY).toHaveLength(20);
    expect(ALIASSSIME_CINCINNATI_HISTORY).toHaveLength(20);
    expect(CERUNDOLO_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);
    expect(ALIASSSIME_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);

    // Verify Cerundolo tiebreak vs Arthur Rinderknech
    expect(CERUNDOLO_CINCINNATI_HISTORY[0].sets[1]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 7,
      opponentTiebreakPoints: 3,
    });

    // Verify Auger-Aliassime tiebreak vs Francis Tiafoe (12-14)
    expect(ALIASSSIME_CINCINNATI_HISTORY[6].sets[2]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 12,
      opponentTiebreakPoints: 14,
    });

    const event = tennisEvents.find((item) => item.id === "atp-cincinnati-2026-cerundolo-aliassime");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Aležandro Davidovich Fokina"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Francesco Maestrelli and Alexei Popyrin screenshot rows", () => {
    expect(MAESTRELLI_QUEBEC_HISTORY).toHaveLength(20);
    expect(POPYRIN_QUEBEC_HISTORY).toHaveLength(20);
    expect(MAESTRELLI_QUEBEC_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);
    expect(POPYRIN_QUEBEC_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);

    // Verify Maestrelli tiebreak vs Bu Yunchaokete
    expect(MAESTRELLI_QUEBEC_HISTORY[0].sets[0]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 6,
      opponentTiebreakPoints: 8,
    });

    // Verify Popyrin tiebreak vs Clement Tabur
    expect(POPYRIN_QUEBEC_HISTORY[12].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 7,
      opponentTiebreakPoints: 2,
    });

    const event = tennisEvents.find((item) => item.id === "atp-challenger-quebec-2026-maestrelli-popyrin");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Siago Agustin Tirante"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Benjamin Bonzi and Justin Boulais screenshot rows", () => {
    expect(BONZI_QUEBEC_HISTORY).toHaveLength(20);
    expect(BOULAIS_QUEBEC_HISTORY).toHaveLength(20);
    expect(BONZI_QUEBEC_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);
    expect(BOULAIS_QUEBEC_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);

    // Verify Bonzi tiebreak vs Dusan Lajovic
    expect(BONZI_QUEBEC_HISTORY[0].sets[2]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 7,
      opponentTiebreakPoints: 9,
    });

    // Verify Boulais tiebreak vs Zhang Zhizhen
    expect(BOULAIS_QUEBEC_HISTORY[5].sets[1]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 8,
      opponentTiebreakPoints: 6,
    });

    const event = tennisEvents.find((item) => item.id === "atp-challenger-quebec-2026-bonzi-boulais");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Žai Dilan Hara Friend", "Mitšael Mmoh"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Joel Schwarzler and Kenta Miyoshi screenshot rows", () => {
    expect(SCHWARZLER_KINGSTON_HISTORY).toHaveLength(20);
    expect(MIYOSHI_KINGSTON_HISTORY).toHaveLength(20);
    expect(SCHWARZLER_KINGSTON_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);
    expect(MIYOSHI_KINGSTON_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);

    // Verify Schwarzler tiebreak vs Aziz Dougaz
    expect(SCHWARZLER_KINGSTON_HISTORY[4].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 7,
      opponentTiebreakPoints: 2,
    });

    // Verify Miyoshi tiebreak vs Renta Tokuda (9-7)
    expect(MIYOSHI_KINGSTON_HISTORY[13].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 9,
      opponentTiebreakPoints: 7,
    });

    const event = tennisEvents.find((item) => item.id === "atp-challenger-kingston-2026-schwarzler-miyoshi");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Aryna Sabalenka and Wang Xinyu screenshot rows", () => {
    expect(SABALENKA_CINCINNATI_HISTORY).toHaveLength(20);
    expect(XINYU_WANG_CINCINNATI_HISTORY).toHaveLength(20);
    expect(SABALENKA_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);
    expect(XINYU_WANG_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-18")).toBe(true);

    // Verify Sabalenka tiebreak vs McCartney Kessler (11-9)
    expect(SABALENKA_CINCINNATI_HISTORY[6].sets[1]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 11,
      opponentTiebreakPoints: 9,
    });

    // Verify Wang Xinyu tiebreak vs Alina Charaeva
    expect(XINYU_WANG_CINCINNATI_HISTORY[16].sets[2]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 1,
      opponentTiebreakPoints: 7,
    });

    const event = tennisEvents.find((item) => item.id === "wta-cincinnati-2026-sabalenka-wang");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(18); // 18 completed + 1 WO + 1 ret
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Naomi Osaka", "Kasatkina, Darya"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Rafael Jodar and Flavio Cobolli screenshot rows", () => {
    expect(JODAR_CINCINNATI_HISTORY).toHaveLength(20);
    expect(COBOLLI_CINCINNATI_HISTORY).toHaveLength(20);
    expect(JODAR_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(COBOLLI_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Jódar tiebreak vs Alejandro Tabilo (6-8)
    expect(JODAR_CINCINNATI_HISTORY[8].sets[0]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 6,
      opponentTiebreakPoints: 8,
    });

    // Verify Cobolli tiebreak vs Mariano Navone (10-8)
    expect(COBOLLI_CINCINNATI_HISTORY[8].sets[3]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 10,
      opponentTiebreakPoints: 8,
    });

    const event = tennisEvents.find((item) => item.id === "atp-cincinnati-2026-jodar-cobolli");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(19); // 19 completed + 1 WO
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Aleksander Zverev", "Žames Duckwors"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Thiago Agustín Tirante and Jakub Mensik screenshot rows", () => {
    expect(TIRANTE_CINCINNATI_HISTORY).toHaveLength(20);
    expect(MENSIK_CINCINNATI_HISTORY).toHaveLength(20);
    expect(TIRANTE_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(MENSIK_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Tirante 3-tiebreak match vs Jan Choinski
    expect(TIRANTE_CINCINNATI_HISTORY[2].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 11,
      opponentTiebreakPoints: 9,
    });

    // Verify Mensik extended tiebreak vs Mariano Navone (13-11)
    expect(MENSIK_CINCINNATI_HISTORY[15].sets[4]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 13,
      opponentTiebreakPoints: 11,
    });

    const event = tennisEvents.find((item) => item.id === "atp-cincinnati-2026-tirante-mensik");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 WO
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Aleksei Popirin", "Tobi Samuel"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Alexander Zverev and Tommy Paul screenshot rows", () => {
    expect(ZVEREV_CINCINNATI_HISTORY).toHaveLength(20);
    expect(PAUL_CINCINNATI_HISTORY).toHaveLength(20);
    expect(ZVEREV_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(PAUL_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Zverev extended tiebreak vs Rafael Collignon (12-10)
    expect(ZVEREV_CINCINNATI_HISTORY[11].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 12,
      opponentTiebreakPoints: 10,
    });

    // Verify Paul 3-tiebreak match vs Tomas Martin Etcheverry
    expect(PAUL_CINCINNATI_HISTORY[19].sets[2]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 9,
      opponentTiebreakPoints: 7,
    });

    const event = tennisEvents.find((item) => item.id === "atp-cincinnati-2026-zverev-paul");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Valentin Roir"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Arthur Fils and Alex De Minaur screenshot rows", () => {
    expect(FILS_CINCINNATI_HISTORY).toHaveLength(20);
    expect(DE_MINAUR_CINCINNATI_HISTORY).toHaveLength(20);
    expect(FILS_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(DE_MINAUR_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Fils extended tiebreak vs Kameron Norrie (10-8)
    expect(FILS_CINCINNATI_HISTORY[3].sets[1]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 10,
      opponentTiebreakPoints: 8,
    });

    // Verify De Minaur extended tiebreak vs Gabriel Diallo (10-8)
    expect(DE_MINAUR_CINCINNATI_HISTORY[13].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 10,
      opponentTiebreakPoints: 8,
    });

    const event = tennisEvents.find((item) => item.id === "atp-cincinnati-2026-fils-de-minaur");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.profiles.player2.matchesUsed).toBe(19); // 19 completed + 1 WO
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Brandon Nakašima", "Kameron Norrie", "Zatšari Svažda"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Iga Swiatek and Diane Parry screenshot rows", () => {
    expect(SWIATEK_CINCINNATI_HISTORY).toHaveLength(20);
    expect(PARRY_CINCINNATI_HISTORY).toHaveLength(20);
    expect(SWIATEK_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(PARRY_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Swiatek extended tiebreak vs Aleksandra Eala (9-11)
    expect(SWIATEK_CINCINNATI_HISTORY[8].sets[0]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 9,
      opponentTiebreakPoints: 11,
    });

    // Verify Parry extended tiebreak vs Amanda Anisimova (10-3)
    expect(PARRY_CINCINNATI_HISTORY[14].sets[2]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 10,
      opponentTiebreakPoints: 3,
    });

    const event = tennisEvents.find((item) => item.id === "wta-cincinnati-2026-swiatek-parry");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Sorana Cirstea and Jessica Pegula screenshot rows", () => {
    expect(CIRSTEA_CINCINNATI_HISTORY).toHaveLength(20);
    expect(PEGULA_CINCINNATI_HISTORY).toHaveLength(20);
    expect(CIRSTEA_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(PEGULA_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Cirstea extended tiebreak vs Linda Noskova (9-11)
    expect(CIRSTEA_CINCINNATI_HISTORY[3].sets[2]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 9,
      opponentTiebreakPoints: 11,
    });

    // Verify Pegula extended tiebreak vs Madison Keys (10-8)
    expect(PEGULA_CINCINNATI_HISTORY[16].sets[1]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 10,
      opponentTiebreakPoints: 8,
    });

    const event = tennisEvents.find((item) => item.id === "wta-cincinnati-2026-cirstea-pegula");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Kimberli Birrell", "Linda Noskova", "Kori Gauff", "Arina Sabalenka"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Marta Kostyuk and Mirra Andreeva screenshot rows and 1-1 H2H", () => {
    expect(KOSTYUK_CINCINNATI_HISTORY).toHaveLength(20);
    expect(ANDREEVA_CINCINNATI_HISTORY).toHaveLength(20);
    expect(KOSTYUK_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(ANDREEVA_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Kostyuk tiebreak vs Linda Noskova (7-1)
    expect(KOSTYUK_CINCINNATI_HISTORY[19].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 7,
      opponentTiebreakPoints: 1,
    });

    // Verify Andreeva extended tiebreak vs Hailey Baptiste (10-8)
    expect(ANDREEVA_CINCINNATI_HISTORY[19].sets[1]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 10,
      opponentTiebreakPoints: 8,
    });

    const event = tennisEvents.find((item) => item.id === "wta-cincinnati-2026-kostyuk-andreeva");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.headToHead).toMatchObject({ matches: 2, player1Wins: 1, player2Wins: 1 });
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Viktoriža Golubic"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Diana Shnaider and Elena Rybakina screenshot rows", () => {
    expect(SHNAIDER_CINCINNATI_HISTORY).toHaveLength(20);
    expect(RYBAKINA_CINCINNATI_HISTORY).toHaveLength(20);
    expect(SHNAIDER_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(RYBAKINA_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Shnaider tiebreak vs Maja Chwalinska (7-3)
    expect(SHNAIDER_CINCINNATI_HISTORY[0].sets[1]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 7,
      opponentTiebreakPoints: 3,
    });

    // Verify Rybakina tiebreak vs Naomi Osaka (7-5)
    expect(RYBAKINA_CINCINNATI_HISTORY[4].sets[1]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 7,
      opponentTiebreakPoints: 5,
    });

    const event = tennisEvents.find((item) => item.id === "wta-cincinnati-2026-shnaider-rybakina");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Iga Swiatek", "Ludmilla Samsonova", "Tatžana Maria", "Naomi Osaka"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Linda Noskova and Amanda Anisimova screenshot rows", () => {
    expect(NOSKOVA_CINCINNATI_HISTORY).toHaveLength(20);
    expect(ANISIMOVA_CINCINNATI_HISTORY).toHaveLength(20);
    expect(NOSKOVA_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(ANISIMOVA_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Noskova extended tiebreak vs Sorana Cirstea (11-9)
    expect(NOSKOVA_CINCINNATI_HISTORY[7].sets[2]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 11,
      opponentTiebreakPoints: 9,
    });

    // Verify Anisimova extended tiebreak vs Sofia Kenin (10-3)
    expect(ANISIMOVA_CINCINNATI_HISTORY[6].sets[2]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 10,
      opponentTiebreakPoints: 3,
    });

    const event = tennisEvents.find((item) => item.id === "wta-cincinnati-2026-noskova-anisimova");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(18); // 18 completed + 1 WO + 1 ret
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Madison Keis", "Diane Parri", "Žessika Pegula"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Stefanos Sakellaridis and Ugo Blanchet screenshot rows", () => {
    expect(SAKELLARIDIS_QUEBEC_HISTORY).toHaveLength(20);
    expect(BLANCHET_QUEBEC_HISTORY).toHaveLength(20);
    expect(SAKELLARIDIS_QUEBEC_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(BLANCHET_QUEBEC_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Sakellaridis extended tiebreak vs Clement Tabur (12-10)
    expect(SAKELLARIDIS_QUEBEC_HISTORY[8].sets[1]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 12,
      opponentTiebreakPoints: 10,
    });

    // Verify Blanchet 3-tiebreak match vs Rei Sakamoto
    expect(BLANCHET_QUEBEC_HISTORY[2].sets).toEqual([
      { playerGames: 7, opponentGames: 6, playerTiebreakPoints: 7, opponentTiebreakPoints: 3 },
      { playerGames: 6, opponentGames: 7, playerTiebreakPoints: 6, opponentTiebreakPoints: 8 },
      { playerGames: 6, opponentGames: 7, playerTiebreakPoints: 3, opponentTiebreakPoints: 7 },
    ]);

    const event = tennisEvents.find((item) => item.id === "atp-challenger-quebec-2026-sakellaridis-blanchet");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.profiles.player2.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Oliver Tarvet"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Dunkan Chan and Taro Daniel screenshot rows", () => {
    expect(CHAN_QUEBEC_HISTORY).toHaveLength(20);
    expect(DANIEL_QUEBEC_HISTORY).toHaveLength(20);
    expect(CHAN_QUEBEC_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(DANIEL_QUEBEC_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Chan tiebreak vs James McCabe (7-5)
    expect(CHAN_QUEBEC_HISTORY[4].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 7,
      opponentTiebreakPoints: 5,
    });

    // Verify Daniel tiebreak vs Dusan Lajovic (7-4)
    expect(DANIEL_QUEBEC_HISTORY[0].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 7,
      opponentTiebreakPoints: 4,
    });

    const event = tennisEvents.find((item) => item.id === "atp-challenger-quebec-2026-chan-daniel");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Kirian Jacquet and Aleksandar Vukic screenshot rows", () => {
    expect(JACQUET_QUEBEC_HISTORY).toHaveLength(20);
    expect(VUKIC_QUEBEC_HISTORY).toHaveLength(20);
    expect(JACQUET_QUEBEC_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(VUKIC_QUEBEC_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Jacquet extended tiebreak vs Andrea Guerrieri (11-9)
    expect(JACQUET_QUEBEC_HISTORY[13].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 11,
      opponentTiebreakPoints: 9,
    });

    // Verify Vukic double tiebreak vs Alexis Galarneau (7-2, 7-2)
    expect(VUKIC_QUEBEC_HISTORY[10].sets).toEqual([
      { playerGames: 7, opponentGames: 6, playerTiebreakPoints: 7, opponentTiebreakPoints: 2 },
      { playerGames: 7, opponentGames: 6, playerTiebreakPoints: 7, opponentTiebreakPoints: 2 },
    ]);

    const event = tennisEvents.find((item) => item.id === "atp-challenger-quebec-2026-jacquet-vukic");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Soon Woo Kwon and Shintaro Mochizuki screenshot rows", () => {
    expect(KWON_QUEBEC_HISTORY).toHaveLength(20);
    expect(MOCHIZUKI_QUEBEC_HISTORY).toHaveLength(20);
    expect(KWON_QUEBEC_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(MOCHIZUKI_QUEBEC_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Kwon extended tiebreak vs Arthur Gea (10-8)
    expect(KWON_QUEBEC_HISTORY[7].sets[1]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 10,
      opponentTiebreakPoints: 8,
    });

    // Verify Mochizuki 5-set win vs Clement Tabur
    expect(MOCHIZUKI_QUEBEC_HISTORY[13].sets).toEqual([
      { playerGames: 1, opponentGames: 6 },
      { playerGames: 7, opponentGames: 5 },
      { playerGames: 2, opponentGames: 6 },
      { playerGames: 6, opponentGames: 3 },
      { playerGames: 6, opponentGames: 1 },
    ]);

    const event = tennisEvents.find((item) => item.id === "atp-challenger-quebec-2026-kwon-mochizuki");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Jaime Faria and Lorenzo Musetti screenshot rows", () => {
    expect(FARIA_CINCINNATI_R8_HISTORY).toHaveLength(20);
    expect(MUSETTI_CINCINNATI_HISTORY).toHaveLength(20);
    expect(FARIA_CINCINNATI_R8_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(MUSETTI_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Faria match 1 vs Adam Walton
    expect(FARIA_CINCINNATI_R8_HISTORY[0].sets).toEqual([
      { playerGames: 4, opponentGames: 6 },
      { playerGames: 6, opponentGames: 4 },
      { playerGames: 7, opponentGames: 6, playerTiebreakPoints: 7, opponentTiebreakPoints: 3 },
    ]);

    // Verify Musetti tiebreak vs Francisco Cerundolo (9-7)
    expect(MUSETTI_CINCINNATI_HISTORY[8].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 9,
      opponentTiebreakPoints: 7,
    });

    const event = tennisEvents.find((item) => item.id === "atp-cincinnati-2026-faria-musetti");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(18); // 18 completed + 2 ret
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Kasper Ruud"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Taylor Fritz and Christopher O'Connell screenshot rows", () => {
    expect(FRITZ_CINCINNATI_HISTORY).toHaveLength(20);
    expect(OCONNELL_CINCINNATI_HISTORY).toHaveLength(20);
    expect(FRITZ_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(OCONNELL_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Fritz extended tiebreak vs Ben Shelton (10-8)
    expect(FRITZ_CINCINNATI_HISTORY[15].sets[1]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 10,
      opponentTiebreakPoints: 8,
    });

    // Verify O'Connell match 1 is walkover
    expect(OCONNELL_CINCINNATI_HISTORY[0].status).toBe("walkover");

    const event = tennisEvents.find((item) => item.id === "atp-cincinnati-2026-fritz-oconnell");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(18); // 18 completed + 1 wo + 1 ret
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Kamil Mažtšrzak", "Dusan Lažovic"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Francis Tiafoe and Felix Auger-Aliassime screenshot rows", () => {
    expect(TIAFOE_CINCINNATI_HISTORY).toHaveLength(20);
    expect(ALIASSIME_CINCINNATI_R8_HISTORY).toHaveLength(20);
    expect(TIAFOE_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(ALIASSIME_CINCINNATI_R8_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Tiafoe epic tiebreak vs Aliassime (14-12)
    expect(TIAFOE_CINCINNATI_HISTORY[10].sets[2]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 14,
      opponentTiebreakPoints: 12,
    });

    // Verify Aliassime 5-set win vs Daniel Altmaier (10-7)
    expect(ALIASSIME_CINCINNATI_R8_HISTORY[16].sets[4]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 10,
      opponentTiebreakPoints: 7,
    });

    const event = tennisEvents.find((item) => item.id === "atp-cincinnati-2026-tiafoe-aliassime");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.headToHead).toMatchObject({ matches: 1, player1Wins: 1, player2Wins: 0 });
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Daniel Altmaier", "Lirner Tien", "Flavio Kobolli"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Kori Gauff and Marie Bouzkova screenshot rows", () => {
    expect(GAUFF_CINCINNATI_HISTORY).toHaveLength(20);
    expect(BOUZKOVA_CINCINNATI_HISTORY).toHaveLength(20);
    expect(GAUFF_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(BOUZKOVA_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Gauff walkover vs Bencic
    expect(GAUFF_CINCINNATI_HISTORY[3].status).toBe("walkover");

    // Verify Bouzkova extended tiebreak vs Donna Vekic (9-11)
    expect(BOUZKOVA_CINCINNATI_HISTORY[15].sets[0]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 9,
      opponentTiebreakPoints: 11,
    });

    const event = tennisEvents.find((item) => item.id === "wta-cincinnati-2026-gauff-bouzkova");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 wo
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Ludmilla Samsonova", "Tailor Townsend", "Mirra Andriva"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Madison Keys and Xiyu Wang screenshot rows", () => {
    expect(KEYS_CINCINNATI_HISTORY).toHaveLength(20);
    expect(XIYU_WANG_CINCINNATI_HISTORY).toHaveLength(20);
    expect(KEYS_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(XIYU_WANG_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Keys extended tiebreak vs Jessica Pegula (8-10)
    expect(KEYS_CINCINNATI_HISTORY[14].sets[1]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 8,
      opponentTiebreakPoints: 10,
    });

    // Verify Xiyu Wang walkover vs Svitolina
    expect(XIYU_WANG_CINCINNATI_HISTORY[0].status).toBe("walkover");

    const event = tennisEvents.find((item) => item.id === "wta-cincinnati-2026-keys-wang");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.profiles.player2.matchesUsed).toBe(16); // 16 completed + 1 wo + 3 ret
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Aryna Sabalenka and Sara Bejlek screenshot rows", () => {
    expect(SABALENKA_CINCINNATI_R8_HISTORY).toHaveLength(20);
    expect(BEJLEK_CINCINNATI_HISTORY).toHaveLength(20);
    expect(SABALENKA_CINCINNATI_R8_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(BEJLEK_CINCINNATI_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Sabalenka extended tiebreak vs Mckartney Kessler (11-9)
    expect(SABALENKA_CINCINNATI_R8_HISTORY[7].sets[1]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 11,
      opponentTiebreakPoints: 9,
    });

    // Verify Bejlek extended tiebreak vs Anna Blinkova (11-9)
    expect(BEJLEK_CINCINNATI_HISTORY[7].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 11,
      opponentTiebreakPoints: 9,
    });

    const event = tennisEvents.find((item) => item.id === "wta-cincinnati-2026-sabalenka-bejlek");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(19); // 19 completed + 1 wo
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Ekaterina Aleksandrova", "Barbora Krežcikova", "Sorana Cirsti"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Alexis Galarneau and Dino Prizmic screenshot rows", () => {
    expect(GALARNEAU_QUEBEC_HISTORY).toHaveLength(20);
    expect(PRIZMIC_QUEBEC_HISTORY).toHaveLength(20);
    expect(GALARNEAU_QUEBEC_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(PRIZMIC_QUEBEC_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Prizmic extended tiebreak vs Christopher O'Connell (11-9)
    expect(PRIZMIC_QUEBEC_HISTORY[18].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 11,
      opponentTiebreakPoints: 9,
    });

    const event = tennisEvents.find((item) => item.id === "atp-quebec-2026-galarneau-prizmic");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Vit Kopriva"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Jacob Fearnley and Mackenzie McDonald screenshot rows", () => {
    expect(FEARNLEY_QUEBEC_HISTORY).toHaveLength(20);
    expect(MCDONALD_QUEBEC_HISTORY).toHaveLength(20);
    expect(FEARNLEY_QUEBEC_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(MCDONALD_QUEBEC_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Fearnley marathon tiebreak vs Dane Sweeny (16-18)
    expect(FEARNLEY_QUEBEC_HISTORY[17].sets[0]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 16,
      opponentTiebreakPoints: 18,
    });

    const event = tennisEvents.find((item) => item.id === "atp-quebec-2026-fearnley-mcdonald");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Aleks Mitšelsen", "Adam Walton"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Alexandre Muller and Coleman Wong screenshot rows", () => {
    expect(MULLER_CANCUN_HISTORY).toHaveLength(20);
    expect(COLEMAN_WONG_CANCUN_HISTORY).toHaveLength(20);
    expect(MULLER_CANCUN_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(COLEMAN_WONG_CANCUN_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Coleman Wong Wimbledon tiebreak vs Borna Gojo (10-12)
    expect(COLEMAN_WONG_CANCUN_HISTORY[12].sets[0]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 10,
      opponentTiebreakPoints: 12,
    });

    const event = tennisEvents.find((item) => item.id === "atp-cancun-2026-muller-wong");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(18); // 18 completed + 2 ret
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Otto Virtanen"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Otto Virtanen and Moez Echargui screenshot rows", () => {
    expect(VIRTANEN_CANCUN_HISTORY).toHaveLength(20);
    expect(ECHARGUI_CANCUN_HISTORY).toHaveLength(20);
    expect(VIRTANEN_CANCUN_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(ECHARGUI_CANCUN_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Virtanen 5-set Wimbledon epic vs Ben Shelton (11-9 5th set tiebreak)
    expect(VIRTANEN_CANCUN_HISTORY[11].sets[4]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 11,
      opponentTiebreakPoints: 9,
    });

    const event = tennisEvents.find((item) => item.id === "atp-cancun-2026-virtanen-echargui");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Budkov Kžaer, Nikolai"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Rodrigo Pacheco Mendez and Marcelo Tomas Barrios Vera screenshot rows", () => {
    expect(PACHECO_CANCUN_HISTORY).toHaveLength(20);
    expect(BARRIOS_VERA_CANCUN_HISTORY).toHaveLength(20);
    expect(PACHECO_CANCUN_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(BARRIOS_VERA_CANCUN_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Barrios Vera extended tiebreak vs Emilio Nava (9-11)
    expect(BARRIOS_VERA_CANCUN_HISTORY[11].sets[2]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 9,
      opponentTiebreakPoints: 11,
    });

    const event = tennisEvents.find((item) => item.id === "atp-cancun-2026-pacheco-barrios-vera");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Luka Pavlovic"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Camilo Ugo Carabelli and Nicolas Mejia screenshot rows", () => {
    expect(UGO_CARABELLI_CANCUN_HISTORY).toHaveLength(20);
    expect(MEJIA_CANCUN_HISTORY).toHaveLength(20);
    expect(UGO_CARABELLI_CANCUN_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(MEJIA_CANCUN_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Carabelli extended tiebreak vs Emilio Nava (12-10)
    expect(UGO_CARABELLI_CANCUN_HISTORY[8].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 12,
      opponentTiebreakPoints: 10,
    });

    const event = tennisEvents.find((item) => item.id === "atp-cancun-2026-ugo-carabelli-mejia");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Gauthier Onclin and Timofey Skatov screenshot rows", () => {
    expect(ONCLIN_CANCUN_HISTORY).toHaveLength(20);
    expect(SKATOV_CANCUN_HISTORY).toHaveLength(20);
    expect(ONCLIN_CANCUN_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(SKATOV_CANCUN_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Onclin extended tiebreak vs Duje Ajdukovic (15-13)
    expect(ONCLIN_CANCUN_HISTORY[7].sets[0]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 15,
      opponentTiebreakPoints: 13,
    });

    const event = tennisEvents.find((item) => item.id === "atp-cancun-2026-onclin-skatov");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Kirian Žacvitset"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Darwin Blanch and Lloyd Harris screenshot rows", () => {
    expect(BLANCH_CANCUN_HISTORY).toHaveLength(20);
    expect(LLOYD_HARRIS_CANCUN_HISTORY).toHaveLength(20);
    expect(BLANCH_CANCUN_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(LLOYD_HARRIS_CANCUN_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Blanch tiebreak vs Zhizhen Zhang (10-8)
    expect(BLANCH_CANCUN_HISTORY[9].sets[1]).toMatchObject({
      playerGames: 7,
      opponentGames: 6,
      playerTiebreakPoints: 10,
      opponentTiebreakPoints: 8,
    });

    const event = tennisEvents.find((item) => item.id === "atp-cancun-2026-blanch-harris");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.profiles.player2.matchesUsed).toBe(18); // 18 completed + 2 ret
    expect(analysis.commonOpponents).toHaveLength(0);
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Felipe Alves and Moise Kouame screenshot rows", () => {
    expect(ALVES_CANCUN_HISTORY).toHaveLength(20);
    expect(KOUAME_CANCUN_HISTORY).toHaveLength(20);
    expect(ALVES_CANCUN_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(KOUAME_CANCUN_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    // Verify Kouame 4th set tiebreak vs Alejandro Tabilo (9-11)
    expect(KOUAME_CANCUN_HISTORY[3].sets[3]).toMatchObject({
      playerGames: 6,
      opponentGames: 7,
      playerTiebreakPoints: 9,
      opponentTiebreakPoints: 11,
    });

    const event = tennisEvents.find((item) => item.id === "atp-cancun-2026-alves-kouame");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(19); // 19 completed + 1 ret
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("preserves the 20+20 Alan Magadan and Naoki Nakagawa screenshot rows with 0-1 H2H and common opponent", () => {
    expect(MAGADAN_CANCUN_HISTORY).toHaveLength(20);
    expect(NAKAGAWA_CANCUN_HISTORY).toHaveLength(20);
    expect(MAGADAN_CANCUN_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);
    expect(NAKAGAWA_CANCUN_HISTORY.every((match) => match.date < "2026-08-19")).toBe(true);

    const event = tennisEvents.find((item) => item.id === "atp-cancun-2026-magadan-nakagawa");
    expect(event).toBeDefined();
    if (!event) return;

    const analysis = analyzeTennisMatch(event.input);
    expect(analysis.profiles.player1.matchesUsed).toBe(19); // 19 completed + 1 WO
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.headToHead).toMatchObject({ matches: 1, player1Wins: 0, player2Wins: 1 });
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Naoja Honda"]));
    expect(analysis.markets.length).toBeGreaterThanOrEqual(15);
  });

  it("uses all 20 matches and adds common-opponent and pre-match H2H evidence", () => {
    const event = tennisEvents[0];
    const analysis = analyzeTennisMatch(event.input);

    expect(analysis.profiles.player1.matchesUsed).toBe(20);
    expect(analysis.profiles.player2.matchesUsed).toBe(20);
    expect(analysis.commonOpponents.map((item) => item.opponent)).toEqual(expect.arrayContaining(["Luciano Darderi", "Jannik Sinner"]));
    expect(analysis.commonOpponents).toHaveLength(2);
    expect(analysis.headToHead).toMatchObject({ matches: 1, player1Wins: 1, player2Wins: 0 });
    expect(analysis.headToHead.records[0].winner).toBe("Andrei Rublev");
    expect(analysis.projectedWinner).toBe("Nuno Borges");
    expect(analysis.markets.find((item) => item.id === "match-winner")?.evidence).toEqual(expect.arrayContaining([
      expect.stringContaining("Forma ponderada sobre los 20 completos"),
      expect.stringContaining("Rivales en común: 2"),
      expect.stringContaining("H2H prepartido: 1-0"),
    ]));
  });

  it("keeps the twentieth match in the weighted-form calculation", () => {
    const baseline = input();
    baseline.player1.ranking = undefined;
    baseline.player2.ranking = undefined;
    baseline.player1.matches = history(19);
    baseline.player2.matches = history(19);
    const changed = structuredClone(baseline);
    changed.player1.matches[19].sets = [{ playerGames: 6, opponentGames: 3 }, { playerGames: 6, opponentGames: 4 }];

    const before = analyzeTennisMatch(baseline).profiles.player1.weightedWinRate;
    const after = analyzeTennisMatch(changed).profiles.player1.weightedWinRate;
    expect(after).toBeGreaterThan(before);
  });
});
