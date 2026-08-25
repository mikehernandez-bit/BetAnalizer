import type { TennisHistoryMatch, TennisMatchStatus, TennisSetScore, TennisStoredEvent, TennisSurface } from "@/types/tennis";

const set = (
  playerGames: number,
  opponentGames: number,
  playerTiebreakPoints?: number,
  opponentTiebreakPoints?: number
): TennisSetScore => ({ playerGames, opponentGames, playerTiebreakPoints, opponentTiebreakPoints });

const match = (
  date: string,
  tournament: string,
  surface: TennisSurface,
  opponent: string,
  sets: TennisSetScore[],
  status: TennisMatchStatus = "completed",
  playerIsHome: boolean = true,
  winner?: "player" | "opponent"
): TennisHistoryMatch => ({
  date,
  tournament,
  surface,
  opponent,
  sets,
  status,
  playerIsHome,
  winner: winner ?? (sets.filter((s) => s.playerGames > s.opponentGames).length > sets.length / 2 ? "player" : "opponent"),
});

/**
 * Transcripción de las 20 filas de las capturas de Andrei Rublev.
 * Todos los sets están orientados a Rublev, incluso cuando aparece abajo.
 */
export const RUBLEV_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-16", "ATP Cincinnati", "hard", "Pablo Carreno-Busta", [set(7, 6, 7, 5), set(6, 1)], "completed", true),
  match("2026-08-04", "ATP Masters 1000 Canada", "hard", "Juncheng Shang", [set(5, 7), set(6, 4), set(6, 7)], "completed", true),
  match("2026-07-24", "Portugal", "clay", "Luca van Assche", [set(6, 3), set(3, 6), set(4, 6)], "completed", true),
  match("2026-07-23", "Portugal", "clay", "Timofei Skatov", [set(6, 1), set(6, 1)], "completed", true),
  match("2026-07-19", "Bastad", "clay", "Luciano Darderi", [set(6, 4), set(6, 3)], "completed", false),
  match("2026-07-18", "Bastad", "clay", "Alejandro Tabilo", [set(6, 4), set(4, 6), set(6, 4)], "completed", false),
  match("2026-07-17", "Bastad", "clay", "Sebastian Baez", [set(6, 1), set(6, 2)], "completed", false),
  match("2026-07-16", "Bastad", "clay", "Andrea Pellegrino", [set(7, 6, 7, 3), set(6, 7, 7, 9), set(6, 3)], "completed", true),
  match("2026-06-29", "Wimbledon", "grass", "Roman Safiullin", [set(4, 6), set(7, 6, 8, 6), set(6, 3), set(3, 6), set(6, 7, 12, 14)], "completed", true),
  match("2026-06-16", "Germany", "grass", "Hubert Hurkacz", [set(3, 6), set(2, 6)], "completed", true),
  match("2026-05-31", "Roland Garros", "clay", "Jakub Mensik", [set(3, 6), set(6, 7, 6, 8), set(6, 4), set(6, 2), set(3, 6)], "completed", false),
  match("2026-05-29", "Roland Garros", "clay", "Nuno Borges", [set(7, 5), set(7, 6, 7, 2), set(7, 6, 7, 2)], "completed", true),
  match("2026-05-27", "Roland Garros", "clay", "Camilo Ugo Carabelli", [set(6, 1), set(1, 6), set(6, 3), set(7, 6, 7, 5)], "completed", false),
  match("2026-05-25", "Roland Garros", "clay", "Ignacio Buse", [set(6, 3), set(6, 7, 6, 8), set(6, 3), set(7, 5)], "completed", false),
  match("2026-05-14", "Rome", "clay", "Jannik Sinner", [set(2, 6), set(4, 6)], "completed", false),
  match("2026-05-12", "Rome", "clay", "Nikoloz Basilashvili", [set(3, 6), set(7, 6, 7, 5), set(6, 2)], "completed", false),
  match("2026-05-11", "Rome", "clay", "Alejandro Davidovich Fokina", [set(6, 4), set(6, 4)], "completed", true),
  match("2026-05-09", "Rome", "clay", "Miomir Kecmanovic", [set(6, 4), set(6, 4)], "completed", true),
  match("2026-04-24", "Madrid", "clay", "Vit Kopriva", [set(3, 6), set(4, 6)], "completed", true),
  match("2026-04-19", "Barcelona", "clay", "Arthur Fils", [set(2, 6), set(6, 7, 2, 7)], "completed", false),
];

/**
 * Transcripción de las 20 filas de las capturas de Nuno Borges.
 * Todos los sets están orientados a Borges, incluso cuando aparece abajo.
 */
export const BORGES_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-16", "ATP Cincinnati", "hard", "Francisco Cerundolo", [set(6, 4), set(6, 4)], "completed", true),
  match("2026-08-14", "ATP Cincinnati", "hard", "Thanasi Kokkinakis", [set(5, 7), set(7, 6, 7, 3), set(7, 6, 7, 4)], "completed", true),
  match("2026-08-08", "ATP Masters 1000 Canada", "hard", "Luciano Darderi", [set(6, 4), set(3, 6), set(5, 7)], "completed", false),
  match("2026-08-06", "ATP Masters 1000 Canada", "hard", "Yannick Hanfmann", [set(6, 4), set(6, 2)], "completed", true),
  match("2026-08-05", "ATP Masters 1000 Canada", "hard", "Tomas Martin Etcheverry", [set(6, 4), set(6, 2)], "completed", true),
  match("2026-08-02", "ATP Masters 1000 Canada", "hard", "Aleksandar Kovacevic", [set(6, 7), set(6, 2), set(6, 4)], "completed", true),
  match("2026-07-22", "Portugal", "clay", "Roman Andres Burruchaga", [set(1, 6), set(6, 4), set(3, 6)], "completed", true),
  match("2026-07-21", "Portugal", "clay", "Orlando Luz", [set(6, 3), set(6, 3)], "completed", true),
  match("2026-07-17", "Bastad", "clay", "Luciano Darderi", [set(6, 7, 9, 11), set(4, 6)], "completed", false),
  match("2026-07-15", "Bastad", "clay", "Grigor Dimitrov", [set(6, 4), set(6, 2)], "completed", false),
  match("2026-07-14", "Bastad", "clay", "Moise Kouame", [set(6, 4), set(6, 2)], "completed", true),
  match("2026-07-01", "Wimbledon", "grass", "Jannik Sinner", [set(6, 7, 2, 7), set(6, 7, 2, 7), set(4, 6)], "completed", false),
  match("2026-06-29", "Wimbledon", "grass", "Tristan Boyer", [set(6, 3), set(7, 5), set(7, 5)], "completed", true),
  match("2026-06-26", "ATP Mallorca", "grass", "Ethan Quinn", [set(1, 6), set(2, 6)], "completed", false),
  match("2026-06-25", "ATP Mallorca", "grass", "Luciano Darderi", [set(7, 6, 7, 1), set(6, 4)], "completed", true),
  match("2026-06-23", "ATP Mallorca", "grass", "Jan-Lennard Struff", [set(6, 4), set(7, 5)], "completed", false),
  match("2026-06-21", "ATP Mallorca", "grass", "Adrian Mannarino", [set(6, 2), set(6, 2)], "completed", true),
  match("2026-06-15", "Germany", "grass", "Felix Auger-Aliassime", [set(3, 6), set(6, 3), set(3, 6)], "completed", false),
  match("2026-06-11", "ATP 's-Hertogenbosch", "grass", "Marin Cilic", [set(6, 3), set(6, 7, 5, 7), set(3, 6)], "completed", true),
  match("2026-06-08", "ATP 's-Hertogenbosch", "grass", "Terence Atmane", [set(6, 4), set(6, 4)], "completed", true),
];

/**
 * Transcripción de las 20 filas de las capturas de Brandon Nakašima.
 * Todos los sets están orientados a Nakašima, incluso cuando aparece abajo.
 */
export const NAKASHIMA_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-16", "ATP Cincinnati", "hard", "Aleksandar Kovacevic", [set(6, 2), set(7, 5)], "completed", true),
  match("2026-08-13", "ATP Masters 1000 Canada", "hard", "Ben Shelton", [set(3, 6), set(6, 7, 4, 7)], "completed", false),
  match("2026-08-12", "ATP Masters 1000 Canada", "hard", "Rafael Jodar", [set(7, 6, 7, 3), set(6, 4)], "completed", false),
  match("2026-08-11", "ATP Masters 1000 Canada", "hard", "Luciano Darderi", [set(6, 2), set(6, 3)], "completed", false),
  match("2026-08-08", "ATP Masters 1000 Canada", "hard", "Arthur Rinderknech", [set(7, 6, 7, 4), set(5, 7), set(7, 5)], "completed", false),
  match("2026-08-06", "ATP Masters 1000 Canada", "hard", "Titouan Droguet", [set(4, 6), set(6, 2), set(7, 5)], "completed", true),
  match("2026-08-04", "ATP Masters 1000 Canada", "hard", "Daniel Altmaier", [set(6, 2), set(6, 1)], "completed", true),
  match("2026-08-01", "ATP Washington", "hard", "Taylor Fritz", [set(3, 6), set(6, 3), set(3, 6)], "completed", true),
  match("2026-07-31", "ATP Washington", "hard", "Alex de Minaur", [set(7, 6, 7, 5), set(6, 4)], "completed", false),
  match("2026-07-30", "ATP Washington", "hard", "Jakub Mensik", [set(7, 6, 7, 5), set(3, 6), set(6, 4)], "completed", true),
  match("2026-07-28", "ATP Washington", "hard", "Tomas Martin Etcheverry", [set(6, 3), set(6, 4)], "completed", true),
  match("2026-07-01", "Wimbledon", "grass", "Jan-Lennard Struff", [set(6, 4), set(6, 7, 6, 8), set(6, 7, 5, 7), set(7, 6, 8, 6), set(6, 7, 7, 10)], "completed", true),
  match("2026-06-29", "Wimbledon", "grass", "Jack Pinnington Jones", [set(6, 3), set(7, 6, 7, 5), set(7, 5)], "completed", true),
  match("2026-06-20", "Great Britain", "grass", "Francisco Cerundolo", [set(7, 6, 7, 5), set(3, 6), set(4, 6)], "completed", true),
  match("2026-06-19", "Great Britain", "grass", "Alex de Minaur", [set(7, 5), set(6, 3)], "completed", false),
  match("2026-06-17", "Great Britain", "grass", "Ignacio Buse", [set(6, 2), set(6, 2)], "completed", true),
  match("2026-06-16", "Great Britain", "grass", "Marton Fucsovics", [set(6, 3), set(6, 3)], "completed", true),
  match("2026-05-30", "Roland Garros", "clay", "Felix Auger-Aliassime", [set(7, 5), set(1, 6), set(6, 7, 4, 7), set(6, 7, 1, 7)], "completed", false),
  match("2026-05-28", "Roland Garros", "clay", "Luca Van Assche", [set(6, 7, 5, 7), set(6, 4), set(5, 7), set(6, 1), set(6, 3)], "completed", false),
  match("2026-05-25", "Roland Garros", "clay", "Roberto Bautista-Agut", [set(6, 2), set(7, 5), set(6, 2)], "completed", false),
];

/**
 * Transcripción de las 20 filas de las capturas de Daniil Medvedev.
 * Todos los sets están orientados a Medvedev, incluso cuando aparece abajo.
 */
export const MEDVEDEV_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-16", "ATP Cincinnati", "hard", "Marco Trungelliti", [set(6, 4), set(7, 5)], "completed", false),
  match("2026-08-05", "ATP Masters 1000 Canada", "hard", "Botic van de Zandschulp", [set(3, 6), set(6, 7)], "completed", true),
  match("2026-07-03", "Wimbledon", "grass", "Jan-Lennard Struff", [set(6, 7, 4, 7), set(6, 7, 5, 7), set(5, 7)], "completed", false),
  match("2026-07-01", "Wimbledon", "grass", "Daniel Merida", [set(3, 6), set(6, 3), set(7, 5), set(6, 2)], "completed", false),
  match("2026-06-29", "Wimbledon", "grass", "Marin Cilic", [set(6, 1), set(6, 2), set(6, 4)], "completed", false),
  match("2026-06-19", "Germany", "grass", "Daniel Altmaier", [set(4, 6), set(7, 6, 8, 6), set(4, 6)], "completed", false),
  match("2026-06-17", "Germany", "grass", "Terence Atmane", [set(6, 4), set(6, 4)], "completed", false),
  match("2026-06-16", "Germany", "grass", "Tomas Martin Etcheverry", [set(6, 3), set(6, 4)], "completed", false),
  match("2026-06-13", "ATP 's-Hertogenbosch", "grass", "Kamil Majchrzak", [set(6, 7, 4, 7), set(1, 6)], "completed", false),
  match("2026-06-12", "ATP 's-Hertogenbosch", "grass", "Marin Cilic", [set(6, 2), set(3, 6), set(6, 1)], "completed", true),
  match("2026-06-11", "ATP 's-Hertogenbosch", "grass", "Thijs Boogaard", [set(6, 3), set(4, 6), set(7, 6, 8, 5)], "completed", true),
  match("2026-05-26", "Roland Garros", "clay", "Adam Walton", [set(2, 6), set(6, 1), set(1, 6), set(6, 1), set(4, 6)], "completed", false),
  match("2026-05-15", "Rome", "clay", "Jannik Sinner", [set(2, 6), set(7, 5), set(4, 6)], "completed", false),
  match("2026-05-14", "Rome", "clay", "Martin Landaluce", [set(1, 6), set(6, 4), set(7, 5)], "completed", false),
  match("2026-05-12", "Rome", "clay", "Thiago Agustin Tirante", [set(6, 3), set(6, 2)], "completed", false),
  match("2026-05-11", "Rome", "clay", "Pablo Llamas Ruiz", [set(3, 6), set(6, 4), set(6, 2)], "completed", false),
  match("2026-05-09", "Rome", "clay", "Tomas Machac", [], "walkover", false),
  match("2026-04-28", "Madrid", "clay", "Flavio Cobolli", [set(3, 6), set(7, 5), set(4, 6)], "completed", true),
  match("2026-04-27", "Madrid", "clay", "Nicolai Budkov Kjaer", [set(6, 3), set(6, 2)], "completed", true),
  match("2026-04-25", "Madrid", "clay", "Fabian Marozsan", [set(6, 2), set(6, 7, 3, 7), set(6, 4)], "completed", true),
];

/**
 * Transcripción de las 20 filas de las capturas de Ksiiu Wang.
 * Todos los sets están orientados a Wang, incluso cuando aparece abajo.
 */
export const WANG_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-16", "USA Cincinnati", "hard", "Leilah Annie Fernandez", [set(3, 6), set(6, 2), set(6, 2)], "completed", false, "player"),
  match("2026-08-14", "USA Cincinnati", "hard", "Maria Timofiva", [set(6, 0), set(3, 0)], "retired", false, "player"),
  match("2026-08-13", "USA Cincinnati", "hard", "Polina Kudermetova", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-08-12", "USA Cincinnati", "hard", "Bianca Andreescu", [set(6, 0), set(6, 4)], "completed", true, "player"),
  match("2026-08-02", "Canada Toronto", "hard", "Sara Bežlek", [set(3, 6), set(6, 4), set(5, 7)], "completed", true, "opponent"),
  match("2026-07-28", "MEM", "hard", "Kaserine McNolli", [set(6, 4), set(3, 6), set(6, 7, 5, 7)], "completed", true, "opponent"),
  match("2026-06-24", "Wimbledon", "grass", "Marina Bassols Ribera", [set(6, 3), set(1, 6), set(0, 4)], "retired", true, "opponent"),
  match("2026-06-23", "Wimbledon", "grass", "Hanju Guo", [set(7, 6, 7, 4), set(6, 3)], "completed", true, "player"),
  match("2026-06-21", "WTA 125K", "grass", "Majar Šerif", [set(4, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-20", "WTA 125K", "grass", "Anastasiia Konstantinovna S...", [set(6, 2), set(6, 2)], "completed", true, "player"),
  match("2026-06-19", "WTA 125K", "grass", "Luisina Giovannini", [set(6, 2), set(6, 1)], "completed", true, "player"),
  match("2026-06-18", "WTA 125K", "grass", "Karole Monnet", [set(6, 3), set(6, 1)], "completed", true, "player"),
  match("2026-06-16", "WTA 125K", "grass", "Ksinju Gao", [set(6, 3), set(6, 0)], "completed", true, "player"),
  match("2026-06-08", "WTA Mod...", "clay", "Laura Samson", [set(6, 7, 3, 7), set(5, 7)], "completed", true, "opponent"),
  match("2026-05-31", "Roland Garros", "clay", "Sorana Cirsti", [set(3, 6), set(6, 7, 4, 7)], "completed", false, "opponent"),
  match("2026-05-29", "Roland Garros", "clay", "Yulia Starodubtseva", [set(6, 3), set(7, 5)], "completed", true, "player"),
  match("2026-05-27", "Roland Garros", "clay", "Hailei Baptiste", [set(5, 4)], "retired", false, "player"),
  match("2026-05-24", "Roland Garros", "clay", "Danka Kovinic", [set(6, 3), set(6, 1)], "completed", false, "player"),
  match("2026-05-22", "Roland Garros", "clay", "Polina Kudermetova", [set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-05-20", "Roland Garros", "clay", "Storm Sanders", [set(6, 2), set(7, 5)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Elina Svitolina.
 * Todos los sets están orientados a Svitolina, incluso cuando aparece abajo.
 */
export const SVITOLINA_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-16", "USA Cincinnati", "hard", "Tereza Valentova", [set(3, 6), set(7, 6, 7, 5), set(6, 0)], "completed", false, "player"),
  match("2026-08-12", "Canada Toronto", "hard", "Iga Swiatek", [set(3, 6), set(6, 1), set(3, 6)], "completed", true, "opponent"),
  match("2026-08-10", "Canada Toronto", "hard", "Ekaterina Aleksandrova", [set(3, 6), set(6, 0), set(6, 3)], "completed", false, "player"),
  match("2026-08-08", "Canada Toronto", "hard", "Amanda Anisimova", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-08-06", "Canada Toronto", "hard", "Anastasia Potapova", [set(6, 1), set(6, 1)], "completed", true, "player"),
  match("2026-08-04", "Canada Toronto", "hard", "Žessika Bauzas Maneiro", [set(6, 7, 5, 7), set(7, 6, 7, 4), set(6, 4)], "completed", true, "player"),
  match("2026-07-31", "WAS", "hard", "Aleksandra Ila", [set(3, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-30", "WAS", "hard", "Polina Kudermetova", [set(7, 6, 7, 4), set(6, 4)], "completed", false, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Daria Snigur", [set(5, 7), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-23", "WTA Bad ...", "grass", "Ludmilla Samsonova", [set(3, 6), set(6, 3), set(6, 2)], "completed", false, "player"),
  match("2026-06-19", "Berlin, Germany", "grass", "Aleksandra Ila", [set(3, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-18", "Berlin, Germany", "grass", "Eva Lis", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-06-16", "Berlin, Germany", "grass", "Anna Kalinskaja", [set(6, 1), set(4, 1)], "retired", true, "player"),
  match("2026-06-02", "Roland Garros", "clay", "Marta Kostjuk", [set(3, 6), set(6, 2), set(2, 6)], "completed", true, "opponent"),
  match("2026-05-31", "Roland Garros", "clay", "Belinda Bencic", [set(4, 6), set(6, 4), set(6, 0)], "completed", true, "player"),
  match("2026-05-29", "Roland Garros", "clay", "Tamara Korpatstš", [set(6, 2), set(6, 3)], "completed", true, "player"),
  match("2026-05-27", "Roland Garros", "clay", "Kaitlin kuevedo", [set(6, 0), set(6, 4)], "completed", true, "player"),
  match("2026-05-25", "Roland Garros", "clay", "Anna Bondar", [set(3, 6), set(6, 1), set(7, 6)], "completed", true, "player"),
  match("2026-05-16", "ROM", "clay", "Kori Gauff", [set(6, 4), set(6, 7, 3, 7), set(6, 2)], "completed", false, "player"),
  match("2026-05-14", "ROM", "clay", "Iga Swiatek", [set(6, 4), set(2, 6), set(6, 2)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Willwerth, Benjamin.
 * Todos los sets están orientados a Willwerth, incluso cuando aparece abajo.
 */
export const WILLWERTH_KINGSTON_HISTORY: TennisHistoryMatch[] = [
  match("2026-07-17", "ITF USA", "hard", "Tristan McKormick", [set(3, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-16", "ITF USA", "hard", "Joaquim Almeida", [set(1, 6), set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-07-15", "ITF USA", "hard", "Rise Falck", [set(7, 5), set(6, 1)], "completed", true, "player"),
  match("2026-07-07", "ITF Canada", "hard", "Nikolas Arseniult", [set(6, 4), set(4, 6), set(1, 6)], "completed", false, "opponent"),
  match("2026-06-16", "ATP Challenger", "hard", "Ii Žau", [set(3, 6), set(7, 6, 8, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-06", "ITF Tunisia", "hard", "Žakob Bradšaw", [set(6, 7, 5, 7), set(1, 6)], "completed", true, "opponent"),
  match("2026-06-05", "ITF Tunisia", "hard", "Mohamed Nazim Mahlauf", [set(6, 0), set(7, 5)], "completed", false, "player"),
  match("2026-06-04", "ITF Tunisia", "hard", "Luke Hooper", [set(6, 1), set(6, 1)], "completed", false, "player"),
  match("2026-06-03", "ITF Tunisia", "hard", "Nikolas Tepmahc", [set(6, 3), set(6, 1)], "completed", true, "player"),
  match("2026-05-28", "ITF Tunisia", "hard", "Nikolas Tepmahc", [set(6, 1), set(0, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-05-27", "ITF Tunisia", "hard", "Žakub Kroslak", [set(6, 3), set(7, 6, 7, 3)], "completed", false, "player"),
  match("2026-04-22", "ITF USA", "hard", "Kannon Kingslei", [set(5, 7), set(7, 5), set(3, 6)], "completed", false, "opponent"),
  match("2026-04-16", "ITF USA", "hard", "Tobi Martin", [set(3, 6), set(6, 7, 4, 7)], "completed", false, "opponent"),
  match("2026-04-15", "ITF USA", "hard", "Mwendwa Mbisi", [set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-04-10", "ITF USA", "hard", "Alvarez, Yannik", [set(2, 3)], "retired", true, "opponent"),
  match("2026-04-10", "ITF USA", "hard", "Dragos Nikolae Kazacu", [set(4, 6), set(6, 3), set(7, 5)], "completed", false, "player"),
  match("2026-04-08", "ITF USA", "hard", "Žesse Flores", [set(7, 6, 7, 3), set(7, 5)], "completed", true, "player"),
  match("2026-03-16", "MIA", "hard", "Luka van Asše", [set(3, 6), set(1, 6)], "completed", true, "opponent"),
  match("2026-02-24", "ITF Costa Rica", "hard", "Nikolas Žadaun", [set(3, 6), set(6, 3), set(1, 6)], "completed", false, "opponent"),
  match("2026-02-14", "Delray Beach", "hard", "Šo Šimabukuro", [set(4, 6), set(6, 7, 4, 7)], "completed", true, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Gonzalo Bueno.
 * Todos los sets están orientados a Bueno, incluso cuando aparece abajo.
 */
export const BUENO_KINGSTON_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-02", "Czech Republic", "clay", "Žan Kumstat", [set(3, 6), set(1, 6)], "completed", false, "opponent"),
  match("2026-08-01", "Czech Republic", "clay", "Norbert Gombos", [set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-07-31", "Czech Republic", "clay", "Žuan Bautista Torres", [set(5, 2)], "retired", false, "player"),
  match("2026-07-30", "Czech Republic", "clay", "Hinek Barton", [set(7, 5), set(7, 5)], "completed", false, "player"),
  match("2026-07-28", "Czech Republic", "clay", "Pablo Martinez Gomez", [set(7, 6, 7, 5), set(6, 4)], "completed", false, "player"),
  match("2026-07-23", "Portugal", "clay", "Žaime Faria", [set(2, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-21", "Portugal", "clay", "Tiago Pereira", [set(6, 3), set(1, 6), set(7, 6, 7, 5)], "completed", true, "player"),
  match("2026-07-19", "Portugal", "clay", "Andri Pellegrino", [set(6, 3), set(5, 7), set(6, 4)], "completed", false, "player"),
  match("2026-07-18", "Portugal", "clay", "Francisko Rotša", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-07-12", "Sweden", "clay", "Ribeiro Marcondes, Igor", [set(4, 6), set(6, 7, 5, 7)], "completed", true, "opponent"),
  match("2026-07-07", "Germany", "clay", "Laslo Džere", [set(1, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-06-22", "Wimbledon", "grass", "Žerome Kim", [set(6, 4), set(5, 7), set(1, 6)], "completed", false, "opponent"),
  match("2026-06-18", "Poland Poznan", "clay", "Dalibor Svrcina", [set(2, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-17", "Poland Poznan", "clay", "Frederiko Ferreira Silva", [set(6, 4), set(6, 3)], "completed", true, "player"),
  match("2026-06-16", "Poland Poznan", "clay", "Tomasz Berkieta", [set(7, 6, 7, 4), set(6, 3)], "completed", true, "player"),
  match("2026-06-09", "ATP Challenger", "clay", "Fransesko Forti", [set(5, 7), set(6, 4), set(6, 7, 2, 7)], "completed", true, "opponent"),
  match("2026-06-02", "Italy Perugia", "clay", "Dusan Lažovic", [set(4, 6), set(1, 6)], "completed", true, "opponent"),
  match("2026-05-26", "Italy Vicenza", "clay", "Tommaso Kompagnutsi", [set(6, 7, 2, 7), set(3, 6)], "completed", false, "opponent"),
  match("2026-05-21", "Roland Garros", "clay", "Tobi Samuel", [set(7, 5), set(1, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-05-20", "Roland Garros", "clay", "Vitalii Satško", [set(6, 2), set(6, 4)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Žaime Faria.
 * Todos los sets están orientados a Faria, incluso cuando aparece abajo.
 */
export const FARIA_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-16", "USA Cincinnati", "hard", "Ben Šelton", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-08-14", "USA Cincinnati", "hard", "Ženson Bruksbi", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-08-12", "USA Cincinnati", "hard", "Ibing Wu", [set(6, 3), set(7, 5)], "completed", true, "player"),
  match("2026-08-11", "USA Cincinnati", "hard", "Nikoloz Basilašvili", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-08-05", "Canada Montreal", "hard", "Titauan Drogat", [set(6, 7), set(2, 6)], "completed", false, "opponent"),
  match("2026-08-01", "Canada Montreal", "hard", "Tšristofer O'Konnell", [set(7, 6, 10, 8), set(2, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-24", "Portugal", "clay", "Luciano Darderi", [set(6, 2), set(5, 7), set(2, 6)], "completed", true, "opponent"),
  match("2026-07-23", "Portugal", "clay", "Gonzalo Bueno", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-07-21", "Portugal", "clay", "Botic van de Zandschulp", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-07-16", "Switzerland", "clay", "Kasper Ruud", [set(7, 6, 7, 1), set(4, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-07-14", "Switzerland", "clay", "Stan Wawrinka", [set(6, 7, 8, 10), set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-07-02", "Wimbledon", "grass", "Zizou Bergs", [set(6, 7, 6, 8), set(6, 4), set(2, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-30", "Wimbledon", "grass", "Šo Šimabukuro", [set(7, 6, 8, 6), set(6, 3), set(6, 7, 2, 7), set(6, 3)], "completed", false, "player"),
  match("2026-05-25", "Wimbledon", "grass", "Rei Sakamoto", [set(7, 6, 7, 3), set(4, 6), set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-06-24", "Wimbledon", "grass", "Luka Pavlovic", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-06-22", "Wimbledon", "grass", "Hugo Grenier", [set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-06-16", "ATP Challenger", "grass", "Žizhen Žang", [set(4, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-06-15", "ATP Challenger", "grass", "Moez Etšargui", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-05-30", "Roland Garros", "clay", "Francis Tiafoe", [set(6, 4), set(7, 6), set(6, 7), set(1, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-05-28", "Roland Garros", "clay", "Žan-Lennard Struff", [set(7, 5), set(7, 6, 7, 1), set(6, 2)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Adam Walton.
 * Todos los sets están orientados a Walton, incluso cuando aparece abajo.
 */
export const WALTON_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-16", "USA Cincinnati", "hard", "Ignacio Buse", [set(6, 4), set(6, 3)], "completed", true, "player"),
  match("2026-08-14", "USA Cincinnati", "hard", "Nikolas Mežia", [set(7, 6, 7, 5), set(6, 0)], "completed", true, "player"),
  match("2026-08-04", "Canada Montreal", "hard", "Ženson Bruksbi", [set(3, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-08-01", "Canada Montreal", "hard", "Žustin Baulais", [set(7, 5), set(7, 6, 7, 4)], "completed", true, "player"),
  match("2026-07-29", "Mexico Los Cabos", "hard", "Dalibor Svrcina", [set(7, 6, 7, 2), set(6, 7, 2, 7), set(3, 6)], "completed", false, "opponent"),
  match("2026-07-24", "Challenger", "hard", "Mitšael Zheng", [set(6, 4), set(6, 7, 4, 7), set(3, 6)], "completed", false, "opponent"),
  match("2026-07-22", "Challenger", "hard", "Sanasi Kokkinakis", [set(2, 6), set(6, 3), set(7, 6, 7, 3)], "completed", false, "player"),
  match("2026-07-20", "Challenger", "hard", "Blaise Bicknell", [set(3, 6), set(6, 1), set(3, 1)], "retired", false, "player"),
  match("2026-07-12", "Challenger", "hard", "Žakob Firnlei", [set(7, 5), set(6, 7, 8, 10), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-11", "Challenger", "hard", "Aleks Mitšelsen", [set(7, 6, 7, 2), set(6, 4)], "completed", true, "player"),
  match("2026-07-10", "Challenger", "hard", "Arsur Gi", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-07-09", "Challenger", "hard", "Bernard Tomic", [set(6, 4), set(4, 6), set(6, 2)], "completed", false, "player"),
  match("2026-07-08", "Challenger", "hard", "Mackenzie Mcdonald", [set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-06-29", "Wimbledon", "grass", "Dino Prizmic", [set(6, 4), set(6, 7, 3, 7), set(4, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-24", "ATP Mallorca", "grass", "Aležandro Davidovich Fokina", [set(4, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-06-22", "ATP Mallorca", "grass", "Nick Kirgios", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-06-21", "ATP Mallorca", "grass", "Antoine Ghibaudo", [set(6, 4), set(6, 1)], "completed", true, "player"),
  match("2026-06-20", "ATP Mallorca", "grass", "Federiko Bondioli", [set(6, 1), set(7, 5)], "completed", true, "player"),
  match("2026-06-13", "Great Britain", "grass", "Harri Wendelken", [set(3, 6), set(7, 6, 7, 5), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-07", "Challenger", "hard", "Andre Ilagan", [set(7, 5), set(6, 1)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Žesper De Žong.
 * Todos los sets están orientados a De Jong, incluso cuando aparece abajo.
 */
export const DE_JONG_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-14", "USA Cincinnati", "hard", "Aleks Mitšelsen", [set(4, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-21", "Portugal", "clay", "Timofei Skatov", [set(6, 1), set(4, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-07-16", "Sweden", "clay", "Sebastián Báez", [set(4, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-07-13", "Sweden", "clay", "Vilius Gaubas", [set(7, 6, 7, 1), set(7, 5)], "completed", true, "player"),
  match("2026-07-01", "Wimbledon", "grass", "Žoao Fonseka", [set(1, 6), set(5, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-29", "Wimbledon", "grass", "Rinki Hižikata", [set(7, 6, 7, 4), set(3, 6), set(5, 7), set(6, 4), set(6, 3)], "completed", true, "player"),
  match("2026-06-16", "ATP Challenger", "clay", "Laslo Džere", [set(3, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-06-14", "ATP Challenger", "clay", "Roberto Karballes Baena", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-06-13", "ATP Challenger", "clay", "Enriko Dolla Volle", [set(2, 6), set(7, 6, 9, 7), set(6, 2)], "completed", true, "player"),
  match("2026-06-12", "ATP Challenger", "clay", "Marko Sectšinato", [set(6, 3), set(4, 6), set(6, 1)], "completed", true, "player"),
  match("2026-06-11", "ATP Challenger", "clay", "Federiko Bondioli", [set(6, 2), set(4, 6), set(6, 4)], "completed", true, "player"),
  match("2026-06-09", "ATP Challenger", "clay", "Ognžen Milic", [set(6, 1), set(7, 6, 7, 3)], "completed", true, "player"),
  match("2026-05-31", "Roland Garros", "clay", "Aleksander Zverev", [set(6, 7, 3, 7), set(4, 6), set(1, 6)], "completed", true, "opponent"),
  match("2026-05-29", "Roland Garros", "clay", "Karen Hatšanov", [set(7, 5), set(5, 7), set(6, 2), set(6, 7, 2, 7), set(6, 2)], "completed", false, "player"),
  match("2026-05-27", "Roland Garros", "clay", "Federiko cina", [set(6, 3), set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-05-25", "Roland Garros", "clay", "Stan Wawrinka", [set(6, 3), set(3, 6), set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-05-21", "Roland Garros", "clay", "Mitšael Zheng", [set(5, 7), set(3, 6)], "completed", true, "opponent"),
  match("2026-05-20", "Roland Garros", "clay", "Liam Draksl", [set(4, 6), set(6, 1), set(6, 3)], "completed", true, "player"),
  match("2026-05-18", "Roland Garros", "clay", "Fažing Sun", [set(7, 6), set(7, 6)], "completed", true, "player"),
  match("2026-05-06", "ROM", "clay", "Nuno Borges", [set(3, 6), set(0, 6)], "completed", true, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Dane Swini.
 * Todos los sets están orientados a Swini, incluso cuando aparece abajo.
 */
export const SWEENY_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-11", "USA Cincinnati", "hard", "Tšristofer O'Konnell", [set(7, 6, 7, 3), set(2, 6), set(5, 7)], "completed", false, "opponent"),
  match("2026-08-01", "Canada Montreal", "hard", "Šintaro Motšizuki", [set(6, 1), set(6, 7, 5, 7), set(3, 6)], "completed", false, "opponent"),
  match("2026-07-29", "Canada Granby", "hard", "Daniel Milavski", [set(3, 6), set(1, 6)], "completed", true, "opponent"),
  match("2026-07-28", "Canada Granby", "hard", "Dunkan Tšan", [set(6, 4), set(6, 1)], "completed", true, "player"),
  match("2026-07-21", "Challenger", "hard", "Andres Martin", [set(6, 4), set(3, 6), set(6, 7, 6, 8)], "completed", false, "opponent"),
  match("2026-06-30", "Wimbledon", "grass", "Grigor Dimitrov", [set(6, 7, 4, 7), set(3, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-06-25", "Wimbledon", "grass", "Marselo Tomas Barrios Vera", [set(4, 6), set(6, 4), set(7, 6, 7, 5), set(0, 6), set(6, 2)], "completed", true, "player"),
  match("2026-06-24", "Wimbledon", "grass", "Darwin Blantš", [set(2, 6), set(7, 6, 9, 7), set(4, 0)], "retired", true, "player"),
  match("2026-06-22", "Wimbledon", "grass", "Franko Ronkadelli", [set(6, 4), set(6, 2)], "completed", true, "player"),
  match("2026-06-16", "ATP Challenger", "grass", "Žakob Firnlei", [set(7, 6, 18, 16), set(1, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-13", "Great Britain", "grass", "Bu Juntšaokete", [set(6, 7, 4, 7), set(6, 7, 6, 8)], "completed", true, "opponent"),
  match("2026-06-13", "Great Britain", "grass", "Tobi Samuel", [set(5, 7), set(6, 2), set(6, 3)], "completed", true, "player"),
  match("2026-06-11", "Great Britain", "grass", "Billi Harris", [set(6, 4), set(7, 6, 7, 5)], "completed", true, "player"),
  match("2026-06-09", "Great Britain", "grass", "Oliver Okonkwo", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-06-03", "Challenger", "hard", "Juta Šimizu", [set(5, 7), set(5, 7)], "completed", false, "opponent"),
  match("2026-05-26", "ATP Challenger", "hard", "Enzo Aguiard", [set(3, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-18", "Roland Garros", "clay", "Žai clarke", [set(2, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-08", "Challenger", "hard", "Mark Lažal", [set(5, 7), set(3, 6)], "completed", false, "opponent"),
  match("2026-05-06", "Challenger", "hard", "Andre Ilagan", [set(6, 3), set(6, 7, 2, 7), set(6, 4)], "completed", false, "player"),
  match("2026-05-04", "Challenger", "hard", "Rigele Te", [set(6, 0), set(7, 6, 7, 5)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Žuan Manuel Serundolo.
 * Todos los sets están orientados a Serundolo, incluso cuando aparece abajo.
 */
export const CERUNDOLO_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-16", "USA Cincinnati", "hard", "Arsur Rinderknetš", [set(4, 6), set(7, 6, 7, 3), set(7, 6, 7, 5)], "completed", false, "player"),
  match("2026-08-14", "USA Cincinnati", "hard", "Mark Lažal", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-08-05", "Canada Montreal", "hard", "Kasper Ruud", [set(1, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-08-04", "Canada Montreal", "hard", "Hamad Medžedovic", [set(6, 4), set(6, 2)], "completed", true, "player"),
  match("2026-07-21", "Austria Kitzbuhel", "clay", "Marko Trungelliti", [set(2, 6), set(1, 6)], "completed", true, "opponent"),
  match("2026-07-18", "Switzerland", "clay", "Rafael Kollignon", [set(6, 1), set(6, 7, 5, 7), set(5, 7)], "completed", false, "opponent"),
  match("2026-07-17", "Switzerland", "clay", "Kasper Ruud", [set(3, 6), set(7, 5), set(6, 2)], "completed", true, "player"),
  match("2026-07-16", "Switzerland", "clay", "Miomir Kecmanovic", [set(3, 6), set(6, 3), set(7, 5)], "completed", true, "player"),
  match("2026-07-14", "Switzerland", "clay", "Zdenek Kolar", [set(4, 6), set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-06-29", "Wimbledon", "grass", "Aležandro Davidovich Fokina", [set(4, 6), set(4, 6), set(6, 7, 2, 7)], "completed", false, "opponent"),
  match("2026-06-25", "Great Britain", "grass", "Tobi Samuel", [set(3, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-06-24", "Great Britain", "grass", "Arsur Feri", [set(6, 2), set(7, 6, 7, 2)], "completed", false, "player"),
  match("2026-06-22", "Great Britain", "grass", "Rafael Kollignon", [set(6, 4), set(4, 6), set(7, 6, 7, 5)], "completed", false, "player"),
  match("2026-06-01", "Roland Garros", "clay", "Matteo Berrettini", [set(3, 6), set(6, 7), set(6, 7)], "completed", true, "opponent"),
  match("2026-05-30", "Roland Garros", "clay", "Martin Landaluse", [set(6, 4), set(6, 7, 7, 9), set(7, 6, 7, 4), set(6, 7, 4, 7), set(7, 6, 10, 8)], "completed", true, "player"),
  match("2026-05-28", "Roland Garros", "clay", "Žannik Sinner", [set(3, 6), set(2, 6), set(7, 5), set(6, 1), set(6, 1)], "completed", false, "player"),
  match("2026-05-26", "Roland Garros", "clay", "Žakob Firnlei", [set(6, 2), set(7, 6), set(7, 6, 9, 7)], "completed", false, "player"),
  match("2026-05-17", "France Bordeaux", "clay", "Rafael Kollignon", [set(5, 7), set(6, 1), set(7, 6, 7, 4)], "completed", true, "player"),
  match("2026-05-16", "France Bordeaux", "clay", "kuentin Halis", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-05-15", "France Bordeaux", "clay", "Martin Damm Žr", [set(6, 2), set(6, 2)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Feliks Auger-Aliassime.
 * Todos los sets están orientados a Auger-Aliassime, incluso cuando aparece abajo.
 */
export const ALIASSSIME_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-16", "USA Cincinnati", "hard", "Stefanos Tsitsipas", [set(6, 3), set(7, 5)], "completed", false, "player"),
  match("2026-07-07", "Wimbledon", "grass", "Novak Džokovic", [set(6, 7, 10, 12), set(6, 3), set(3, 6), set(7, 6, 7, 4), set(6, 7, 4, 10)], "completed", true, "opponent"),
  match("2026-07-05", "Wimbledon", "grass", "Aležandro Davidovich Fokina", [set(6, 7, 4, 7), set(7, 6, 8, 6), set(6, 3), set(6, 7, 2, 7), set(6, 1)], "completed", true, "player"),
  match("2026-07-03", "Wimbledon", "grass", "Mitšael Zheng", [set(7, 6, 7, 1), set(6, 2), set(6, 1)], "completed", true, "player"),
  match("2026-07-01", "Wimbledon", "grass", "Dino Prizmic", [set(7, 6, 7, 2), set(6, 3), set(7, 5)], "completed", true, "player"),
  match("2026-06-29", "Wimbledon", "grass", "Aleksander Ševtšenko", [set(6, 3), set(6, 1), set(6, 4)], "completed", true, "player"),
  match("2026-06-19", "Germany Halle", "grass", "Francis Tiafoe", [set(6, 3), set(3, 6), set(6, 7, 12, 14)], "completed", false, "opponent"),
  match("2026-06-17", "Germany Halle", "grass", "Lirner Tien", [set(6, 7, 5, 7), set(7, 5), set(7, 6, 7, 5)], "completed", false, "player"),
  match("2026-06-15", "Germany Halle", "grass", "Nuno Borges", [set(6, 3), set(3, 6), set(6, 3)], "completed", false, "player"),
  match("2026-06-12", "ATP S-Hertogenbosch", "grass", "Kamil Mažtšrzak", [set(4, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-11", "ATP S-Hertogenbosch", "grass", "Marton Fucsovics", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-06-03", "Roland Garros", "clay", "Flavio Kobolli", [set(6, 4), set(4, 6), set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-01", "Roland Garros", "clay", "Aležandro Tabilo", [set(6, 3), set(7, 5), set(6, 1)], "completed", true, "player"),
  match("2026-05-30", "Roland Garros", "clay", "Brandon Nakašima", [set(5, 7), set(6, 1), set(7, 6, 7, 4), set(7, 6, 7, 1)], "completed", true, "player"),
  match("2026-05-28", "Roland Garros", "clay", "Roman Andres Burrutšaga", [set(4, 6), set(6, 0), set(7, 5), set(6, 1)], "completed", true, "player"),
  match("2026-05-26", "Roland Garros", "clay", "Daniel Altmaier", [set(4, 6), set(6, 4), set(4, 6), set(6, 1), set(7, 6, 10, 7)], "completed", true, "player"),
  match("2026-05-20", "ATP Hamburg", "clay", "Aleksandar Kovasevic", [set(6, 4), set(5, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-19", "ATP Hamburg", "clay", "Vit Kopriva", [set(7, 5), set(6, 1)], "completed", true, "player"),
  match("2026-05-09", "ROM", "clay", "Mariano Navüan", [set(6, 7, 4, 7), set(6, 7, 5, 7)], "completed", true, "opponent"),
  match("2026-04-27", "Spain Madrid", "clay", "Aleksander Blockks", [set(6, 7, 3, 7), set(3, 6)], "completed", false, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Fransesko Maestrelli.
 * Todos los sets están orientados a Maestrelli, incluso cuando aparece abajo.
 */
export const MAESTRELLI_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-11", "USA Cincinnati", "hard", "Bu Juntšaokete", [set(6, 7, 6, 8), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-30", "ATP Challenger", "clay", "Juan Pablo Varillas Patiño-S...", [set(6, 7, 5, 7), set(6, 4), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-28", "ATP Challenger", "clay", "Lukas Neumair", [set(6, 4), set(6, 0)], "completed", true, "player"),
  match("2026-06-30", "ATP Challenger", "clay", "Ognžen Milic", [set(3, 6), set(7, 6, 10, 8), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-22", "Wimbledon", "grass", "Maks Basing", [set(6, 4), set(6, 7, 2, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-15", "ATP Challenger", "grass", "Aleksis Galarniu", [set(6, 7, 6, 8), set(5, 7)], "completed", false, "opponent"),
  match("2026-06-09", "Great Britain", "grass", "Arsur Gi", [set(6, 7, 4, 7), set(6, 3), set(1, 6)], "completed", true, "opponent"),
  match("2026-05-26", "Challenger", "clay", "Kimmer Koppežans", [set(7, 6, 7, 4), set(2, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-20", "Roland Garros", "clay", "Roberto Karballes Baena", [set(6, 2), set(3, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-05-19", "Roland Garros", "clay", "Rio Nogutši", [set(3, 6), set(7, 6), set(6, 2)], "completed", true, "player"),
  match("2026-05-07", "ROM", "clay", "Roberto Bautista-Agut", [set(3, 6), set(6, 7, 2, 7)], "completed", false, "opponent"),
  match("2026-04-28", "Challenger", "clay", "Migal Damas", [set(6, 7, 2, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-04-20", "Spain Madrid", "clay", "Budkov Kžaer, Nikolai", [set(4, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-04-11", "Spain Barcelona", "clay", "Daniel Mérida", [set(5, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-04-04", "MON", "clay", "Aleksander Blockks", [set(6, 7, 3, 7), set(2, 6)], "completed", true, "opponent"),
  match("2026-03-31", "ATP Bucharest", "clay", "Botic van de Zandschulp", [set(3, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-03-16", "MIA", "hard", "Murfi Kassüan", [set(6, 7, 1, 7), set(4, 6)], "completed", false, "opponent"),
  match("2026-03-10", "Challenger", "hard", "Mattia Bellutsi", [set(1, 6), set(1, 6)], "completed", true, "opponent"),
  match("2026-03-05", "USA Indian Wells", "hard", "Rinki Hižikata", [set(6, 7, 5, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-03-03", "USA Indian Wells", "hard", "Siago Agustin Tirante", [set(7, 6, 7, 5), set(6, 4)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Aleksei Popirin.
 * Todos los sets están orientados a Popirin, incluso cuando aparece abajo.
 */
export const POPYRIN_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-11", "USA Cincinnati", "hard", "Titauan Drogat", [set(6, 7, 2, 7), set(1, 6)], "completed", true, "opponent"),
  match("2026-08-07", "Canada Montreal", "hard", "Siago Agustin Tirante", [set(3, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-08-05", "Canada Montreal", "hard", "Rafael Kollignon", [set(6, 4), set(6, 3)], "completed", false, "player"),
  match("2026-08-04", "Canada Montreal", "hard", "Roman Andres Burrutšaga", [set(4, 6), set(7, 5), set(6, 3)], "completed", true, "player"),
  match("2026-08-01", "Canada Montreal", "hard", "Sanasi Kokkinakis", [set(6, 4), set(2, 3)], "retired", true, "player"),
  match("2026-07-28", "Canada Granby", "hard", "Andrés Andrade", [set(5, 7), set(6, 3), set(1, 6)], "completed", false, "opponent"),
  match("2026-06-30", "Wimbledon", "grass", "Žiri Lehecka", [set(4, 6), set(2, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-06-22", "Great Britain", "grass", "Žan Tšoinski", [set(6, 1), set(2, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-06-16", "Germany Halle", "grass", "Rafael Kollignon", [set(4, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-05-26", "Roland Garros", "clay", "Zatšari Svažda", [set(6, 3), set(3, 6), set(6, 7, 3, 7), set(5, 7)], "completed", true, "opponent"),
  match("2026-05-21", "Switzerland Geneva", "clay", "Kasper Ruud", [set(4, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-05-20", "Switzerland Geneva", "clay", "Tailor Fritz", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-05-19", "Switzerland Geneva", "clay", "clement Tabur", [set(7, 6, 7, 2), set(6, 7, 5, 7), set(6, 4)], "completed", true, "player"),
  match("2026-05-11", "ROM", "clay", "Žannik Sinner", [set(2, 6), set(0, 6)], "completed", false, "opponent"),
  match("2026-05-09", "ROM", "clay", "Žakub Mensik", [set(6, 3), set(2, 6), set(6, 4)], "completed", true, "player"),
  match("2026-05-07", "ROM", "clay", "Matteo Berrettini", [set(6, 2), set(6, 3)], "completed", true, "player"),
  match("2026-04-23", "Spain Madrid", "clay", "Martin Damm Žr", [set(6, 7, 7, 9), set(4, 6)], "completed", true, "opponent"),
  match("2026-04-07", "MON", "clay", "Kasper Ruud", [set(3, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-04-03", "HOU", "clay", "Francis Tiafoe", [set(6, 3), set(4, 6), set(6, 7, 6, 8)], "completed", true, "opponent"),
  match("2026-04-02", "HOU", "clay", "Aleks Mitšelsen", [set(6, 0), set(4, 6), set(6, 1)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Benžamin Bonzi.
 * Todos los sets están orientados a Bonzi, incluso cuando aparece abajo.
 */
export const BONZI_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-11", "USA Cincinnati", "hard", "Dusan Lažovic", [set(6, 2), set(6, 7, 2, 7), set(6, 7, 7, 9)], "completed", false, "opponent"),
  match("2026-08-03", "Canada Montreal", "hard", "Jannick Hanfmann", [set(1, 6), set(6, 4), set(2, 6)], "completed", true, "opponent"),
  match("2026-08-01", "Canada Montreal", "hard", "Hugo Dellien", [set(7, 5), set(6, 2)], "completed", true, "player"),
  match("2026-07-30", "Canada Granby", "hard", "Žai Dilan Hara Friend", [set(7, 5), set(6, 7), set(5, 7)], "completed", true, "opponent"),
  match("2026-07-29", "Canada Granby", "hard", "Mitšael Mmoh", [set(7, 5), set(6, 4)], "completed", true, "player"),
  match("2026-07-28", "Canada Granby", "hard", "Blaise Bicknell", [set(3, 6), set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Gabriel Diollo", [set(6, 1), set(6, 4), set(6, 7, 5, 7), set(3, 6), set(1, 3)], "retired", true, "opponent"),
  match("2026-06-18", "ATP Challenger", "grass", "Tšristofer O'Konnell", [set(4, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-06-17", "ATP Challenger", "grass", "Žakob Firnlei", [set(6, 1), set(7, 6, 7, 5)], "completed", false, "player"),
  match("2026-06-15", "ATP Challenger", "grass", "Marselo Tomas Barrios Vera", [set(6, 3), set(2, 6), set(6, 3)], "completed", false, "player"),
  match("2026-06-12", "ATP S-Hertogenbosch", "grass", "Aleks De Minaur", [set(2, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-11", "ATP S-Hertogenbosch", "grass", "Ugo Humbert", [set(6, 4), set(3, 6), set(6, 3)], "completed", false, "player"),
  match("2026-06-08", "ATP S-Hertogenbosch", "grass", "Mis Rottgering", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-06-07", "ATP S-Hertogenbosch", "grass", "Bernard Tomic", [set(6, 7, 5, 7), set(6, 2), set(7, 5)], "completed", true, "player"),
  match("2026-06-06", "ATP S-Hertogenbosch", "grass", "Marc Polmans", [set(6, 2), set(7, 6, 7, 3)], "completed", true, "player"),
  match("2026-05-24", "Roland Garros", "clay", "Aleksander Zverev", [set(3, 6), set(4, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-05-14", "France Bordeaux", "clay", "Tallon Griekspoor", [set(4, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-05-12", "France Bordeaux", "clay", "Moise Kouame", [set(2, 6), set(6, 4), set(6, 0)], "completed", false, "player"),
  match("2026-05-04", "ROM", "clay", "Dalibor Svrcina", [set(4, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-04-24", "Spain Madrid", "clay", "Žannik Sinner", [set(7, 6, 8, 6), set(1, 6), set(4, 6)], "completed", false, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Žustin Baulais.
 * Todos los sets están orientados a Baulais, incluso cuando aparece abajo.
 */
export const BOULAIS_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-01", "Canada Montreal", "hard", "Adam Walton", [set(5, 7), set(6, 7, 4, 7)], "completed", false, "opponent"),
  match("2026-07-27", "Canada Granby", "hard", "Church, Connor", [set(3, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-07-21", "Challenge...", "hard", "Žohannus Mondai", [set(7, 5), set(2, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-07-17", "Canada Granby", "hard", "August Holmgren", [set(1, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-07-15", "Canada Granby", "hard", "Juta Šimizu", [set(7, 5), set(6, 1)], "completed", false, "player"),
  match("2026-07-13", "Canada Granby", "hard", "Žizhen Žang", [set(6, 2), set(7, 6, 8, 6)], "completed", true, "player"),
  match("2026-07-09", "ITF Canada", "hard", "Kenta Miioši", [set(6, 7, 4, 7), set(0, 6)], "completed", false, "opponent"),
  match("2026-07-07", "ITF Canada", "hard", "Millen Hurrion", [set(6, 4), set(6, 2)], "completed", false, "player"),
  match("2026-06-30", "Cary", "hard", "Tung-Lin Wu", [set(7, 6), set(4, 6), set(6, 7)], "completed", false, "opponent"),
  match("2026-06-29", "Cary", "hard", "Žai Dilan Hara Friend", [set(6, 7, 2, 7), set(6, 4), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-28", "Cary", "hard", "Enzo Aguiard", [set(6, 7, 6, 8), set(7, 5), set(6, 3)], "completed", true, "player"),
  match("2026-06-17", "ITF USA", "hard", "Ozan Baris", [set(6, 1), set(5, 7), set(2, 6)], "completed", false, "opponent"),
  match("2026-06-09", "ITF USA", "hard", "Ozan Baris", [set(3, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-05-30", "ATP Challenger", "hard", "Mitšael Mmoh", [set(6, 1), set(1, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-29", "ATP Challenger", "hard", "Žai Dilan Hara Friend", [set(2, 6), set(6, 3), set(7, 5)], "completed", false, "player"),
  match("2026-05-28", "ATP Challenger", "hard", "Nikolas Mežia", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-05-26", "ATP Challenger", "hard", "Erik Arutiunian", [set(6, 3), set(6, 2)], "completed", false, "player"),
  match("2026-05-25", "ATP Challenger", "hard", "Andrew Fenti", [set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-05-24", "ATP Challenger", "hard", "Pavle Marinkov", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-05-06", "ITF Portugal", "hard", "Fausto Tabacko", [set(0, 6), set(0, 6)], "completed", false, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Žoel Žosef Šwarzler.
 * Todos los sets están orientados a Schwarzler, incluso cuando aparece abajo.
 */
export const SCHWARZLER_KINGSTON_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-12", "ATP Challenger", "hard", "Andrés Andrade", [set(3, 6), set(7, 6, 7, 5), set(5, 7)], "completed", true, "opponent"),
  match("2026-08-09", "ATP Challenger", "hard", "Andri Guerrieri", [set(7, 6, 7, 4), set(6, 1)], "completed", true, "player"),
  match("2026-08-08", "ATP Challenger", "hard", "Masis Erhard", [set(3, 6), set(7, 6, 7, 5), set(6, 4)], "completed", false, "player"),
  match("2026-08-07", "ATP Challenger", "hard", "Ilja Ivaška", [set(7, 6, 7, 4), set(6, 4)], "completed", true, "player"),
  match("2026-08-06", "ATP Challenger", "hard", "Aziz Daugaz", [set(7, 6, 7, 2), set(3, 6), set(7, 6, 7, 4)], "completed", true, "player"),
  match("2026-08-04", "ATP Challenger", "hard", "Žiri cizek", [set(6, 3), set(6, 1)], "completed", true, "player"),
  match("2026-07-29", "Czech Republic", "clay", "Martin Krumitš", [set(2, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-28", "Czech Republic", "clay", "Maksim Mrva", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-07-20", "Austria Kitzbuhel", "clay", "Žuriž Rodionov", [set(4, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-07-13", "Switzerland", "clay", "Lorenzo Süango", [set(4, 6), set(6, 7, 4, 7)], "completed", false, "opponent"),
  match("2026-07-07", "ATP Challenger", "clay", "Federiko Bondioli", [set(6, 3), set(3, 6), set(5, 7)], "completed", false, "opponent"),
  match("2026-06-22", "Wimbledon", "grass", "Tšristofer O'Konnell", [set(6, 7, 3, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-01", "ATP Challenger", "clay", "Matež Dodig", [set(4, 6), set(6, 2), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-28", "Italy Vicenza", "clay", "Martín Tiffon, Pol", [set(1, 6), set(6, 2), set(6, 7, 2, 7)], "completed", false, "opponent"),
  match("2026-05-26", "Italy Vicenza", "clay", "Enriko Dolla Volle", [set(6, 3), set(3, 6), set(6, 3)], "completed", false, "player"),
  match("2026-05-20", "Roland Garros", "clay", "Roman Safiullin", [set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-19", "Roland Garros", "clay", "clement Tšideh", [set(6, 1), set(7, 5)], "completed", true, "player"),
  match("2026-05-13", "Tunisia Tunis", "clay", "Federiko cina", [set(4, 6), set(1, 6)], "completed", true, "opponent"),
  match("2026-05-12", "Tunisia Tunis", "clay", "Franko Agamenüan", [set(6, 7, 2, 7), set(6, 3), set(6, 1)], "completed", true, "player"),
  match("2026-04-28", "Challenger", "clay", "Žan Tšoinski", [set(4, 6), set(6, 4), set(4, 6)], "completed", true, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Kenta Miioši.
 * Todos los sets están orientados a Miyoshi, incluso cuando aparece abajo.
 */
export const MIYOSHI_KINGSTON_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "ATP Challenger", "hard", "Roger Pascual Ferra", [set(4, 6), set(7, 5), set(6, 1)], "completed", true, "player"),
  match("2026-08-16", "ATP Challenger", "hard", "Arklon Huertas Del Pino Kor...", [set(6, 0), set(6, 1)], "completed", true, "player"),
  match("2026-08-07", "ATP Challenger", "hard", "Lukas Paullain", [set(7, 6, 7, 3), set(1, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-08-06", "ATP Challenger", "hard", "Mert Alkaja", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-08-04", "ATP Challenger", "hard", "Arda Azkara", [set(6, 3), set(7, 6)], "completed", true, "player"),
  match("2026-08-03", "ATP Challenger", "hard", "Hunter Heck", [set(6, 2), set(6, 4)], "completed", false, "player"),
  match("2026-08-02", "ATP Challenger", "hard", "Erik Arutiunian", [set(7, 6, 7, 1), set(6, 2)], "completed", false, "player"),
  match("2026-08-01", "ATP Challenger", "hard", "Konstantin Bittaun Kauzmine", [set(6, 4), set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-31", "ATP Challenger", "hard", "Vadim Ursu", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-07-30", "ATP Challenger", "hard", "Dan Added", [set(3, 6), set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-07-28", "ATP Challenger", "hard", "Šunsuke Nakagawa", [set(6, 2), set(6, 2)], "completed", true, "player"),
  match("2026-07-27", "ATP Challenger", "hard", "Melih Anavatan", [set(6, 2), set(6, 2)], "completed", true, "player"),
  match("2026-07-26", "ATP Challenger", "hard", "Anton Tše体ov", [set(6, 1), set(6, 2)], "completed", true, "player"),
  match("2026-07-19", "Challenge...", "hard", "Renta Tokuda", [set(7, 6, 9, 7), set(3, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-07-14", "Canada Granby", "hard", "Blaise Bicknell", [set(1, 6), set(6, 7, 3, 7)], "completed", false, "opponent"),
  match("2026-07-13", "Canada Granby", "hard", "Karl Poling", [set(7, 6, 7, 5), set(5, 7), set(7, 5)], "completed", false, "player"),
  match("2026-07-12", "Canada Granby", "hard", "Bruno Kuzuhara", [set(6, 4), set(7, 6, 8, 6)], "completed", true, "player"),
  match("2026-07-12", "ITF Canada", "hard", "Kigan Rise", [set(2, 6), set(7, 5), set(6, 2)], "completed", false, "player"),
  match("2026-07-11", "ITF Canada", "hard", "Timo Legaut", [set(7, 6, 7, 5), set(6, 4)], "completed", true, "player"),
  match("2026-07-10", "ITF Canada", "hard", "Karl Poling", [set(6, 3), set(6, 4)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Arina Sabalenka.
 * Todos los sets están orientados a Sabalenka, incluso cuando aparece abajo.
 */
export const SABALENKA_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-16", "USA Cincinnati", "hard", "Talia Gibson", [set(6, 2), set(7, 6, 7, 2)], "completed", true, "player"),
  match("2026-08-08", "Canada Toronto", "hard", "Ekaterina Aleksandrova", [set(6, 7, 3, 7), set(6, 4), set(4, 6)], "completed", true, "opponent"),
  match("2026-08-06", "Canada Toronto", "hard", "Šuai Žang", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-08-04", "Canada Toronto", "hard", "Mojuka Utšižima", [set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-07-05", "Wimbledon", "grass", "Naomi Osaka", [set(2, 6), set(6, 7)], "completed", true, "opponent"),
  match("2026-07-03", "Wimbledon", "grass", "Želena Ostapenko", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-07-01", "Wimbledon", "grass", "Mckartnei Kessler", [set(6, 1), set(7, 6, 11, 9)], "completed", true, "player"),
  match("2026-06-29", "Wimbledon", "grass", "Teodora Kostovic", [set(6, 2), set(6, 3)], "completed", true, "player"),
  match("2026-06-20", "Berlin, Germany", "grass", "Žessika Pegula", [set(4, 6), set(7, 6, 7, 4), set(0, 6)], "completed", true, "opponent"),
  match("2026-06-19", "Berlin, Germany", "grass", "Nikola Bartunkova", [set(2, 6), set(7, 6, 7, 2), set(6, 4)], "completed", true, "player"),
  match("2026-06-17", "Berlin, Germany", "grass", "Ekaterina Aleksandrova", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-06-03", "Roland Garros", "clay", "Diana Šnaider", [set(6, 3), set(5, 7), set(0, 6)], "completed", true, "opponent"),
  match("2026-06-01", "Roland Garros", "clay", "Naomi Osaka", [set(7, 5), set(6, 3)], "completed", true, "player"),
  match("2026-05-30", "Roland Garros", "clay", "Kasatkina, Darya", [set(6, 0), set(7, 5)], "completed", true, "player"),
  match("2026-05-28", "Roland Garros", "clay", "Elsa Žacvitsemot", [set(7, 5), set(6, 2)], "completed", true, "player"),
  match("2026-05-26", "Roland Garros", "clay", "Žessika Bauzas Maneiro", [set(6, 4), set(6, 2)], "completed", true, "player"),
  match("2026-05-09", "ROM", "clay", "Sorana Cirsti", [set(6, 2), set(3, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-05-07", "ROM", "clay", "Barbora Krežcikova", [set(6, 2), set(6, 3)], "completed", true, "player"),
  match("2026-04-28", "Spain Madrid", "clay", "Hailei Baptiste", [set(6, 2), set(2, 6), set(6, 7, 6, 8)], "completed", true, "opponent"),
  match("2026-04-27", "Spain Madrid", "clay", "Naomi Osaka", [set(6, 7, 1, 7), set(6, 3), set(6, 2)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Ksinju Wang (Wang Xinyu).
 * Todos los sets están orientados a Wang, incluso cuando aparece abajo.
 */
export const XINYU_WANG_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-16", "USA Cincinnati", "hard", "Donna Vekic", [set(3, 6), set(6, 1), set(6, 4)], "completed", true, "player"),
  match("2026-08-14", "USA Cincinnati", "hard", "Hanne Vandewinkel", [set(6, 4), set(6, 3)], "completed", true, "player"),
  match("2026-08-03", "Canada Toronto", "hard", "Kasatkina, Darya", [set(6, 1), set(6, 7, 5, 7), set(5, 7)], "completed", true, "opponent"),
  match("2026-07-29", "WAS", "hard", "Ludmilla Samsonova", [set(2, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-07-28", "WAS", "hard", "Žulieta Pareža", [set(7, 6, 7, 3), set(6, 3)], "completed", false, "player"),
  match("2026-07-01", "Wimbledon", "grass", "Belinda Bencic", [set(5, 7), set(0, 6)], "completed", false, "opponent"),
  match("2026-06-29", "Wimbledon", "grass", "Elisabetta Kotsiaretto", [set(6, 3), set(2, 6), set(6, 2)], "completed", true, "player"),
  match("2026-06-26", "WTA Bad Homburg", "grass", "Naomi Osaka", [set(3, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-26", "WTA Bad Homburg", "grass", "Elina Svitolina", [], "walkover", true, "player"),
  match("2026-06-23", "WTA Bad Homburg", "grass", "Leilah Annie Fernandez", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-06-22", "WTA Bad Homburg", "grass", "Renata Zarazua", [set(6, 1), set(6, 2)], "completed", false, "player"),
  match("2026-06-16", "Berlin, Germany", "grass", "Madison Keis", [set(6, 7, 3, 7), set(1, 6)], "completed", false, "opponent"),
  match("2026-05-27", "Roland Garros", "clay", "Tamara Korpatstš", [set(2, 6), set(6, 2), set(3, 6)], "completed", false, "opponent"),
  match("2026-05-24", "Roland Garros", "clay", "Lilli Tagger", [set(6, 3), set(3, 6), set(6, 4)], "completed", false, "player"),
  match("2026-05-17", "France Strasbourg", "clay", "Lois Boisson", [set(3, 6), set(6, 7, 4, 7)], "completed", true, "opponent"),
  match("2026-05-08", "ROM", "clay", "Aleksandra Ila", [set(4, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-04-30", "WTA La Bisbal", "clay", "Alina Tšaraeva", [set(5, 7), set(6, 3), set(6, 7, 1, 7)], "completed", true, "opponent"),
  match("2026-04-28", "WTA La Bisbal", "clay", "Kaitlin kuevedo", [set(6, 3), set(6, 0)], "completed", true, "player"),
  match("2026-04-23", "Spain Madrid", "clay", "Laura Samson", [set(6, 2), set(3, 6), set(0, 6)], "completed", true, "opponent"),
  match("2026-04-16", "Rouen, France", "clay", "Sorana Cirsti", [set(3, 5)], "retired", true, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Rafael Žodar.
 * Todos los sets están orientados a Jódar, incluso cuando aparece abajo.
 */
export const JODAR_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "Aležandro Tabilo", [set(6, 2), set(6, 1)], "completed", true, "player"),
  match("2026-08-15", "USA Cincinnati", "hard", "Denis Šapovalov", [set(7, 5), set(4, 6), set(7, 5)], "completed", true, "player"),
  match("2026-08-12", "Canada Montreal", "hard", "Brandon Nakašima", [set(6, 7, 3, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-08-11", "Canada Montreal", "hard", "Arsur Fils", [set(7, 6), set(6, 3)], "completed", true, "player"),
  match("2026-08-08", "Canada Montreal", "hard", "Žiri Lehecka", [set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-08-06", "Canada Montreal", "hard", "Lorenzo Musetti", [set(6, 4), set(6, 3)], "completed", true, "player"),
  match("2026-08-05", "Canada Montreal", "hard", "Korentin Mautet", [set(4, 6), set(6, 1), set(6, 3)], "completed", true, "player"),
  match("2026-08-03", "USA Washington", "hard", "Tailor Fritz", [set(6, 7), set(4, 6)], "completed", false, "opponent"),
  match("2026-08-01", "USA Washington", "hard", "Aležandro Tabilo", [set(6, 7, 6, 8), set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-07-31", "USA Washington", "hard", "Lorenzo Musetti", [set(1, 6), set(6, 1), set(6, 4)], "completed", true, "player"),
  match("2026-07-29", "USA Washington", "hard", "Kei Nišikori", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-07-28", "USA Washington", "hard", "Arsur Fils", [set(7, 6), set(6, 3)], "completed", false, "player"),
  match("2026-07-03", "Wimbledon", "grass", "Šintaro Motšizuki", [set(6, 1), set(6, 7, 5, 7), set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-01", "Wimbledon", "grass", "Pablo Karreno-Busta", [set(3, 6), set(6, 3), set(1, 6), set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-06-29", "Wimbledon", "grass", "Feliks Gill", [set(6, 3), set(6, 3), set(7, 5)], "completed", true, "player"),
  match("2026-06-02", "Roland Garros", "clay", "Aleksander Zverev", [set(6, 7), set(1, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-05-31", "Roland Garros", "clay", "Pablo Karreno-Busta", [set(4, 6), set(4, 6), set(6, 1), set(6, 2), set(6, 2)], "completed", true, "player"),
  match("2026-05-29", "Roland Garros", "clay", "Aleks Mitšelsen", [set(7, 6), set(6, 7), set(4, 6), set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-05-27", "Roland Garros", "clay", "Žames Duckwors", [set(6, 1), set(6, 7, 5, 7), set(6, 4), set(7, 5)], "completed", false, "player"),
  match("2026-05-25", "Roland Garros", "clay", "Aleksandar Kovasevic", [set(6, 1), set(6, 0), set(6, 4)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Flavio Kobolli.
 * Todos los sets están orientados a Cobolli, incluso cuando aparece abajo.
 */
export const COBOLLI_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "Aleksander Blockks", [set(7, 5), set(4, 6), set(7, 5)], "completed", false, "player"),
  match("2026-08-15", "USA Cincinnati", "hard", "Miomir Kecmanovic", [set(6, 1), set(4, 6), set(6, 3)], "completed", false, "player"),
  match("2026-08-04", "Canada Montreal", "hard", "Jannick Hanfmann", [set(6, 7), set(6, 7)], "completed", true, "opponent"),
  match("2026-07-15", "Croatia Umag", "clay", "Roman Andres Burrutšaga", [set(2, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-08", "Wimbledon", "grass", "Arsur Feri", [set(4, 6), set(6, 7, 4, 7), set(0, 6)], "completed", true, "opponent"),
  match("2026-07-06", "Wimbledon", "grass", "Aleks De Minaur", [set(7, 5), set(7, 6, 7, 4), set(6, 3)], "completed", false, "player"),
  match("2026-07-04", "Wimbledon", "grass", "Karen Hatšanov", [set(0, 6), set(7, 6, 7, 4), set(6, 7, 5, 7), set(6, 2), set(6, 2)], "completed", false, "player"),
  match("2026-07-02", "Wimbledon", "grass", "Žames Duckwors", [set(7, 6, 7, 4), set(3, 6), set(7, 6, 7, 3), set(6, 1)], "completed", false, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Mariano Navüan", [set(1, 6), set(7, 6, 7, 5), set(6, 3), set(7, 6, 10, 8)], "completed", false, "player"),
  match("2026-06-15", "Germany Halle", "grass", "Francis Tiafoe", [set(2, 6), set(6, 7, 4, 7)], "completed", true, "opponent"),
  match("2026-06-07", "Roland Garros", "clay", "Aleksander Zverev", [set(1, 6), set(6, 4), set(4, 6), set(7, 6), set(1, 6)], "completed", true, "opponent"),
  match("2026-06-05", "Roland Garros", "clay", "Matteo Arnaldi", [], "walkover", false, "player"),
  match("2026-06-03", "Roland Garros", "clay", "Feliks Auger-Aliassime", [set(4, 6), set(6, 4), set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-06-01", "Roland Garros", "clay", "Zatšari Svažda", [set(6, 2), set(6, 3), set(6, 7), set(7, 6)], "completed", true, "player"),
  match("2026-05-30", "Roland Garros", "clay", "Lirner Tien", [set(6, 2), set(6, 2), set(6, 3)], "completed", true, "player"),
  match("2026-05-28", "Roland Garros", "clay", "libing Wu", [set(6, 4), set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-05-25", "Roland Garros", "clay", "Andri Pellegrino", [set(6, 4), set(7, 6, 7, 4), set(6, 3)], "completed", true, "player"),
  match("2026-05-19", "ATP Hamburg", "clay", "Ignacio Buse", [set(2, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-05-11", "ROM", "clay", "Siago Agustin Tirante", [set(3, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-09", "ROM", "clay", "Terense Atmane", [set(7, 6, 7, 1), set(6, 3)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Siago Agustin Tirante.
 * Todos los sets están orientados a Tirante, incluso cuando aparece abajo.
 */
export const TIRANTE_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "Martin Landaluse", [set(7, 6, 7, 5), set(7, 6, 7, 4)], "completed", true, "player"),
  match("2026-08-15", "USA Cincinnati", "hard", "Novak Džokovic", [set(2, 6), set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-08-13", "USA Cincinnati", "hard", "Žan Tšoinski", [set(7, 6, 11, 9), set(6, 7, 7, 9), set(7, 6, 7, 4)], "completed", true, "player"),
  match("2026-08-09", "Canada Montreal", "hard", "Lirner Tien", [set(4, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-08-07", "Canada Montreal", "hard", "Aleksei Popirin", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-08-05", "Canada Montreal", "hard", "Tailor Fritz", [set(7, 5), set(6, 3)], "completed", true, "player"),
  match("2026-08-04", "Canada Montreal", "hard", "Dunkan Tšan", [set(6, 3), set(1, 6), set(7, 6)], "completed", false, "player"),
  match("2026-07-17", "Sweden Båstad", "clay", "Aležandro Tabilo", [], "walkover", false, "opponent"),
  match("2026-07-16", "Sweden Båstad", "clay", "Nikoloz Basilašvili", [set(7, 5), set(3, 6), set(6, 4)], "completed", false, "player"),
  match("2026-07-14", "Sweden Båstad", "clay", "Sebastian Ofner", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-06-29", "Wimbledon", "grass", "Fabian Marozsan", [set(5, 7), set(3, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-24", "Great Britain", "grass", "Tobi Samuel", [set(1, 6), set(6, 7, 7, 9)], "completed", false, "opponent"),
  match("2026-06-23", "Great Britain", "grass", "Hamiš Stewart", [set(7, 5), set(6, 2)], "completed", true, "player"),
  match("2026-05-29", "Roland Garros", "clay", "Pablo Karreno-Busta", [set(6, 7), set(5, 7), set(6, 3), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-27", "Roland Garros", "clay", "Aležandro Davidovich Fokina", [set(4, 6), set(7, 6, 7, 4), set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-05-24", "Roland Garros", "clay", "Pablo Llamas Ruíz", [set(6, 3), set(7, 6, 8, 6), set(6, 7, 5, 7), set(6, 0)], "completed", false, "player"),
  match("2026-05-18", "Switzerland", "clay", "Arsur Rinderknetš", [set(4, 6), set(1, 6)], "completed", false, "opponent"),
  match("2026-05-12", "ROM", "clay", "Daniil Medvedev", [set(3, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-05-11", "ROM", "clay", "Flavio Kobolli", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-05-09", "ROM", "clay", "Kameron Norrie", [set(6, 3), set(7, 5)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Žakub Mensik.
 * Todos los sets están orientados a Mensik, incluso cuando aparece abajo.
 */
export const MENSIK_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "Rinki Hižikata", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-08-15", "USA Cincinnati", "hard", "Mattia Bellutsi", [set(7, 5), set(2, 6), set(7, 6, 7, 5)], "completed", false, "player"),
  match("2026-08-11", "Canada Montreal", "hard", "Ben Šelton", [set(3, 6), set(1, 6)], "completed", true, "opponent"),
  match("2026-08-09", "Canada Montreal", "hard", "Botic van de Zandschulp", [set(6, 4), set(7, 5)], "completed", false, "player"),
  match("2026-08-07", "Canada Montreal", "hard", "Terense Atmane", [set(7, 5), set(6, 4)], "completed", false, "player"),
  match("2026-08-05", "Canada Montreal", "hard", "Žakob Firnlei", [set(6, 3), set(3, 6), set(6, 3)], "completed", false, "player"),
  match("2026-07-30", "USA Washington", "hard", "Brandon Nakašima", [set(6, 7, 5, 7), set(6, 3), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-28", "USA Washington", "hard", "Trevor Svažda", [set(6, 2), set(6, 7), set(6, 3)], "completed", false, "player"),
  match("2026-07-02", "Wimbledon", "grass", "Grigor Dimitrov", [set(6, 7, 5, 7), set(6, 4), set(5, 7), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-30", "Wimbledon", "grass", "Tobi Samuel", [set(5, 7), set(6, 3), set(6, 3), set(3, 6), set(7, 6, 10, 7)], "completed", true, "player"),
  match("2026-06-16", "Great Britain", "grass", "Adrian Mannarino", [set(7, 5), set(6, 7, 3, 7), set(6, 7, 5, 7)], "completed", true, "opponent"),
  match("2026-06-05", "Roland Garros", "clay", "Aleksander Zverev", [set(5, 7), set(2, 6), set(6, 3), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-02", "Roland Garros", "clay", "Žoao Fonseka", [set(6, 4), set(6, 3), set(7, 6)], "completed", true, "player"),
  match("2026-05-31", "Roland Garros", "clay", "Andrei Rublev", [set(6, 3), set(7, 6, 8, 6), set(4, 6), set(2, 6), set(6, 3)], "completed", true, "player"),
  match("2026-05-29", "Roland Garros", "clay", "Aleks De Minaur", [set(0, 6), set(6, 2), set(6, 2), set(6, 3)], "completed", false, "player"),
  match("2026-05-27", "Roland Garros", "clay", "Mariano Navüan", [set(6, 3), set(2, 6), set(6, 4), set(1, 6), set(7, 6, 13, 11)], "completed", false, "player"),
  match("2026-05-24", "Roland Garros", "clay", "Titauan Drogat", [set(6, 3), set(6, 2), set(6, 4)], "completed", false, "player"),
  match("2026-05-20", "ATP Hamburg", "clay", "Ignacio Buse", [set(0, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-05-18", "ATP Hamburg", "clay", "Žan-Lennard Struff", [set(7, 6, 7, 3), set(6, 2)], "completed", true, "player"),
  match("2026-05-09", "ROM", "clay", "Aleksei Popirin", [set(3, 6), set(6, 2), set(4, 6)], "completed", false, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Aleksander Zverev.
 * Todos los sets están orientados a Zverev, incluso cuando aparece abajo.
 */
export const ZVEREV_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "Terense Atmane", [set(7, 6, 7, 4), set(7, 6, 8, 6)], "completed", true, "player"),
  match("2026-08-15", "USA Cincinnati", "hard", "Kameron Norrie", [set(3, 6), set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-08-05", "Canada Montreal", "hard", "Tollon Griekspur", [set(7, 6), set(2, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-12", "Wimbledon", "grass", "Žannik Sinner", [set(7, 6, 9, 7), set(6, 7, 2, 7), set(3, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-10", "Wimbledon", "grass", "Arsur Feri", [set(7, 6), set(6, 2), set(6, 4)], "completed", false, "player"),
  match("2026-07-08", "Wimbledon", "grass", "Tailor Fritz", [set(6, 4), set(6, 4), set(6, 2)], "completed", false, "player"),
  match("2026-07-06", "Wimbledon", "grass", "Žiri Lehecka", [set(6, 4), set(7, 5), set(3, 6), set(7, 6, 8, 6)], "completed", false, "player"),
  match("2026-07-04", "Wimbledon", "grass", "Markos Giron", [set(6, 2), set(7, 6, 7, 4), set(6, 4)], "completed", false, "player"),
  match("2026-07-02", "Wimbledon", "grass", "Valentin Roir", [set(6, 1), set(6, 3), set(7, 6, 7, 3)], "completed", false, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Aleksander Blockks", [set(6, 4), set(6, 7, 8, 10), set(7, 6, 7, 5), set(7, 6, 9, 7)], "completed", false, "player"),
  match("2026-06-20", "Germany Halle", "grass", "Tailor Fritz", [set(7, 6, 7, 4), set(4, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-06-19", "Germany Halle", "grass", "Rafael Kollignon", [set(7, 6, 12, 10), set(7, 6, 7, 2)], "completed", true, "player"),
  match("2026-06-18", "Germany Halle", "grass", "Jannick Hanfmann", [set(6, 3), set(7, 6, 7, 4)], "completed", true, "player"),
  match("2026-06-16", "Germany Halle", "grass", "Vit Kopriva", [set(6, 3), set(4, 6), set(6, 2)], "completed", true, "player"),
  match("2026-06-07", "Roland Garros", "clay", "Flavio Kobolli", [set(6, 1), set(4, 6), set(6, 4), set(6, 7), set(6, 1)], "completed", false, "player"),
  match("2026-06-05", "Roland Garros", "clay", "Žakub Mensik", [set(7, 5), set(6, 2), set(3, 6), set(6, 3)], "completed", false, "player"),
  match("2026-06-02", "Roland Garros", "clay", "Rafael Žodar", [set(7, 6), set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-05-31", "Roland Garros", "clay", "Žesper De Žong", [set(7, 6, 7, 3), set(6, 4), set(6, 1)], "completed", false, "player"),
  match("2026-05-29", "Roland Garros", "clay", "kuentin Halis", [set(6, 4), set(6, 3), set(5, 7), set(6, 2)], "completed", false, "player"),
  match("2026-05-27", "Roland Garros", "clay", "Tomas Matšac", [set(6, 4), set(6, 2), set(6, 2)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Tommi Paul.
 * Todos los sets están orientados a Paul, incluso cuando aparece abajo.
 */
export const PAUL_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "Adolfo Daniel Valležo", [set(3, 6), set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-08-15", "USA Cincinnati", "hard", "Hubert Hurkacz", [set(6, 4), set(6, 7, 3, 7), set(6, 3)], "completed", true, "player"),
  match("2026-08-07", "Canada Montreal", "hard", "Lirner Tien", [set(3, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-08-05", "Canada Montreal", "hard", "Valentin Roir", [set(6, 4), set(7, 6)], "completed", false, "player"),
  match("2026-07-28", "USA Washington", "hard", "Kamil Mažtšrzak", [set(5, 7), set(6, 7)], "completed", false, "opponent"),
  match("2026-07-03", "Wimbledon", "grass", "Hubert Hurkacz", [set(6, 4), set(6, 7, 5, 7), set(5, 7), set(2, 6)], "completed", false, "opponent"),
  match("2026-07-01", "Wimbledon", "grass", "Soon Woo Kwon", [set(6, 3), set(7, 6, 7, 4), set(6, 2)], "completed", false, "player"),
  match("2026-06-29", "Wimbledon", "grass", "Aleksandre Muller", [set(6, 1), set(6, 2), set(6, 1)], "completed", false, "player"),
  match("2026-06-21", "Great Britain", "grass", "Francisko Serundolo", [set(7, 6, 7, 4), set(4, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-20", "Great Britain", "grass", "Ugo Humbert", [set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-06-19", "Great Britain", "grass", "Aležandro Davidovich Fokina", [set(6, 3), set(7, 6, 7, 4)], "completed", true, "player"),
  match("2026-06-18", "Great Britain", "grass", "Botic van de Zandschulp", [set(7, 6, 7, 5), set(6, 3)], "completed", true, "player"),
  match("2026-06-15", "Great Britain", "grass", "Zatšari Svažda", [set(7, 5), set(6, 3)], "completed", true, "player"),
  match("2026-05-29", "Roland Garros", "clay", "Kasper Ruud", [set(6, 4), set(7, 6, 7, 4), set(4, 6), set(6, 7, 4, 7), set(5, 7)], "completed", false, "opponent"),
  match("2026-05-27", "Roland Garros", "clay", "Lorenzo Süango", [set(6, 3), set(6, 2), set(6, 4)], "completed", false, "player"),
  match("2026-05-25", "Roland Garros", "clay", "Rinki Hižikata", [set(4, 6), set(6, 3), set(7, 5), set(6, 4)], "completed", false, "player"),
  match("2026-05-23", "ATP Hamburg", "clay", "Ignacio Buse", [set(6, 7, 6, 8), set(6, 4), set(3, 6)], "completed", false, "opponent"),
  match("2026-05-22", "ATP Hamburg", "clay", "Aleks De Minaur", [set(2, 6), set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-05-21", "ATP Hamburg", "clay", "Daniel Altmaier", [set(6, 2), set(7, 5)], "completed", true, "player"),
  match("2026-05-19", "ATP Hamburg", "clay", "Tomas Martin Ettševerri", [set(6, 7, 5, 7), set(7, 6, 7, 5), set(7, 6, 9, 7)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Arsur Fils.
 * Todos los sets están orientados a Fils, incluso cuando aparece abajo.
 */
export const FILS_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "Žiri Lehecka", [set(6, 1), set(6, 7, 7, 9), set(6, 3)], "completed", false, "player"),
  match("2026-08-15", "USA Cincinnati", "hard", "Jannick Hanfmann", [set(7, 6, 7, 5), set(6, 1)], "completed", false, "player"),
  match("2026-08-11", "Canada Montreal", "hard", "Rafael Žodar", [set(6, 7), set(3, 6)], "completed", false, "opponent"),
  match("2026-08-08", "Canada Montreal", "hard", "Kameron Norrie", [set(6, 2), set(7, 6, 10, 8)], "completed", true, "player"),
  match("2026-08-06", "Canada Montreal", "hard", "Mariano Navüan", [set(6, 3), set(6, 2)], "completed", false, "player"),
  match("2026-08-05", "Canada Montreal", "hard", "Zatšari Svažda", [set(6, 4), set(3, 6), set(6, 1)], "completed", false, "player"),
  match("2026-07-28", "USA Washington", "hard", "Rafael Žodar", [set(6, 7), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-02", "Wimbledon", "grass", "Matteo Berrettini", [set(4, 6), set(5, 7), set(6, 3), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-30", "Wimbledon", "grass", "Rafael Kollignon", [set(7, 5), set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-05-09", "ROM", "clay", "Andri Pellegrino", [set(0, 4)], "retired", false, "opponent"),
  match("2026-05-01", "Spain Madrid", "clay", "Žannik Sinner", [set(2, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-04-29", "Spain Madrid", "clay", "Žiri Lehecka", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-04-28", "Spain Madrid", "clay", "Tomas Martin Ettševerri", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-04-26", "Spain Madrid", "clay", "Emilio Nava", [set(7, 6, 7, 2), set(6, 3)], "completed", true, "player"),
  match("2026-04-24", "Spain Madrid", "clay", "Ignacio Buse", [set(6, 7, 4, 7), set(7, 6, 7, 3), set(7, 5)], "completed", true, "player"),
  match("2026-04-19", "Spain Barcelona", "clay", "Andrei Rublev", [set(6, 2), set(7, 6, 7, 2)], "completed", false, "player"),
  match("2026-04-18", "Spain Barcelona", "clay", "Rafael Žodar", [set(3, 6), set(6, 3), set(6, 2)], "completed", false, "player"),
  match("2026-04-17", "Spain Barcelona", "clay", "Lorenzo Musetti", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-04-16", "Spain Barcelona", "clay", "Brandon Nakašima", [set(6, 2), set(6, 3)], "completed", true, "player"),
  match("2026-04-14", "Spain Barcelona", "clay", "Terense Atmane", [set(4, 6), set(6, 4), set(7, 6, 9, 7)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Aleks De Minaur.
 * Todos los sets están orientados a De Minaur, incluso cuando aparece abajo.
 */
export const DE_MINAUR_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "Arsur Feri", [set(7, 5), set(7, 6, 7, 3)], "completed", false, "player"),
  match("2026-08-15", "USA Cincinnati", "hard", "kuentin Halis", [set(1, 6), set(6, 3), set(7, 6, 7, 4)], "completed", false, "player"),
  match("2026-08-06", "Canada Montreal", "hard", "Kameron Norrie", [set(7, 5), set(6, 7, 5, 7), set(1, 6)], "completed", false, "opponent"),
  match("2026-08-04", "Canada Montreal", "hard", "Žames Duckwors", [set(6, 2), set(7, 6)], "completed", false, "player"),
  match("2026-07-31", "USA Washington", "hard", "Brandon Nakašima", [set(6, 7, 5, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-30", "USA Washington", "hard", "Cruz Hewitt", [set(6, 2), set(6, 3)], "completed", true, "player"),
  match("2026-07-29", "USA Washington", "hard", "Stefanos Tsitsipas", [set(6, 4), set(3, 6), set(6, 3)], "completed", true, "player"),
  match("2026-07-06", "Wimbledon", "grass", "Flavio Kobolli", [set(5, 7), set(6, 7, 4, 7), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-04", "Wimbledon", "grass", "Zatšari Svažda", [set(6, 2), set(5, 7), set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-07-02", "Wimbledon", "grass", "Adrian Mannarino", [set(6, 3), set(6, 2), set(6, 2)], "completed", true, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Roman Andres Burrutšaga", [set(7, 6, 7, 5), set(6, 1), set(6, 0)], "completed", true, "player"),
  match("2026-06-19", "Great Britain", "grass", "Brandon Nakašima", [set(5, 7), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-17", "Great Britain", "grass", "Denis Šapovalov", [set(6, 4), set(6, 1)], "completed", true, "player"),
  match("2026-06-16", "Great Britain", "grass", "Gabriel Diallo", [set(7, 6, 10, 8), set(6, 3)], "completed", true, "player"),
  match("2026-06-14", "ATP S-Hertogenbosch", "grass", "Kamil Mažtšrzak", [set(3, 6), set(6, 2), set(6, 7, 5, 7)], "completed", false, "opponent"),
  match("2026-06-13", "ATP S-Hertogenbosch", "grass", "Adrian Mannarino", [set(6, 4), set(6, 0)], "completed", false, "player"),
  match("2026-06-12", "ATP S-Hertogenbosch", "grass", "Benžamin Bonzi", [set(6, 2), set(6, 4)], "completed", false, "player"),
  match("2026-06-10", "ATP S-Hertogenbosch", "grass", "Martin Damm Žr", [set(7, 6, 10, 8), set(7, 5)], "completed", false, "player"),
  match("2026-05-29", "Roland Garros", "clay", "Žakub Mensik", [set(6, 0), set(2, 6), set(2, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-05-27", "Roland Garros", "clay", "Aleksander Blockks", [], "walkover", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Iga Swiatek.
 * Todos los sets están orientados a Swiatek, incluso cuando aparece abajo.
 */
export const SWIATEK_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "Maria Sakkari", [set(4, 6), set(6, 1), set(6, 1)], "completed", true, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Emiliana Arango", [set(6, 3), set(6, 0)], "completed", true, "player"),
  match("2026-08-13", "Canada Toronto", "hard", "Elena Ribakina", [set(6, 2), set(6, 3)], "completed", true, "player"),
  match("2026-08-12", "Canada Toronto", "hard", "Elina Svitolina", [set(6, 3), set(1, 6), set(6, 3)], "completed", false, "player"),
  match("2026-08-10", "Canada Toronto", "hard", "Diana Šnaider", [set(6, 2), set(6, 1)], "completed", false, "player"),
  match("2026-08-08", "Canada Toronto", "hard", "Marta Kostjuk", [set(3, 6), set(6, 1), set(6, 2)], "completed", false, "player"),
  match("2026-08-06", "Canada Toronto", "hard", "Viktoriža Golubic", [set(6, 2), set(6, 1)], "completed", false, "player"),
  match("2026-08-04", "Canada Toronto", "hard", "Sara Bežlek", [set(6, 0), set(6, 3)], "completed", false, "player"),
  match("2026-07-04", "Wimbledon", "grass", "Aleksandra Ila", [set(6, 7, 9, 11), set(2, 6)], "completed", false, "opponent"),
  match("2026-07-02", "Wimbledon", "grass", "Karolina Pliskova", [set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Tailor Townsend", [set(6, 1), set(2, 6), set(6, 3)], "completed", false, "player"),
  match("2026-06-24", "WTA Bad Homburg", "grass", "Emma Navarro", [set(5, 7), set(6, 2), set(3, 6)], "completed", true, "opponent"),
  match("2026-05-31", "Roland Garros", "clay", "Marta Kostjuk", [set(5, 7), set(1, 6)], "completed", false, "opponent"),
  match("2026-05-29", "Roland Garros", "clay", "Magda Linette", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-05-27", "Roland Garros", "clay", "Sara Bežlek", [set(6, 2), set(6, 3)], "completed", false, "player"),
  match("2026-05-25", "Roland Garros", "clay", "Emerson Žüans", [set(6, 1), set(6, 2)], "completed", false, "player"),
  match("2026-05-14", "ROM", "clay", "Elina Svitolina", [set(4, 6), set(6, 2), set(2, 6)], "completed", true, "opponent"),
  match("2026-05-13", "ROM", "clay", "Žessika Pegula", [set(6, 1), set(6, 2)], "completed", false, "player"),
  match("2026-05-11", "ROM", "clay", "Naomi Osaka", [set(6, 2), set(6, 1)], "completed", false, "player"),
  match("2026-05-10", "ROM", "clay", "Elisabetta Kotsiaretto", [set(6, 1), set(6, 0)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Diane Parri.
 * Todos los sets están orientados a Parry, incluso cuando aparece abajo.
 */
export const PARRY_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "Lois Boisson", [set(4, 6), set(6, 4), set(6, 3)], "completed", true, "player"),
  match("2026-08-15", "USA Cincinnati", "hard", "Elise Mertens", [set(2, 6), set(6, 2), set(6, 2)], "completed", false, "player"),
  match("2026-08-13", "USA Cincinnati", "hard", "Karoline Dolehide", [set(6, 4), set(7, 6, 9, 7)], "completed", true, "player"),
  match("2026-08-03", "Canada Toronto", "hard", "Kaila Dai", [set(6, 3), set(3, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-07-21", "Czech Republic", "clay", "Mai Hontama", [set(4, 6), set(0, 6)], "completed", true, "opponent"),
  match("2026-07-01", "Wimbledon", "grass", "Anna Kalinskaja", [set(4, 6), set(6, 3), set(6, 7, 8, 10)], "completed", true, "opponent"),
  match("2026-06-29", "Wimbledon", "grass", "Franseska Žüans", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-06-21", "WTA Bad Homburg", "grass", "Irina-Kamelia Begu", [set(4, 6), set(6, 7, 5, 7)], "completed", true, "opponent"),
  match("2026-06-20", "WTA Bad Homburg", "grass", "Aoi Ito", [set(6, 2), set(6, 1)], "completed", true, "player"),
  match("2026-06-18", "Berlin, Germany", "grass", "Linda Noskova", [set(2, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-06-16", "Berlin, Germany", "grass", "clara Tauson", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-06-15", "Berlin, Germany", "grass", "Anhelina Kalinina", [set(6, 4), set(7, 5)], "completed", true, "player"),
  match("2026-06-14", "Berlin, Germany", "grass", "Ella Seidel", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-06-01", "Roland Garros", "clay", "Maža Tšwalinska", [set(3, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-30", "Roland Garros", "clay", "Amanda Anisimova", [set(6, 3), set(4, 6), set(7, 6, 10, 3)], "completed", true, "player"),
  match("2026-05-28", "Roland Garros", "clay", "Ann Li", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-05-26", "Roland Garros", "clay", "Anhelina Kalinina", [set(0, 6), set(6, 2), set(6, 4)], "completed", false, "player"),
  match("2026-05-20", "France Strasbourg", "clay", "Šuai Žang", [set(2, 6), set(5, 7)], "completed", false, "opponent"),
  match("2026-05-19", "France Strasbourg", "clay", "Emma Radukanu", [set(6, 4), set(7, 6, 7, 4)], "completed", true, "player"),
  match("2026-05-17", "WTA 125K Paris", "clay", "Madison Keis", [set(3, 6), set(3, 3)], "retired", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Sorana Cirsti.
 * Todos los sets están orientados a Cirsti, incluso cuando aparece abajo.
 */
export const CIRSTEA_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "Anna Kalinskaja", [set(6, 7, 4, 7), set(6, 1), set(5, 0)], "retired", true, "player"),
  match("2026-08-15", "USA Cincinnati", "hard", "Nikola Bartunkova", [set(7, 6, 7, 5), set(6, 3)], "completed", true, "player"),
  match("2026-08-05", "Canada Toronto", "hard", "Maja Žoint", [set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-04", "Wimbledon", "grass", "Linda Noskova", [set(6, 2), set(3, 6), set(6, 7, 9, 11)], "completed", true, "opponent"),
  match("2026-07-02", "Wimbledon", "grass", "Kimberli Birrell", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Sara Bežlek", [set(6, 1), set(7, 6, 8, 6)], "completed", true, "player"),
  match("2026-06-12", "WTA London", "grass", "Emma Radukanu", [set(4, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-09", "England Nottingham", "grass", "Maddison Inglis", [set(6, 4), set(5, 7), set(6, 2)], "completed", true, "player"),
  match("2026-06-02", "Roland Garros", "clay", "Mirra Andriva", [set(0, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-05-31", "Roland Garros", "clay", "Ksiiu Wang", [set(6, 3), set(7, 6, 7, 4)], "completed", true, "player"),
  match("2026-05-29", "Roland Garros", "clay", "Solana Sierra", [set(6, 0), set(6, 0)], "completed", false, "player"),
  match("2026-05-27", "Roland Garros", "clay", "Eva Lis", [set(6, 3), set(6, 0)], "completed", false, "player"),
  match("2026-05-24", "Roland Garros", "clay", "Ksenia Efremova", [set(6, 3), set(6, 1)], "completed", false, "player"),
  match("2026-05-14", "ROM", "clay", "Kori Gauff", [set(4, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-05-12", "ROM", "clay", "Želena Ostapenko", [set(6, 1), set(7, 6)], "completed", true, "player"),
  match("2026-05-11", "ROM", "clay", "Linda Noskova", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-05-09", "ROM", "clay", "Arina Sabalenka", [set(2, 6), set(6, 3), set(7, 5)], "completed", false, "player"),
  match("2026-05-07", "ROM", "clay", "Tatžana Maria", [set(6, 2), set(6, 0)], "completed", false, "player"),
  match("2026-04-26", "Spain Madrid", "clay", "Kori Gauff", [set(6, 4), set(5, 7), set(1, 6)], "completed", true, "opponent"),
  match("2026-04-24", "Spain Madrid", "clay", "Tira Katerina Grant", [set(6, 2), set(7, 6, 7, 5)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Žessika Pegula.
 * Todos los sets están orientados a Pegula, incluso cuando aparece abajo.
 */
export const PEGULA_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "Emma Navarro", [set(7, 5), set(6, 2)], "completed", false, "player"),
  match("2026-08-15", "USA Cincinnati", "hard", "Simona Waltert", [set(6, 3), set(6, 2)], "completed", false, "player"),
  match("2026-08-08", "Canada Toronto", "hard", "Diana Šnaider", [set(3, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-08-06", "Canada Toronto", "hard", "Kamilla Rahimova", [set(6, 4), set(6, 0)], "completed", true, "player"),
  match("2026-08-05", "Canada Toronto", "hard", "Magdalena Fretš", [set(3, 6), set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-08-02", "WAS", "hard", "Aleksandra Ila", [set(6, 4), set(4, 6), set(0, 6)], "completed", true, "opponent"),
  match("2026-08-01", "WAS", "hard", "Diana Šnaider", [set(7, 5), set(6, 4)], "completed", true, "player"),
  match("2026-07-31", "WAS", "hard", "Anna Kalinskaja", [set(6, 3), set(7, 5)], "completed", true, "player"),
  match("2026-07-30", "WAS", "hard", "Magdalena Fretš", [set(3, 6), set(6, 3), set(6, 0)], "completed", true, "player"),
  match("2026-07-07", "Wimbledon", "grass", "Kori Gauff", [set(6, 4), set(3, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-05", "Wimbledon", "grass", "Iva Žovic", [set(4, 6), set(6, 3), set(6, 1)], "completed", true, "player"),
  match("2026-07-03", "Wimbledon", "grass", "Žessika Bauzas Maneiro", [set(6, 1), set(6, 3)], "completed", true, "player"),
  match("2026-07-01", "Wimbledon", "grass", "Sara Sorribes Tormo", [set(7, 6, 8, 6), set(6, 1)], "completed", true, "player"),
  match("2026-06-29", "Wimbledon", "grass", "Darža Vidmanova", [set(7, 5), set(6, 3)], "completed", true, "player"),
  match("2026-06-21", "Berlin, Germany", "grass", "Linda Noskova", [set(4, 6), set(6, 4), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-20", "Berlin, Germany", "grass", "Arina Sabalenka", [set(6, 4), set(6, 7, 4, 7), set(6, 0)], "completed", false, "player"),
  match("2026-06-19", "Berlin, Germany", "grass", "Madison Keis", [set(7, 6, 7, 5), set(7, 6, 10, 8)], "completed", true, "player"),
  match("2026-06-17", "Berlin, Germany", "grass", "Katerina Siniakova", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-05-26", "Roland Garros", "clay", "Kimberli Birrell", [set(6, 1), set(3, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-05-13", "ROM", "clay", "Iga Swiatek", [set(1, 6), set(2, 6)], "completed", true, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Marta Kostjuk.
 * Todos los sets están orientados a Kostjuk, incluso cuando aparece abajo.
 */
export const KOSTYUK_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "USA Cincinnati", "hard", "Sloane Stefens", [set(7, 5), set(7, 5)], "completed", true, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Sofia Kenin", [set(4, 6), set(6, 3), set(7, 5)], "completed", true, "player"),
  match("2026-08-08", "Canada Toronto", "hard", "Iga Swiatek", [set(6, 3), set(1, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-08-06", "Canada Toronto", "hard", "Madison Keis", [set(6, 3), set(6, 1)], "completed", true, "player"),
  match("2026-08-04", "Canada Toronto", "hard", "Kaserine Sebov", [set(7, 6, 7, 4), set(6, 0)], "completed", true, "player"),
  match("2026-07-09", "Wimbledon", "grass", "Linda Noskova", [set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-08", "Wimbledon", "grass", "Žasmine Paolini", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-07-06", "Wimbledon", "grass", "Ašlin Krueger", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-07-04", "Wimbledon", "grass", "Emma Navarro", [set(6, 2), set(4, 6), set(6, 1)], "completed", false, "player"),
  match("2026-07-02", "Wimbledon", "grass", "Anna Blinkova", [set(6, 7, 5, 7), set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Nadia Podoroska", [set(6, 1), set(6, 2)], "completed", false, "player"),
  match("2026-06-04", "Roland Garros", "clay", "Mirra Andriva", [set(1, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-02", "Roland Garros", "clay", "Elina Svitolina", [set(6, 3), set(2, 6), set(6, 2)], "completed", false, "player"),
  match("2026-05-31", "Roland Garros", "clay", "Iga Swiatek", [set(7, 5), set(6, 1)], "completed", true, "player"),
  match("2026-05-29", "Roland Garros", "clay", "Viktoriža Golubic", [set(6, 4), set(6, 3)], "completed", true, "player"),
  match("2026-05-27", "Roland Garros", "clay", "Katie Volinets", [set(6, 7, 4, 7), set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-05-24", "Roland Garros", "clay", "Oksana Selehmeteva", [set(6, 2), set(6, 3)], "completed", true, "player"),
  match("2026-05-02", "Spain Madrid", "clay", "Mirra Andriva", [set(6, 3), set(7, 5)], "completed", false, "player"),
  match("2026-04-30", "Spain Madrid", "clay", "Anastasia Potapova", [set(6, 2), set(1, 6), set(6, 1)], "completed", true, "player"),
  match("2026-04-29", "Spain Madrid", "clay", "Linda Noskova", [set(7, 6, 7, 1), set(6, 0)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Mirra Andriva.
 * Todos los sets están orientados a Andriva, incluso cuando aparece abajo.
 */
export const ANDREEVA_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "USA Cincinnati", "hard", "Žanise Tžen", [set(6, 1), set(7, 6, 7, 5)], "completed", false, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Oleksandra Oliinikova", [set(6, 1), set(6, 0)], "completed", false, "player"),
  match("2026-08-07", "Canada Toronto", "hard", "Leilah Annie Fernandez", [set(1, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-08-05", "Canada Toronto", "hard", "Karolina Pliskova", [set(6, 0), set(6, 2)], "completed", true, "player"),
  match("2026-07-01", "Wimbledon", "grass", "Barbora Krežcikova", [set(6, 4), set(5, 7), set(4, 6)], "completed", false, "opponent"),
  match("2026-06-29", "Wimbledon", "grass", "Magda Linette", [set(7, 5), set(6, 4)], "completed", false, "player"),
  match("2026-06-24", "WTA Bad Homburg", "grass", "Ekaterina Aleksandrova", [set(3, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-06-06", "Roland Garros", "clay", "Maža Tšwalinska", [set(6, 3), set(6, 2)], "completed", false, "player"),
  match("2026-06-04", "Roland Garros", "clay", "Marta Kostjuk", [set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-06-02", "Roland Garros", "clay", "Sorana Cirsti", [set(6, 0), set(6, 3)], "completed", true, "player"),
  match("2026-05-31", "Roland Garros", "clay", "Žil Teitšmann", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-05-29", "Roland Garros", "clay", "Marie Bauzkova", [set(6, 4), set(6, 2)], "completed", true, "player"),
  match("2026-05-27", "Roland Garros", "clay", "Marina Bassols Ribera", [set(3, 6), set(6, 1), set(6, 1)], "completed", true, "player"),
  match("2026-05-24", "Roland Garros", "clay", "Fiona Ferro", [set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-05-12", "ROM", "clay", "Kori Gauff", [set(6, 4), set(2, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-05-11", "ROM", "clay", "Elise Mertens", [set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-05-09", "ROM", "clay", "Viktoriža Golubic", [set(6, 1), set(4, 6), set(6, 0)], "completed", false, "player"),
  match("2026-05-07", "ROM", "clay", "Antonia Ruzic", [set(6, 1), set(6, 0)], "completed", false, "player"),
  match("2026-05-02", "Spain Madrid", "clay", "Marta Kostjuk", [set(3, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-04-30", "Spain Madrid", "clay", "Hailei Baptiste", [set(6, 4), set(7, 6, 10, 8)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Diana Šnaider.
 * Todos los sets están orientados a Šnaider, incluso cuando aparece abajo.
 */
export const SHNAIDER_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "Maža Tšwalinska", [set(6, 2), set(7, 6, 7, 3)], "completed", true, "player"),
  match("2026-08-15", "USA Cincinnati", "hard", "Tatžana Maria", [set(6, 2), set(7, 5)], "completed", true, "player"),
  match("2026-08-10", "Canada Toronto", "hard", "Iga Swiatek", [set(2, 6), set(1, 6)], "completed", true, "opponent"),
  match("2026-08-08", "Canada Toronto", "hard", "Žessika Pegula", [set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-08-06", "Canada Toronto", "hard", "Anna Kalinskaja", [set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-08-04", "Canada Toronto", "hard", "Rebecka Sramkova", [set(6, 2), set(4, 6), set(6, 1)], "completed", false, "player"),
  match("2026-08-01", "WAS", "hard", "Žessika Pegula", [set(5, 7), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-31", "WAS", "hard", "Ludmilla Samsonova", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-07-30", "WAS", "hard", "Anastasia Potapova", [set(6, 1), set(6, 2)], "completed", true, "player"),
  match("2026-07-02", "Wimbledon", "grass", "Ludmilla Samsonova", [set(4, 6), set(6, 4), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-30", "Wimbledon", "grass", "Eva Lis", [set(7, 5), set(6, 1)], "completed", true, "player"),
  match("2026-06-22", "WTA Bad Homburg", "grass", "clara Tauson", [set(4, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-06-15", "Berlin, Germany", "grass", "Nikola Bartunkova", [set(2, 6), set(7, 6, 7, 2), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-04", "Roland Garros", "clay", "Maža Tšwalinska", [set(6, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-03", "Roland Garros", "clay", "Arina Sabalenka", [set(3, 6), set(7, 5), set(6, 0)], "completed", false, "player"),
  match("2026-06-01", "Roland Garros", "clay", "Madison Keis", [set(6, 3), set(3, 6), set(6, 0)], "completed", false, "player"),
  match("2026-05-30", "Roland Garros", "clay", "Oleksandra Oliinikova", [set(7, 5), set(6, 1)], "completed", true, "player"),
  match("2026-05-28", "Roland Garros", "clay", "Mckartnei Kessler", [set(7, 6, 7, 3), set(6, 1)], "completed", true, "player"),
  match("2026-05-25", "Roland Garros", "clay", "Renata Zarazua", [set(6, 4), set(6, 1)], "completed", true, "player"),
  match("2026-05-10", "ROM", "clay", "Naomi Osaka", [set(1, 6), set(2, 6)], "completed", false, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Elena Ribakina.
 * Todos los sets están orientados a Ribakina, incluso cuando aparece abajo.
 */
export const RYBAKINA_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "Magdalena Fretš", [set(6, 4), set(7, 6, 7, 2)], "completed", false, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Tailor Townsend", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-08-13", "Canada Toronto", "hard", "Iga Swiatek", [set(2, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-08-12", "Canada Toronto", "hard", "Kori Gauff", [set(5, 7), set(6, 2), set(6, 2)], "completed", false, "player"),
  match("2026-08-11", "Canada Toronto", "hard", "Naomi Osaka", [set(4, 6), set(7, 6, 7, 5), set(6, 4)], "completed", false, "player"),
  match("2026-08-09", "Canada Toronto", "hard", "Ludmilla Samsonova", [set(6, 4), set(4, 6), set(6, 4)], "completed", false, "player"),
  match("2026-08-07", "Canada Toronto", "hard", "Ann Li", [set(6, 2), set(7, 5)], "completed", false, "player"),
  match("2026-08-05", "Canada Toronto", "hard", "Kasatkina, Darya", [set(6, 3), set(5, 7), set(6, 4)], "completed", false, "player"),
  match("2026-07-04", "Wimbledon", "grass", "Elise Mertens", [set(6, 7, 4, 7), set(1, 6)], "completed", false, "opponent"),
  match("2026-07-02", "Wimbledon", "grass", "Kaserine McNolli", [set(6, 1), set(6, 2)], "completed", false, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Lois Boisson", [set(6, 4), set(1, 6), set(6, 3)], "completed", false, "player"),
  match("2026-06-18", "Berlin, Germany", "grass", "Aleksandra Ila", [set(5, 7), set(4, 6)], "completed", false, "opponent"),
  match("2026-06-12", "WTA London", "grass", "Katie Baulter", [set(5, 7), set(6, 2), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-12", "WTA London", "grass", "Tatžana Maria", [set(6, 7, 4, 7), set(7, 5), set(6, 0)], "completed", true, "player"),
  match("2026-05-27", "Roland Garros", "clay", "Yulia Starodubtseva", [set(6, 3), set(1, 6), set(6, 7)], "completed", false, "opponent"),
  match("2026-05-25", "Roland Garros", "clay", "Veronika Eržavec", [set(6, 2), set(6, 2)], "completed", false, "player"),
  match("2026-05-13", "ROM", "clay", "Elina Svitolina", [set(6, 2), set(4, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-05-11", "ROM", "clay", "Karolina Pliskova", [set(6, 0), set(6, 2)], "completed", false, "player"),
  match("2026-05-10", "ROM", "clay", "Aleksandra Ila", [set(6, 4), set(6, 3)], "completed", false, "player"),
  match("2026-05-08", "ROM", "clay", "Maria Sakkari", [set(6, 4), set(6, 1)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Linda Noskova.
 * Todos los sets están orientados a Noskova, incluso cuando aparece abajo.
 */
export const NOSKOVA_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "clara Tauson", [set(7, 6, 7, 3), set(6, 2)], "completed", true, "player"),
  match("2026-08-15", "USA Cincinnati", "hard", "Katie Baulter", [set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-08-05", "Canada Toronto", "hard", "Kaserine McNolli", [set(6, 7, 5, 7), set(1, 6)], "completed", true, "opponent"),
  match("2026-07-11", "Wimbledon", "grass", "Karolina Mutšova", [set(6, 2), set(5, 7), set(6, 3)], "completed", false, "player"),
  match("2026-07-09", "Wimbledon", "grass", "Marta Kostjuk", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-07-08", "Wimbledon", "grass", "Elise Mertens", [set(6, 3), set(7, 5)], "completed", true, "player"),
  match("2026-07-06", "Wimbledon", "grass", "Madison Keis", [set(6, 4), set(7, 6, 7, 2)], "completed", false, "player"),
  match("2026-07-04", "Wimbledon", "grass", "Sorana Cirsti", [set(2, 6), set(6, 3), set(7, 6, 11, 9)], "completed", false, "player"),
  match("2026-07-02", "Wimbledon", "grass", "Kamila Osorio", [set(6, 3), set(4, 6), set(6, 2)], "completed", false, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Ella Seidel", [set(6, 4), set(6, 3)], "completed", false, "player"),
  match("2026-06-23", "WTA Bad Homburg", "grass", "Elena Gabriela Ruse", [set(1, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-21", "Berlin, Germany", "grass", "Žessika Pegula", [set(6, 4), set(4, 6), set(6, 3)], "completed", false, "player"),
  match("2026-06-20", "Berlin, Germany", "grass", "Aleksandra Ila", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-06-19", "Berlin, Germany", "grass", "Paula Badosa", [set(6, 1), set(6, 3)], "completed", true, "player"),
  match("2026-06-18", "Berlin, Germany", "grass", "Diane Parri", [set(6, 2), set(6, 2)], "completed", true, "player"),
  match("2026-06-16", "Berlin, Germany", "grass", "Renata Zarazua", [set(6, 1), set(6, 4)], "completed", true, "player"),
  match("2026-05-26", "Roland Garros", "clay", "Maria Sakkari", [set(5, 7), set(6, 7, 3, 7)], "completed", true, "opponent"),
  match("2026-05-11", "ROM", "clay", "Sorana Cirsti", [set(2, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-05-09", "ROM", "clay", "Oleksandra Oliinikova", [set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-05-07", "ROM", "clay", "Anastasia Zaharova", [set(6, 4), set(6, 1)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Amanda Anisimova.
 * Todos los sets están orientados a Anisimova, incluso cuando aparece abajo.
 */
export const ANISIMOVA_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "Aleksandra Ila", [set(4, 6), set(6, 4), set(6, 2)], "completed", false, "player"),
  match("2026-08-15", "USA Cincinnati", "hard", "Zeinep Sonmez", [set(6, 2), set(6, 3)], "completed", false, "player"),
  match("2026-08-08", "Canada Toronto", "hard", "Elina Svitolina", [set(2, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-08-06", "Canada Toronto", "hard", "Nikola Bartunkova", [set(3, 6), set(6, 0), set(6, 4)], "completed", false, "player"),
  match("2026-08-04", "Canada Toronto", "hard", "Lanlana Tararudi", [], "walkover", false, "player"),
  match("2026-07-04", "Wimbledon", "grass", "Madison Keis", [set(6, 3), set(2, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-02", "Wimbledon", "grass", "Sofia Kenin", [set(6, 2), set(4, 6), set(7, 6, 10, 3)], "completed", true, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Lina Gžortšeska", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-06-12", "WTA London", "grass", "Iva Žovic", [set(2, 6), set(6, 3), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-10", "WTA London", "grass", "Laura Siegemund", [set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-05-30", "Roland Garros", "clay", "Diane Parri", [set(3, 6), set(6, 4), set(6, 7, 3, 10)], "completed", false, "opponent"),
  match("2026-05-28", "Roland Garros", "clay", "Žulia Grabher", [set(6, 0)], "retired", false, "player"),
  match("2026-05-25", "Roland Garros", "clay", "Tiantsoa Sarah Rakotomanga Rajaonah", [set(6, 3), set(6, 1)], "completed", false, "player"),
  match("2026-03-23", "MIA", "hard", "Belinda Bencic", [set(2, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-03-21", "MIA", "hard", "Yulia Starodubtseva", [set(6, 4), set(6, 2)], "completed", true, "player"),
  match("2026-03-20", "MIA", "hard", "Ažla Tomlžanovic", [set(6, 1), set(5, 7), set(6, 4)], "completed", true, "player"),
  match("2026-03-10", "USA Indian Wells", "hard", "Victoria Mboko", [set(4, 6), set(1, 6)], "completed", false, "opponent"),
  match("2026-03-08", "USA Indian Wells", "hard", "Emma Radukanu", [set(6, 1), set(6, 1)], "completed", false, "player"),
  match("2026-03-06", "USA Indian Wells", "hard", "Anna Blinkova", [set(5, 7), set(6, 1), set(6, 0)], "completed", false, "player"),
  match("2026-02-20", "Dubai (WTA)", "hard", "Žessika Pegula", [set(6, 1), set(4, 6), set(3, 6)], "completed", false, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Stefanos Sakellaridis.
 * Todos los sets están orientados a Sakellaridis, incluso cuando aparece abajo.
 */
export const SAKELLARIDIS_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "ATP Challenger Quebec City", "hard", "Tristan Šulkate", [set(6, 4), set(3, 6), set(7, 5)], "completed", true, "player"),
  match("2026-08-17", "ATP Challenger Quebec City", "hard", "Karl Poling", [set(3, 6), set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-08-12", "USA Cincinnati", "hard", "Titauan Droguet", [set(4, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-08-11", "USA Cincinnati", "hard", "Martin Damm Žr", [set(6, 4), set(7, 6, 7, 4)], "completed", false, "player"),
  match("2026-06-25", "Wimbledon", "grass", "Oliver Tarvet", [set(4, 6), set(2, 6), set(5, 7)], "completed", false, "opponent"),
  match("2026-06-24", "Wimbledon", "grass", "Federiko Koria", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-06-22", "Wimbledon", "grass", "Ju Hsiau Hsu", [set(6, 4), set(6, 2)], "completed", false, "player"),
  match("2026-06-18", "ATP Challenger", "clay", "Titauan Droguet", [set(3, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-17", "ATP Challenger", "clay", "clement Tabur", [set(1, 6), set(7, 6, 12, 10), set(6, 3)], "completed", false, "player"),
  match("2026-06-16", "ATP Challenger", "clay", "Ivanov, Ivan", [set(7, 6, 10, 8), set(6, 3)], "completed", false, "player"),
  match("2026-06-06", "STU", "grass", "Šo Šimabukuro", [set(5, 7), set(4, 6)], "completed", false, "opponent"),
  match("2026-05-31", "Challenger", "clay", "Sezar cretu", [set(6, 7, 1, 7), set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-05-30", "Challenger", "clay", "Genaro Alberto Olivieri", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-05-29", "Challenger", "clay", "Sumit Nagal", [set(6, 1), set(6, 4)], "completed", true, "player"),
  match("2026-05-27", "Challenger", "clay", "Aleks Martinez", [set(7, 6, 7, 2), set(2, 0)], "retired", true, "player"),
  match("2026-05-25", "Challenger", "clay", "Federiko Agustin Gomez", [set(6, 3), set(7, 5)], "completed", false, "player"),
  match("2026-05-20", "Roland Garros", "clay", "Marko Sectšinato", [set(3, 6), set(6, 7, 2, 7)], "completed", true, "opponent"),
  match("2026-05-18", "Roland Garros", "clay", "Šo Šimabukuro", [set(2, 6), set(6, 4), set(7, 5)], "completed", false, "player"),
  match("2026-05-06", "Italy Francavilla", "clay", "Gustavo Heide", [set(4, 6), set(6, 7, 3, 7)], "completed", true, "opponent"),
  match("2026-05-05", "Italy Francavilla", "clay", "Tobi Samuel", [set(6, 3), set(2, 6), set(6, 4)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Ugo Blantšet.
 * Todos los sets están orientados a Blantšet, incluso cuando aparece abajo.
 */
export const BLANCHET_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "ATP Challenger Quebec City", "hard", "Žames Watt", [set(6, 7, 3, 7), set(6, 2), set(7, 5)], "completed", false, "player"),
  match("2026-08-17", "ATP Challenger Quebec City", "hard", "Stefano Napolitano", [set(6, 4), set(4, 6), set(7, 6, 7, 4)], "completed", false, "player"),
  match("2026-08-10", "ATP Challenger", "hard", "Rei Sakamoto", [set(7, 6, 7, 3), set(6, 7, 6, 8), set(6, 7, 3, 7)], "completed", true, "opponent"),
  match("2026-06-08", "Great Britain", "grass", "Oliver Tarvet", [set(3, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-02", "Challenger", "grass", "Feliks Gill", [set(7, 6, 7, 5), set(6, 7, 2, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-20", "Roland Garros", "clay", "Pablo Llamas Ruíz", [set(4, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-05-18", "Roland Garros", "clay", "Tšarles Brum", [set(4, 6), set(7, 6), set(6, 4)], "completed", false, "player"),
  match("2026-05-12", "France Bordeaux", "clay", "Pierre Delage", [set(3, 6), set(6, 7, 2, 7)], "completed", true, "opponent"),
  match("2026-05-11", "France Bordeaux", "clay", "Maksime Tšazal", [set(6, 1), set(5, 7), set(6, 2)], "completed", true, "player"),
  match("2026-04-28", "Czech Republic", "clay", "Henri Svitsire", [set(2, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-04-20", "Spain Madrid", "clay", "Cristian Garín", [set(5, 7), set(4, 6)], "completed", false, "opponent"),
  match("2026-04-11", "Germany Munich", "clay", "Marko Topo", [set(3, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-04-07", "ATP Challenger Barletta", "clay", "Oriol Roka Batolla", [set(1, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-04-03", "Italy Barletta", "clay", "Martin Krumitš", [set(5, 7), set(3, 6)], "completed", false, "opponent"),
  match("2026-04-02", "Italy Barletta", "clay", "Manas Manož Dhamne", [set(5, 7), set(6, 3), set(6, 2)], "completed", false, "player"),
  match("2026-03-24", "Challenger", "hard", "Federiko Bondioli", [set(6, 7, 5, 7), set(4, 6)], "completed", false, "opponent"),
  match("2026-03-06", "Challenger", "hard", "Otto Virtanen", [set(5, 7), set(6, 7, 3, 7)], "completed", true, "opponent"),
  match("2026-03-05", "Challenger", "hard", "clement Tšideh", [set(6, 2), set(6, 2)], "completed", true, "player"),
  match("2026-03-03", "Challenger", "hard", "Jõsuke Watanuki", [set(6, 7, 5, 7), set(6, 2), set(3, 0)], "retired", true, "player"),
  match("2026-02-27", "France Pau", "hard", "Hugo Gastón", [set(4, 6), set(1, 6)], "completed", true, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Dunkan Tšan.
 * Todos los sets están orientados a Tšan, incluso cuando aparece abajo.
 */
export const CHAN_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-04", "Canada Granby", "hard", "Siago Agustin Tirante", [set(3, 6), set(6, 1), set(6, 7)], "completed", true, "opponent"),
  match("2026-08-01", "Canada Granby", "hard", "Hugo Gastón", [set(2, 6), set(7, 5), set(6, 3)], "completed", false, "player"),
  match("2026-07-28", "Canada Winnipeg", "hard", "Dane Swini", [set(4, 6), set(1, 6)], "completed", false, "opponent"),
  match("2026-07-23", "Challenger", "hard", "Šintaro Motšizuki", [set(2, 6), set(6, 2), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-21", "Challenger", "hard", "Žames McKabe", [set(7, 6, 7, 5), set(4, 6), set(7, 5)], "completed", false, "player"),
  match("2026-07-20", "Challenger", "hard", "Sesar Bautšelaghem", [set(3, 6), set(7, 6, 7, 2), set(6, 3)], "completed", true, "player"),
  match("2026-07-19", "Challenger", "hard", "Olukajõde Alafia Damina Aini", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-07-14", "Canada", "hard", "Daniel Milavski", [set(4, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-07-09", "ITF Canada", "hard", "Timo Legaut", [set(6, 7, 5, 7), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-08", "ITF Canada", "hard", "Nikola Ion", [set(2, 6), set(6, 4), set(3, 0)], "retired", true, "player"),
  match("2026-06-18", "ITF USA", "hard", "Braden Šick", [set(4, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-16", "ITF USA", "hard", "Rjan Kolbi", [set(6, 2), set(4, 6), set(6, 2)], "completed", false, "player"),
  match("2026-06-12", "ITF USA", "hard", "Ozan Baris", [set(5, 7), set(6, 7, 6, 8)], "completed", false, "opponent"),
  match("2026-06-11", "ITF USA", "hard", "Pavle Marinkov", [set(7, 6, 7, 3), set(6, 2)], "completed", false, "player"),
  match("2026-06-10", "ITF USA", "hard", "Žie cui", [set(3, 6), set(6, 1), set(6, 4)], "completed", true, "player"),
  match("2025-11-16", "Challenger Drummondville", "hard", "Daniil Glinka", [set(4, 6), set(2, 6)], "completed", false, "opponent"),
  match("2025-11-15", "Challenger Drummondville", "hard", "Tšarles Brum", [set(6, 7, 3, 7), set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2025-11-14", "Challenger Drummondville", "hard", "Gabi Adrian Boitan", [set(6, 4), set(7, 5)], "completed", false, "player"),
  match("2025-11-13", "Challenger Drummondville", "hard", "Antoine Ghibaudo", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2025-11-12", "Challenger Drummondville", "hard", "Karl Poling", [set(6, 3), set(6, 4)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Taro Daniel.
 * Todos los sets están orientados a Daniel, incluso cuando aparece abajo.
 */
export const DANIEL_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "ATP Challenger Quebec City", "hard", "Dusan Lažovic", [set(7, 6, 7, 4), set(2, 6), set(6, 1)], "completed", false, "player"),
  match("2026-08-17", "ATP Challenger Quebec City", "hard", "Maksime St-Hilaire", [set(7, 5), set(6, 3)], "completed", false, "player"),
  match("2026-07-19", "Portugal Amadora", "clay", "Kirian Žacvitset", [set(6, 4), set(3, 6), set(6, 3)], "completed", false, "player"),
  match("2026-07-18", "Portugal Amadora", "clay", "Žuan Karlos Prado Angelo", [set(6, 4), set(6, 2)], "completed", true, "player"),
  match("2026-07-14", "Sweden Bastad", "clay", "Botic van de Zandschulp", [set(6, 7), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-13", "Sweden Bastad", "clay", "Karlos Santšez Žover", [set(6, 2), set(2, 6), set(6, 2)], "completed", false, "player"),
  match("2026-07-12", "Sweden Bastad", "clay", "Federiko Koria", [set(6, 0), set(6, 2)], "completed", false, "player"),
  match("2026-07-10", "ATP Challenger", "clay", "Valentin Roir", [set(6, 4), set(2, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-07-09", "ATP Challenger", "clay", "Zdenek Kolar", [set(6, 4), set(6, 3)], "completed", true, "player"),
  match("2026-07-06", "ATP Challenger", "clay", "Genaro Alberto Olivieri", [set(6, 0), set(6, 4)], "completed", false, "player"),
  match("2026-06-14", "Bratislava", "clay", "Aleksander Ševtšenko", [set(3, 6), set(6, 0), set(7, 6, 7, 2)], "completed", false, "player"),
  match("2026-06-13", "Bratislava", "clay", "Federiko cina", [set(7, 6, 8, 6), set(0, 6), set(6, 2)], "completed", false, "player"),
  match("2026-06-12", "Bratislava", "clay", "Zsombor Piros", [set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-06-11", "Bratislava", "clay", "Emilio Nava", [set(6, 1), set(6, 3)], "completed", true, "player"),
  match("2026-06-09", "Bratislava", "clay", "Timofei Skatov", [set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-06-08", "Bratislava", "clay", "Lukas Neumair", [set(6, 4), set(6, 3)], "completed", false, "player"),
  match("2026-06-07", "Bratislava", "clay", "Tomas Lanik", [set(6, 4), set(7, 5)], "completed", false, "player"),
  match("2026-06-05", "Czech Republic", "clay", "Hinek Barton", [set(6, 7, 4, 7), set(5, 7)], "completed", false, "opponent"),
  match("2026-06-04", "Czech Republic", "clay", "Damir Dzumhur", [set(6, 4), set(4, 6), set(6, 3)], "completed", true, "player"),
  match("2026-06-02", "Czech Republic", "clay", "Žonas Forežtek", [set(7, 6, 7, 3), set(6, 1)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Kirian Žacvitset.
 * Todos los sets están orientados a Žacvitset, incluso cuando aparece abajo.
 */
export const JACQUET_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-14", "USA Cincinnati", "hard", "Adolfo Daniel Valležo", [set(2, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-08-12", "USA Cincinnati", "hard", "Budkov Kžaer, Nikolai", [set(7, 5), set(6, 4)], "completed", false, "player"),
  match("2026-08-11", "USA Cincinnati", "hard", "Billi Harris", [set(6, 2), set(6, 1)], "completed", false, "player"),
  match("2026-08-03", "Canada Granby", "hard", "Gabriel Diollo", [set(7, 6), set(3, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-08-01", "Canada Granby", "hard", "Aleksander Ševtšenko", [set(4, 6), set(6, 4), set(6, 3)], "completed", false, "player"),
  match("2026-07-22", "Portugal Amadora", "clay", "Aleksander Blockks", [set(6, 3), set(4, 6), set(6, 7, 4, 7)], "completed", true, "opponent"),
  match("2026-07-21", "Portugal Amadora", "clay", "Daniel Mérida", [set(1, 6), set(6, 1), set(7, 5)], "completed", false, "player"),
  match("2026-07-19", "Portugal Amadora", "clay", "Taro Daniel", [set(4, 6), set(6, 3), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-18", "Portugal Amadora", "clay", "Da Rosa Castro, Goncalo", [set(6, 1), set(6, 2)], "completed", true, "player"),
  match("2026-07-13", "Croatia Umag", "clay", "Marko Trungelliti", [set(2, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-02", "Wimbledon", "grass", "Aleksander Bublik", [set(3, 6), set(4, 6), set(6, 7, 5, 7)], "completed", true, "opponent"),
  match("2026-06-30", "Wimbledon", "grass", "Vilius Gaubas", [set(6, 3), set(6, 4), set(7, 6, 7, 2)], "completed", true, "player"),
  match("2026-06-25", "Wimbledon", "grass", "Timofei Skatov", [set(7, 6, 7, 5), set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-06-24", "Wimbledon", "grass", "Andri Guerrieri", [set(7, 6, 11, 9), set(6, 4)], "completed", false, "player"),
  match("2026-06-22", "Wimbledon", "grass", "Pedro Boskardin Dias", [set(6, 1), set(7, 6, 7, 3)], "completed", false, "player"),
  match("2026-06-19", "ATP Challenger", "grass", "Henri Sirle", [set(6, 4), set(2, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-18", "ATP Challenger", "grass", "Grigor Dimitrov", [set(6, 3), set(7, 6, 11, 9)], "completed", false, "player"),
  match("2026-06-17", "ATP Challenger", "grass", "Mis Rottgering", [set(6, 4), set(2, 0)], "retired", false, "player"),
  match("2026-06-15", "ATP Challenger", "grass", "Gausier Onclin", [set(7, 6, 8, 6), set(7, 6, 7, 4)], "completed", false, "player"),
  match("2026-06-08", "Great Britain", "grass", "Tobi Samuel", [set(6, 1), set(6, 7, 10, 12), set(4, 6)], "completed", true, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Aleksandar Vukic.
 * Todos los sets están orientados a Vukic, incluso cuando aparece abajo.
 */
export const VUKIC_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-13", "USA Cincinnati", "hard", "Mark Lažal", [set(7, 6, 7, 3), set(3, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-08-12", "USA Cincinnati", "hard", "Darwin Blantš", [set(6, 3), set(7, 6, 7, 4)], "completed", true, "player"),
  match("2026-08-03", "Canada", "hard", "Daniel Altmaier", [set(7, 6, 7, 2), set(6, 7, 5, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-08-01", "Canada", "hard", "Marselo Tomas Barrios Vera", [set(7, 6, 7, 4), set(6, 2)], "completed", true, "player"),
  match("2026-07-29", "USA Washington", "hard", "Lorenzo Musetti", [set(3, 6), set(7, 5), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-27", "USA Washington", "hard", "Zatšari Svažda", [set(6, 3), set(6, 1)], "completed", true, "player"),
  match("2026-07-26", "USA Washington", "hard", "Aleks Bolt", [set(6, 0), set(6, 1)], "completed", true, "player"),
  match("2026-07-25", "USA Washington", "hard", "Aziz Daugaz", [set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-07-19", "Canada Granby", "hard", "Arsur Gi", [set(6, 4), set(1, 6), set(6, 1)], "completed", true, "player"),
  match("2026-07-18", "Canada Granby", "hard", "August Holmgren", [set(6, 4), set(3, 6), set(6, 3)], "completed", true, "player"),
  match("2026-07-17", "Canada Granby", "hard", "Aleksis Galarniu", [set(7, 6, 7, 2), set(7, 6, 7, 2)], "completed", true, "player"),
  match("2026-07-15", "Canada Granby", "hard", "Nikolas Arseniult", [set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-07-13", "Canada Granby", "hard", "Liam Broadi", [set(6, 4), set(5, 7), set(7, 6, 7, 4)], "completed", true, "player"),
  match("2026-07-08", "Challenger Winnipeg", "hard", "Liam Broadi", [set(6, 7, 4, 7), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-29", "Wimbledon", "grass", "Ženson Bruksbi", [set(6, 7, 7, 9), set(1, 6), set(1, 6)], "completed", true, "opponent"),
  match("2026-06-23", "Great Britain", "grass", "Ženson Bruksbi", [set(5, 7), set(1, 6)], "completed", false, "opponent"),
  match("2026-06-21", "Great Britain", "grass", "Hamiš Stewart", [set(7, 6, 7, 5), set(4, 6), set(6, 4)], "completed", false, "player"),
  match("2026-06-20", "Great Britain", "grass", "Harri Wendelken", [set(7, 5), set(6, 3)], "completed", false, "player"),
  match("2026-06-14", "Great Britain", "grass", "Harri Wendelken", [set(6, 7, 7, 9), set(1, 6)], "completed", true, "opponent"),
  match("2026-06-13", "Great Britain", "grass", "Žames Duckwors", [set(6, 3), set(6, 2)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Soon Woo Kwon.
 * Todos los sets están orientados a Kwon, incluso cuando aparece abajo.
 */
export const KWON_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "ATP Challenger Quebec City", "hard", "Andri Guerrieri", [set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-08-17", "ATP Challenger Quebec City", "hard", "Kigan Smis", [set(4, 6), set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-08-11", "USA Cincinnati", "hard", "kuentin Halis", [set(6, 4), set(6, 7, 5, 7), set(4, 6)], "completed", false, "opponent"),
  match("2026-08-05", "USA Lexington", "hard", "Andre Ilagan", [set(6, 3), set(6, 7, 4, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-08-04", "USA Lexington", "hard", "Tristan Šulkate", [set(3, 6), set(5, 1)], "retired", false, "player"),
  match("2026-08-03", "USA Lexington", "hard", "Aidan Kim", [set(3, 6), set(6, 2), set(6, 2)], "completed", true, "player"),
  match("2026-08-02", "USA Lexington", "hard", "Gavin Jõung", [set(7, 5), set(6, 3)], "completed", true, "player"),
  match("2026-07-28", "Mexico Los Cabos", "hard", "Arsur Gi", [set(4, 6), set(7, 6, 10, 8), set(2, 6)], "completed", true, "opponent"),
  match("2026-07-26", "Mexico Los Cabos", "hard", "Edward Winter", [set(7, 5), set(6, 2)], "completed", true, "player"),
  match("2026-07-25", "Mexico Los Cabos", "hard", "Alan Fernando Rubio Fierros", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-07-01", "Wimbledon", "grass", "Tommi Paul", [set(3, 6), set(6, 7, 4, 7), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-29", "Wimbledon", "grass", "Martin Landaluse", [set(6, 4), set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-06-25", "Wimbledon", "grass", "Alejandro Moro Cañas", [set(6, 4), set(7, 6, 8, 6), set(6, 3)], "completed", false, "player"),
  match("2026-06-24", "Wimbledon", "grass", "Arsur Gi", [set(5, 7), set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-06-22", "Wimbledon", "grass", "Nikolas Santšez Izvitsierdo", [set(7, 6, 9, 7), set(6, 3)], "completed", false, "player"),
  match("2026-06-16", "ATP Challenger", "grass", "Otto Virtanen", [set(2, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-06-14", "ATP Challenger", "grass", "Anton Matusevich", [set(3, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-13", "ATP Challenger", "grass", "Millen Hurrion", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-05-10", "Challenge Wuxi", "hard", "Bu Juntšaokete", [set(6, 2), set(7, 6, 7, 2)], "completed", false, "player"),
  match("2026-05-09", "Challenge Wuxi", "hard", "Mark Lažal", [set(7, 6, 7, 5), set(6, 3)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Šintaro Motšizuki.
 * Todos los sets están orientados a Motšizuki, incluso cuando aparece abajo.
 */
export const MOCHIZUKI_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-11", "USA Cincinnati", "hard", "Žeffrei Žohn Wolf", [set(2, 6), set(6, 2), set(3, 6)], "completed", false, "opponent"),
  match("2026-08-04", "Canada Granby", "hard", "Fabian Marozsan", [set(4, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-08-01", "Canada Granby", "hard", "Dane Swini", [set(1, 6), set(7, 6, 7, 5), set(6, 3)], "completed", true, "player"),
  match("2026-07-29", "Canada Winnipeg", "hard", "Hajato Matsuoka", [set(3, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-07-28", "Canada Winnipeg", "hard", "Tšarles Brum", [set(2, 6), set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-07-25", "Challenger Granby", "hard", "Liam Draksl", [set(0, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-24", "Challenger Granby", "hard", "Žohannus Mondai", [set(6, 4), set(7, 6, 7, 4)], "completed", true, "player"),
  match("2026-07-23", "Challenger Granby", "hard", "Dunkan Tšan", [set(6, 2), set(2, 6), set(6, 4)], "completed", true, "player"),
  match("2026-07-21", "Challenger Granby", "hard", "Filip Sekulic", [set(6, 3), set(4, 6), set(6, 1)], "completed", true, "player"),
  match("2026-07-05", "Wimbledon", "grass", "Žannik Sinner", [set(3, 6), set(6, 7), set(3, 6)], "completed", false, "opponent"),
  match("2026-07-03", "Wimbledon", "grass", "Rafael Žodar", [set(1, 6), set(7, 6, 7, 5), set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-07-01", "Wimbledon", "grass", "Esan kuinn", [set(6, 2), set(7, 6, 8, 6), set(7, 5)], "completed", true, "player"),
  match("2026-06-29", "Wimbledon", "grass", "Maks Basing", [set(6, 3), set(6, 0), set(6, 0)], "completed", true, "player"),
  match("2026-06-25", "Wimbledon", "grass", "clement Tabur", [set(1, 6), set(7, 5), set(2, 6), set(6, 3), set(6, 1)], "completed", false, "player"),
  match("2026-06-24", "Wimbledon", "grass", "Gausier Onclin", [set(6, 2), set(4, 6), set(6, 3)], "completed", false, "player"),
  match("2026-06-22", "Wimbledon", "grass", "Vitalii Satško", [set(6, 3), set(7, 6, 7, 4)], "completed", false, "player"),
  match("2026-06-18", "ATP Challenger", "grass", "Remi Bertola", [set(3, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-16", "ATP Challenger", "grass", "Mackenzie Mcdonald", [set(7, 6, 7, 3), set(7, 5)], "completed", false, "player"),
  match("2026-06-14", "ATP Challenger", "grass", "Mitšael Zheng", [set(7, 6, 7, 2), set(3, 6), set(7, 6, 7, 5)], "completed", true, "player"),
  match("2026-06-06", "ATP S-Hertogenbosch", "grass", "Aleksander Maarten Žong", [set(6, 4), set(3, 6), set(4, 6)], "completed", false, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Žaime Faria (R8 Cincinnati).
 * Incluye la victoria de 1/16 sobre Adam Walton (18.08.26).
 * Todos los sets están orientados a Faria, incluso cuando aparece abajo.
 */
export const FARIA_CINCINNATI_R8_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "USA Cincinnati", "hard", "Adam Walton", [set(4, 6), set(6, 4), set(7, 6, 7, 3)], "completed", true, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Ben Šelton", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-08-14", "USA Cincinnati", "hard", "Ženson Bruksbi", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-08-12", "USA Cincinnati", "hard", "Ibing Wu", [set(6, 3), set(7, 5)], "completed", true, "player"),
  match("2026-08-11", "USA Cincinnati", "hard", "Nikoloz Basilašvili", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-08-05", "Canada Montreal", "hard", "Titauan Drogat", [set(6, 7), set(2, 6)], "completed", false, "opponent"),
  match("2026-08-01", "Canada Montreal", "hard", "Tšristofer O'Konnell", [set(7, 6, 10, 8), set(2, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-24", "Portugal", "clay", "Luciano Darderi", [set(6, 2), set(5, 7), set(2, 6)], "completed", true, "opponent"),
  match("2026-07-23", "Portugal", "clay", "Gonzalo Bueno", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-07-21", "Portugal", "clay", "Botic van de Zandschulp", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-07-16", "Switzerland", "clay", "Kasper Ruud", [set(7, 6, 7, 1), set(4, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-07-14", "Switzerland", "clay", "Stan Wawrinka", [set(6, 7, 8, 10), set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-07-02", "Wimbledon", "grass", "Zizau Bergs", [set(6, 7, 6, 8), set(6, 4), set(2, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-30", "Wimbledon", "grass", "Šo Šimabukuro", [set(7, 6, 8, 6), set(6, 3), set(6, 7, 2, 7), set(6, 3)], "completed", false, "player"),
  match("2026-06-25", "Wimbledon", "grass", "Rei Sakamoto", [set(7, 6, 7, 3), set(4, 6), set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-06-24", "Wimbledon", "grass", "Luka Pavlovic", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-06-22", "Wimbledon", "grass", "Hugo Grenier", [set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-06-16", "ATP Challenger", "grass", "Žizhen Žang", [set(4, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-06-15", "ATP Challenger", "grass", "Moez Etšargui", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-05-30", "Roland-Garros", "clay", "Francis Tiafoe", [set(6, 4), set(7, 6), set(6, 7), set(1, 6), set(2, 6)], "completed", true, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Lorenzo Musetti.
 * Todos los sets están orientados a Musetti, incluso cuando aparece abajo.
 */
export const MUSETTI_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "USA Cincinnati", "hard", "Mitšael Zheng", [set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Daniel Altmaier", [set(6, 4), set(6, 2)], "completed", false, "player"),
  match("2026-08-06", "Canada Montreal", "hard", "Rafael Žodar", [set(4, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-08-05", "Canada Montreal", "hard", "Nikolas Mežia", [set(7, 6), set(6, 2)], "completed", false, "player"),
  match("2026-07-31", "USA Washington", "hard", "Rafael Žodar", [set(6, 1), set(1, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-29", "USA Washington", "hard", "Aleksandar Vukic", [set(6, 3), set(5, 7), set(6, 3)], "completed", false, "player"),
  match("2026-07-27", "USA Washington", "hard", "Matteo Arnaldi", [set(6, 0), set(3, 1)], "retired", false, "player"),
  match("2026-05-12", "ROM", "clay", "Kasper Ruud", [set(3, 6), set(1, 6)], "completed", true, "opponent"),
  match("2026-05-10", "ROM", "clay", "Francisko Serundolo", [set(7, 6, 9, 7), set(6, 4)], "completed", true, "player"),
  match("2026-05-08", "ROM", "clay", "Giovanni Mpetshi Perrikard", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-04-28", "Spain Madrid", "clay", "Žiri Lehecka", [set(3, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-04-26", "Spain Madrid", "clay", "Tollon Griekspur", [set(6, 4), set(7, 5)], "completed", false, "player"),
  match("2026-04-24", "Spain Madrid", "clay", "Hubert Hurkacz", [set(6, 4), set(7, 6, 7, 4)], "completed", false, "player"),
  match("2026-04-17", "Spain Barcelona", "clay", "Arsur Fils", [set(3, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-04-16", "Spain Barcelona", "clay", "Korentin Mautet", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-04-14", "Spain Barcelona", "clay", "Martin Landaluse", [set(7, 5), set(6, 2)], "completed", false, "player"),
  match("2026-04-08", "MON", "clay", "Valentin Vatšerot", [set(6, 7, 6, 8), set(5, 7)], "completed", true, "opponent"),
  match("2026-03-06", "USA Indian Wells", "hard", "Marton Fucsovics", [set(5, 7), set(1, 6)], "completed", true, "opponent"),
  match("2026-01-27", "Australian Open", "hard", "Novak Džokovic", [set(6, 4), set(6, 3), set(1, 3)], "retired", true, "opponent"),
  match("2026-01-25", "Australian Open", "hard", "Tailor Fritz", [set(6, 2), set(7, 5), set(6, 4)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Tailor Fritz.
 * Todos los sets están orientados a Fritz, incluso cuando aparece abajo.
 */
export const FRITZ_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "USA Cincinnati", "hard", "Daniel Mérida", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Aleks Mitšelsen", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-08-05", "Canada Montreal", "hard", "Siago Agustin Tirante", [set(5, 7), set(3, 6)], "completed", false, "opponent"),
  match("2026-08-03", "USA Washington", "hard", "Rafael Žodar", [set(7, 6), set(6, 4)], "completed", true, "player"),
  match("2026-08-01", "USA Washington", "hard", "Brandon Nakašima", [set(6, 3), set(3, 6), set(6, 3)], "completed", false, "player"),
  match("2026-07-31", "USA Washington", "hard", "Aleks Mitšelsen", [set(6, 1), set(3, 6), set(7, 6, 8, 6)], "completed", true, "player"),
  match("2026-07-29", "USA Washington", "hard", "Kamil Mažtšrzak", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-07-27", "USA Washington", "hard", "Zizau Bergs", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-07-08", "Wimbledon", "grass", "Aleksander Zverev", [set(4, 6), set(4, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-07-06", "Wimbledon", "grass", "Aleksander Bublik", [set(7, 6, 7, 1), set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-07-04", "Wimbledon", "grass", "Lorenzo Süango", [set(4, 6), set(6, 3), set(6, 4), set(7, 6, 7, 5)], "completed", true, "player"),
  match("2026-07-02", "Wimbledon", "grass", "Patrick Kipson", [set(6, 2), set(6, 2), set(7, 5)], "completed", true, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Dusan Lažovic", [set(6, 3), set(6, 4), set(6, 3)], "completed", true, "player"),
  match("2026-06-21", "Germany Halle", "grass", "Francis Tiafoe", [set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-20", "Germany Halle", "grass", "Aleksander Zverev", [set(6, 7, 4, 7), set(6, 4), set(7, 5)], "completed", false, "player"),
  match("2026-06-19", "Germany Halle", "grass", "Ben Šelton", [set(6, 7, 5, 7), set(7, 6, 10, 8), set(7, 6, 7, 3)], "completed", false, "player"),
  match("2026-06-18", "Germany Halle", "grass", "Fabian Marozsan", [set(6, 2), set(6, 4)], "completed", false, "player"),
  match("2026-06-17", "Germany Halle", "grass", "Zizau Bergs", [set(7, 6, 7, 4), set(5, 7), set(6, 4)], "completed", false, "player"),
  match("2026-06-14", "Stuttgart", "grass", "Ben Šelton", [set(4, 6), set(6, 2), set(4, 6)], "completed", false, "opponent"),
  match("2026-06-13", "Stuttgart", "grass", "Aleksander Bublik", [set(6, 4), set(6, 4)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Tšristofer O'Konnell.
 * Todos los sets están orientados a O'Konnell, incluso cuando aparece abajo.
 */
export const OCONNELL_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "USA Cincinnati", "hard", "Žoao Fonseka", [], "walkover", false, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Kasper Ruud", [set(7, 5), set(1, 2)], "retired", true, "player"),
  match("2026-08-14", "USA Cincinnati", "hard", "Kamil Mažtšrzak", [set(6, 4), set(7, 6, 7, 5)], "completed", true, "player"),
  match("2026-08-12", "USA Cincinnati", "hard", "Aleksander Ševtšenko", [set(6, 4), set(6, 1)], "completed", false, "player"),
  match("2026-08-11", "USA Cincinnati", "hard", "Dane Swini", [set(6, 7, 3, 7), set(6, 2), set(7, 5)], "completed", true, "player"),
  match("2026-08-03", "Canada Montreal", "hard", "Žames Duckwors", [set(3, 6), set(1, 6)], "completed", false, "opponent"),
  match("2026-08-01", "Canada Montreal", "hard", "Žaime Faria", [set(6, 7, 8, 10), set(6, 2), set(6, 4)], "completed", false, "player"),
  match("2026-07-25", "USA Washington", "hard", "Andres Martin", [set(3, 6), set(6, 4), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-25", "Wimbledon", "grass", "Mackenzie Mcdonald", [set(3, 6), set(4, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-06-24", "Wimbledon", "grass", "Bernard Tomic", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-06-22", "Wimbledon", "grass", "Žoel Žosef Šwarzler", [set(7, 6, 7, 3), set(6, 4)], "completed", false, "player"),
  match("2026-06-20", "ATP Challenger", "grass", "Otto Virtanen", [set(7, 6, 7, 3), set(7, 6, 8, 6)], "completed", false, "player"),
  match("2026-06-19", "ATP Challenger", "grass", "Remi Bertola", [set(6, 4), set(7, 5)], "completed", false, "player"),
  match("2026-06-18", "ATP Challenger", "grass", "Benžamin Bonzi", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-06-17", "ATP Challenger", "grass", "Žai clarke", [set(4, 6), set(6, 4), set(7, 6, 7, 5)], "completed", true, "player"),
  match("2026-06-15", "ATP Challenger", "grass", "Henrivitse Rotša", [set(7, 6, 7, 2), set(6, 1)], "completed", false, "player"),
  match("2026-06-09", "Great Britain", "grass", "Darwin Blantš", [set(6, 7, 4, 7), set(6, 4), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-03", "Challenger", "grass", "Elias Imer", [set(6, 7, 7, 9), set(3, 6)], "completed", false, "opponent"),
  match("2026-05-18", "Roland-Garros", "clay", "Facundo Diaz Akosta", [set(6, 7), set(6, 4), set(4, 6)], "completed", false, "opponent"),
  match("2026-05-12", "ATP Challenger", "clay", "Dusan Lažovic", [set(4, 6), set(3, 6)], "completed", false, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Francis Tiafoe.
 * Todos los sets están orientados a Tiafoe, incluso cuando aparece abajo.
 */
export const TIAFOE_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "USA Cincinnati", "hard", "Lirner Tien", [set(6, 4), set(4, 6), set(6, 4)], "completed", false, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Lorenzo Süango", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-08-06", "Canada Montreal", "hard", "Arsur Rinderknetš", [set(2, 6), set(0, 2)], "retired", true, "opponent"),
  match("2026-08-04", "Canada Montreal", "hard", "Marin cilic", [set(5, 7), set(6, 2), set(6, 2)], "completed", true, "player"),
  match("2026-07-27", "USA Washington", "hard", "Terense Atmane", [set(6, 4), set(3, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-04", "Wimbledon", "grass", "Aleksander Bublik", [set(6, 4), set(6, 7, 5, 7), set(6, 7, 11, 13), set(6, 4), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-02", "Wimbledon", "grass", "Žan Tšoinski", [set(4, 6), set(6, 2), set(7, 5), set(6, 2)], "completed", true, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Terense Atmane", [set(7, 6, 8, 6), set(6, 1), set(4, 6), set(6, 4)], "completed", true, "player"),
  match("2026-06-21", "Germany Halle", "grass", "Tailor Fritz", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-06-20", "Germany Halle", "grass", "Daniel Altmaier", [set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-06-19", "Germany Halle", "grass", "Feliks Auger-Aliassime", [set(3, 6), set(6, 3), set(7, 6, 14, 12)], "completed", true, "player"),
  match("2026-06-17", "Germany Halle", "grass", "Šo Šimabukuro", [set(6, 4), set(7, 5)], "completed", true, "player"),
  match("2026-06-15", "Germany Halle", "grass", "Flavio Kobolli", [set(6, 2), set(7, 6, 7, 4)], "completed", false, "player"),
  match("2026-06-12", "Stuttgart", "grass", "Žiri Lehecka", [set(4, 6), set(6, 7, 4, 7)], "completed", false, "opponent"),
  match("2026-06-11", "Stuttgart", "grass", "Rinki Hižikata", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-06-09", "Stuttgart", "grass", "Daniel Altmaier", [set(7, 6, 7, 3), set(4, 6), set(6, 4)], "completed", false, "player"),
  match("2026-06-01", "Roland-Garros", "clay", "Matteo Arnaldi", [set(6, 7), set(7, 6), set(6, 3), set(6, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-30", "Roland-Garros", "clay", "Žaime Faria", [set(4, 6), set(6, 7), set(7, 6), set(6, 1), set(6, 2)], "completed", false, "player"),
  match("2026-05-28", "Roland-Garros", "clay", "Hubert Hurkacz", [set(6, 7, 5, 7), set(7, 6, 7, 5), set(6, 4), set(6, 7, 1, 7), set(6, 4)], "completed", false, "player"),
  match("2026-05-25", "Roland-Garros", "clay", "Eliot Spizzirri", [set(6, 3), set(6, 7, 5, 7), set(6, 4), set(6, 3)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Feliks Auger-Aliassime (R8 Cincinnati).
 * Incluye la victoria de 1/16 sobre Juan Manuel Cerundolo (18.08.26).
 * Todos los sets están orientados a Auger-Aliassime, incluso cuando aparece abajo.
 */
export const ALIASSIME_CINCINNATI_R8_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "USA Cincinnati", "hard", "Žuan Manuel Serundolo", [set(7, 5), set(6, 1)], "completed", false, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Stefanos Tsitsipas", [set(6, 3), set(7, 5)], "completed", false, "player"),
  match("2026-07-07", "Wimbledon", "grass", "Novak Džokovic", [set(6, 7, 10, 12), set(6, 3), set(3, 6), set(7, 6, 7, 4), set(6, 7, 4, 10)], "completed", true, "opponent"),
  match("2026-07-05", "Wimbledon", "grass", "Aležandro Davidovich Fokina", [set(6, 7, 4, 7), set(7, 6, 8, 6), set(6, 3), set(6, 7, 2, 7), set(6, 1)], "completed", true, "player"),
  match("2026-07-03", "Wimbledon", "grass", "Mitšael Zheng", [set(7, 6, 7, 1), set(6, 2), set(6, 1)], "completed", true, "player"),
  match("2026-07-01", "Wimbledon", "grass", "Dino Prizmic", [set(7, 6, 7, 2), set(6, 3), set(7, 5)], "completed", true, "player"),
  match("2026-06-29", "Wimbledon", "grass", "Aleksander Ševtšenko", [set(6, 3), set(6, 1), set(6, 4)], "completed", true, "player"),
  match("2026-06-19", "Germany Halle", "grass", "Francis Tiafoe", [set(6, 3), set(3, 6), set(6, 7, 12, 14)], "completed", false, "opponent"),
  match("2026-06-17", "Germany Halle", "grass", "Lirner Tien", [set(6, 7, 5, 7), set(7, 5), set(7, 6, 7, 5)], "completed", false, "player"),
  match("2026-06-15", "Germany Halle", "grass", "Nuno Borges", [set(6, 3), set(3, 6), set(6, 3)], "completed", false, "player"),
  match("2026-06-12", "ATP S-Hertogenbosch", "grass", "Kamil Mažtšrzak", [set(4, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-11", "ATP S-Hertogenbosch", "grass", "Marton Fucsovics", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-06-03", "Roland-Garros", "clay", "Flavio Kobolli", [set(6, 4), set(4, 6), set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-01", "Roland-Garros", "clay", "Aležandro Tabilo", [set(6, 3), set(7, 5), set(6, 1)], "completed", true, "player"),
  match("2026-05-30", "Roland-Garros", "clay", "Brandon Nakašima", [set(5, 7), set(6, 1), set(7, 6, 7, 4), set(7, 6, 7, 1)], "completed", true, "player"),
  match("2026-05-28", "Roland-Garros", "clay", "Roman Andres Burrutšaga", [set(4, 6), set(6, 0), set(7, 5), set(6, 1)], "completed", true, "player"),
  match("2026-05-26", "Roland-Garros", "clay", "Daniel Altmaier", [set(4, 6), set(6, 4), set(4, 6), set(6, 1), set(7, 6, 10, 7)], "completed", true, "player"),
  match("2026-05-20", "ATP Hamburg", "clay", "Aleksandar Kovasevic", [set(6, 4), set(5, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-19", "ATP Hamburg", "clay", "Vit Kopriva", [set(7, 5), set(6, 1)], "completed", true, "player"),
  match("2026-05-09", "ROM", "clay", "Mariano Navüan", [set(6, 7, 4, 7), set(6, 7, 5, 7)], "completed", true, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Kori Gauff.
 * Todos los sets están orientados a Gauff, incluso cuando aparece abajo.
 */
export const GAUFF_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "USA Cincinnati", "hard", "Ann Li", [set(6, 1), set(7, 6, 7, 3)], "completed", true, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Ludmilla Samsonova", [set(2, 6), set(6, 4), set(6, 1)], "completed", true, "player"),
  match("2026-08-12", "Canada Toronto", "hard", "Elena Ribakina", [set(7, 5), set(2, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-08-11", "Canada Toronto", "hard", "Belinda Bencic", [], "walkover", false, "player"),
  match("2026-08-09", "Canada Toronto", "hard", "Alina Korniva", [set(6, 3), set(6, 1)], "completed", false, "player"),
  match("2026-08-07", "Canada Toronto", "hard", "Maria Sakkari", [set(6, 1), set(6, 4)], "completed", false, "player"),
  match("2026-08-05", "Canada Toronto", "hard", "Kaila Dai", [set(6, 2), set(7, 5)], "completed", false, "player"),
  match("2026-07-09", "Wimbledon", "grass", "Karolina Mutšova", [set(2, 6), set(6, 1), set(6, 7, 10, 12)], "completed", false, "opponent"),
  match("2026-07-07", "Wimbledon", "grass", "Žessika Pegula", [set(4, 6), set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-07-05", "Wimbledon", "grass", "Belinda Bencic", [set(4, 6), set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-07-03", "Wimbledon", "grass", "claire", [set(6, 3), set(6, 7, 5, 7), set(6, 2)], "completed", false, "player"),
  match("2026-07-01", "Wimbledon", "grass", "Solana Sierra", [set(6, 3), set(3, 6), set(7, 6, 10, 7)], "completed", false, "player"),
  match("2026-06-29", "Wimbledon", "grass", "Tamara Korpatstš", [set(6, 2), set(6, 1)], "completed", false, "player"),
  match("2026-06-17", "Berlin", "grass", "Paula Badosa", [set(6, 1), set(3, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-30", "Roland-Garros", "clay", "Anastasia Potapova", [set(6, 4), set(6, 7, 1, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-28", "Roland-Garros", "clay", "Majar Šerif", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-05-26", "Roland-Garros", "clay", "Tailor Townsend", [set(6, 4), set(6, 0)], "completed", true, "player"),
  match("2026-05-16", "ROM", "clay", "Elina Svitolina", [set(4, 6), set(7, 6, 7, 3), set(2, 6)], "completed", true, "opponent"),
  match("2026-05-14", "ROM", "clay", "Sorana Cirsti", [set(6, 4), set(6, 3)], "completed", false, "player"),
  match("2026-05-12", "ROM", "clay", "Mirra Andriva", [set(4, 6), set(6, 2), set(6, 4)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Marie Bauzkova.
 * Todos los sets están orientados a Bauzkova, incluso cuando aparece abajo.
 */
export const BOUZKOVA_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "USA Cincinnati", "hard", "Iva Žovic", [set(7, 6), set(7, 6, 7, 5)], "completed", true, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Lucrezia Stefanini", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-08-05", "Canada Toronto", "hard", "Tailor Townsend", [set(6, 7, 4, 7), set(5, 7)], "completed", true, "opponent"),
  match("2026-07-24", "Czech Republic", "clay", "Tereza Valentova", [set(6, 2), set(4, 6), set(6, 7, 6, 8)], "completed", true, "opponent"),
  match("2026-07-22", "Czech Republic", "clay", "Karol Jõungsuh Li", [set(7, 5), set(6, 4)], "completed", true, "player"),
  match("2026-07-20", "Czech Republic", "clay", "Žessika Bauzas Maneiro", [set(7, 5), set(7, 5)], "completed", true, "player"),
  match("2026-07-06", "Wimbledon", "grass", "Elise Mertens", [set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-04", "Wimbledon", "grass", "Ludmilla Samsonova", [set(4, 6), set(7, 6, 7, 3), set(6, 4)], "completed", false, "player"),
  match("2026-07-02", "Wimbledon", "grass", "Tira Katerina Grant", [set(7, 5), set(6, 3)], "completed", false, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Talia Gibson", [set(6, 1), set(3, 6), set(6, 2)], "completed", false, "player"),
  match("2026-06-21", "Great Britain", "grass", "Emma Navarro", [set(7, 6, 7, 5), set(4, 6), set(6, 2)], "completed", true, "player"),
  match("2026-06-20", "Great Britain", "grass", "Karolina Pliskova", [set(6, 4), set(6, 1)], "completed", false, "player"),
  match("2026-06-19", "Great Britain", "grass", "Tatžana Maria", [set(7, 5), set(6, 0)], "completed", true, "player"),
  match("2026-06-18", "Great Britain", "grass", "Hannah Klugman", [set(7, 5), set(6, 2)], "completed", true, "player"),
  match("2026-06-15", "Great Britain", "grass", "Tereza Valentova", [set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-06-10", "WTA London", "grass", "Donna Vekic", [set(6, 7, 9, 11), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-09", "England", "grass", "Polina Kudermetova", [set(6, 0), set(6, 3)], "completed", true, "player"),
  match("2026-05-29", "Roland-Garros", "clay", "Mirra Andriva", [set(4, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-27", "Roland-Garros", "clay", "Franseska Žüans", [set(6, 0), set(7, 6, 7, 3)], "completed", false, "player"),
  match("2026-05-24", "Roland-Garros", "clay", "Lucia Bronzetti", [set(6, 3), set(6, 1)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Madison Keis.
 * Todos los sets están orientados a Keis, incluso cuando aparece abajo.
 */
export const KEYS_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "USA Cincinnati", "hard", "Katerina Siniakova", [set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Daria Snigur", [set(4, 6), set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-08-06", "Canada Toronto", "hard", "Marta Kostjuk", [set(3, 6), set(1, 6)], "completed", false, "opponent"),
  match("2026-08-04", "Canada Toronto", "hard", "Antonia Ruzic", [set(6, 1), set(6, 2)], "completed", false, "player"),
  match("2026-07-27", "USA Washington", "hard", "Ludmilla Samsonova", [set(6, 3), set(4, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-06", "Wimbledon", "grass", "Linda Noskova", [set(4, 6), set(6, 7, 2, 7)], "completed", true, "opponent"),
  match("2026-07-04", "Wimbledon", "grass", "Amanda Anisimova", [set(3, 6), set(6, 2), set(6, 3)], "completed", false, "player"),
  match("2026-07-02", "Wimbledon", "grass", "Katie Swan", [set(6, 1), set(6, 4)], "completed", false, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Kaila Dai", [set(6, 7, 5, 7), set(6, 4), set(6, 3)], "completed", false, "player"),
  match("2026-06-27", "Great Britain", "grass", "Tatžana Maria", [set(7, 5), set(6, 4)], "completed", false, "player"),
  match("2026-06-26", "Great Britain", "grass", "Petra Marcinko", [set(6, 1), set(0, 0)], "retired", false, "player"),
  match("2026-06-25", "Great Britain", "grass", "Mckartnei Kessler", [set(6, 3), set(6, 1)], "completed", false, "player"),
  match("2026-06-24", "Great Britain", "grass", "Žessika Bauzas Maneiro", [set(6, 0), set(6, 1)], "completed", false, "player"),
  match("2026-06-23", "Great Britain", "grass", "Talia Gibson", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-06-19", "Berlin", "grass", "Žessika Pegula", [set(6, 7, 5, 7), set(6, 7, 8, 10)], "completed", false, "opponent"),
  match("2026-06-18", "Berlin", "grass", "Karolina Mutšova", [set(6, 4), set(7, 5)], "completed", true, "player"),
  match("2026-06-16", "Berlin", "grass", "Ksinju Wang", [set(7, 6, 7, 3), set(6, 1)], "completed", true, "player"),
  match("2026-06-01", "Roland-Garros", "clay", "Diana Šnaider", [set(3, 6), set(6, 3), set(0, 6)], "completed", true, "opponent"),
  match("2026-05-30", "Roland-Garros", "clay", "Victoria Mboko", [set(6, 3), set(5, 7), set(7, 5)], "completed", false, "player"),
  match("2026-05-28", "Roland-Garros", "clay", "Antonia Ruzic", [set(6, 4), set(6, 4)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Ksiiu Wang.
 * Todos los sets están orientados a Ksiiu Wang, incluso cuando aparece abajo.
 */
export const XIYU_WANG_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "USA Cincinnati", "hard", "Elina Svitolina", [], "walkover", true, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Leilah Annie Fernandez", [set(3, 6), set(6, 2), set(6, 2)], "completed", false, "player"),
  match("2026-08-14", "USA Cincinnati", "hard", "Maria Timofiva", [set(6, 0), set(3, 0)], "retired", false, "player"),
  match("2026-08-13", "USA Cincinnati", "hard", "Polina Kudermetova", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-08-12", "USA Cincinnati", "hard", "Bianca Andreescu", [set(6, 0), set(6, 4)], "completed", true, "player"),
  match("2026-08-02", "Canada Toronto", "hard", "Sara Bežlek", [set(3, 6), set(6, 4), set(5, 7)], "completed", true, "opponent"),
  match("2026-07-28", "MEM", "hard", "Kaserine McNolli", [set(6, 4), set(3, 6), set(6, 7, 5, 7)], "completed", true, "opponent"),
  match("2026-06-24", "Wimbledon", "grass", "Marina Bassols Ribera", [set(6, 3), set(1, 6), set(0, 4)], "retired", true, "opponent"),
  match("2026-06-23", "Wimbledon", "grass", "Hanju Guo", [set(7, 6, 7, 4), set(6, 3)], "completed", true, "player"),
  match("2026-06-21", "WTA 125K", "grass", "Majar Šerif", [set(4, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-20", "WTA 125K", "grass", "Anastasiia Konstantinovna Soboleva", [set(6, 2), set(6, 2)], "completed", true, "player"),
  match("2026-06-19", "WTA 125K", "grass", "Luisina Giovannini", [set(6, 2), set(6, 1)], "completed", true, "player"),
  match("2026-06-18", "WTA 125K", "grass", "Karole Monnet", [set(6, 3), set(6, 1)], "completed", true, "player"),
  match("2026-06-16", "WTA 125K", "grass", "Ksinju Gao", [set(6, 3), set(6, 0)], "completed", true, "player"),
  match("2026-06-08", "WTA Makarska", "clay", "Laura Samson", [set(6, 7, 3, 7), set(5, 7)], "completed", true, "opponent"),
  match("2026-05-31", "Roland-Garros", "clay", "Sorana Cirsti", [set(3, 6), set(6, 7, 4, 7)], "completed", false, "opponent"),
  match("2026-05-29", "Roland-Garros", "clay", "Yulia Starodubtseva", [set(6, 3), set(7, 5)], "completed", true, "player"),
  match("2026-05-27", "Roland-Garros", "clay", "Hailei Baptiste", [set(5, 4)], "retired", false, "player"),
  match("2026-05-24", "Roland-Garros", "clay", "Danka Kovinic", [set(6, 3), set(6, 1)], "completed", false, "player"),
  match("2026-05-22", "Roland-Garros", "clay", "Polina Kudermetova", [set(6, 3), set(6, 3)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Arina Sabalenka (R8 Cincinnati).
 * Incluye la victoria de 1/16 sobre Xinyu Wang (18.08.26).
 * Todos los sets están orientados a Sabalenka, incluso cuando aparece abajo.
 */
export const SABALENKA_CINCINNATI_R8_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "USA Cincinnati", "hard", "Ksinju Wang", [set(6, 1), set(6, 3)], "completed", true, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Talia Gibson", [set(6, 2), set(7, 6, 7, 2)], "completed", true, "player"),
  match("2026-08-08", "Canada Toronto", "hard", "Ekaterina Aleksandrova", [set(6, 7, 3, 7), set(6, 4), set(4, 6)], "completed", true, "opponent"),
  match("2026-08-06", "Canada Toronto", "hard", "Šuai Žang", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-08-04", "Canada Toronto", "hard", "Mojuka Utšižima", [set(6, 3), set(6, 3)], "completed", true, "player"),
  match("2026-07-05", "Wimbledon", "grass", "Naomi Osaka", [set(2, 6), set(6, 7)], "completed", true, "opponent"),
  match("2026-07-03", "Wimbledon", "grass", "Želena Ostapenko", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-07-01", "Wimbledon", "grass", "Mckartnei Kessler", [set(6, 1), set(7, 6, 11, 9)], "completed", true, "player"),
  match("2026-06-29", "Wimbledon", "grass", "Teodora Kostovic", [set(6, 2), set(6, 3)], "completed", true, "player"),
  match("2026-06-20", "Berlin", "grass", "Žessika Pegula", [set(4, 6), set(7, 6, 7, 4), set(0, 6)], "completed", true, "opponent"),
  match("2026-06-19", "Berlin", "grass", "Nikola Bartunkova", [set(2, 6), set(7, 6, 7, 2), set(6, 4)], "completed", true, "player"),
  match("2026-06-17", "Berlin", "grass", "Ekaterina Aleksandrova", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-06-03", "Roland-Garros", "clay", "Diana Šnaider", [set(6, 3), set(5, 7), set(0, 6)], "completed", true, "opponent"),
  match("2026-06-01", "Roland-Garros", "clay", "Naomi Osaka", [set(7, 5), set(6, 3)], "completed", true, "player"),
  match("2026-05-30", "Roland-Garros", "clay", "Kasatkina, Darya", [set(6, 0), set(7, 5)], "completed", true, "player"),
  match("2026-05-28", "Roland-Garros", "clay", "Elsa Žacvitsemot", [set(7, 5), set(6, 2)], "completed", true, "player"),
  match("2026-05-26", "Roland-Garros", "clay", "Žessika Bauzas Maneiro", [set(6, 4), set(6, 2)], "completed", true, "player"),
  match("2026-05-09", "ROM", "clay", "Sorana Cirsti", [set(6, 2), set(3, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-05-07", "ROM", "clay", "Barbora Krežcikova", [set(6, 2), set(6, 3)], "completed", true, "player"),
  match("2026-04-28", "Spain Madrid", "clay", "Hailei Baptiste", [set(6, 2), set(2, 6), set(6, 7, 6, 8)], "completed", true, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Sara Bežlek.
 * Todos los sets están orientados a Bežlek, incluso cuando aparece abajo.
 */
export const BEJLEK_CINCINNATI_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "USA Cincinnati", "hard", "Ekaterina Aleksandrova", [set(4, 6), set(6, 1), set(6, 2)], "completed", true, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Barbora Krežcikova", [set(7, 6, 7, 5), set(6, 4)], "completed", false, "player"),
  match("2026-08-14", "USA Cincinnati", "hard", "Karolina Pliskova", [set(6, 0), set(6, 2)], "completed", true, "player"),
  match("2026-08-04", "Canada Toronto", "hard", "Iga Swiatek", [set(0, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-08-02", "Canada Toronto", "hard", "Ksiiu Wang", [set(6, 3), set(4, 6), set(7, 5)], "completed", false, "player"),
  match("2026-07-24", "Czech Republic", "clay", "Lilli Tagger", [set(3, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-23", "Czech Republic", "clay", "Maria Timofiva", [set(6, 1), set(6, 1)], "completed", false, "player"),
  match("2026-07-21", "Czech Republic", "clay", "Anna Blinkova", [set(7, 6, 11, 9), set(3, 6), set(6, 1)], "completed", false, "player"),
  match("2026-07-17", "WTA Athens", "clay", "clara Tauson", [set(2, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-07-15", "WTA Athens", "clay", "Lilli Tagger", [set(6, 2), set(6, 2)], "completed", false, "player"),
  match("2026-07-13", "WTA Athens", "clay", "Viktoria Morvajõva", [set(6, 0), set(7, 5)], "completed", false, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Sorana Cirsti", [set(1, 6), set(6, 7, 6, 8)], "completed", false, "opponent"),
  match("2026-06-24", "Great Britain", "grass", "Zeinep Sonmez", [], "walkover", false, "opponent"),
  match("2026-06-23", "Great Britain", "grass", "Laura Siegemund", [set(3, 6), set(7, 6, 7, 2), set(7, 6, 7, 3)], "completed", true, "player"),
  match("2026-06-16", "Great Britain", "grass", "Karolina Pliskova", [set(6, 2), set(6, 7, 3, 7), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-09", "WTA S-Hertogenbosch", "grass", "Dajana Jastremska", [set(1, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-27", "Roland-Garros", "clay", "Iga Swiatek", [set(2, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-05-24", "Roland-Garros", "clay", "Sloane Stefens", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-05-17", "France Strasbourg", "clay", "Emma Navarro", [set(1, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-12", "WTA 125K", "clay", "Alina Tšaraeva", [set(4, 6), set(0, 6)], "completed", true, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Aleksis Galarniu.
 * Todos los sets están orientados a Galarniu, incluso cuando aparece abajo.
 */
export const GALARNEAU_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-03", "Canada Montreal", "hard", "Vit Kopriva", [set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-17", "Canada Granby", "hard", "Aleksandar Vukic", [set(6, 7, 2, 7), set(6, 7, 2, 7)], "completed", false, "opponent"),
  match("2026-07-15", "Canada Granby", "hard", "Tiler Zink", [set(6, 1), set(5, 7), set(7, 6, 7, 2)], "completed", false, "player"),
  match("2026-07-14", "Canada Granby", "hard", "Kaitši Utšida", [set(6, 2), set(6, 1)], "completed", false, "player"),
  match("2026-07-11", "Winnipeg", "hard", "Žakob Firnlei", [set(7, 6, 7, 2), set(3, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-10", "Winnipeg", "hard", "Daniel Milavski", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-07-09", "Winnipeg", "hard", "Adrian Mannarino", [set(6, 3), set(3, 6), set(7, 6, 7, 5)], "completed", false, "player"),
  match("2026-07-08", "Winnipeg", "hard", "Žuan Pablo Fikovich", [set(4, 6), set(6, 4), set(7, 6, 7, 4)], "completed", true, "player"),
  match("2026-06-24", "Wimbledon", "grass", "Oliver Tarvet", [set(5, 7), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-22", "Wimbledon", "grass", "Facundo Diaz Akosta", [set(6, 2), set(6, 2)], "completed", false, "player"),
  match("2026-06-18", "ATP Challenger", "grass", "Henri Sirle", [set(5, 7), set(6, 3), set(1, 6)], "completed", false, "opponent"),
  match("2026-06-17", "ATP Challenger", "grass", "Oliver crawford", [set(2, 6), set(6, 2), set(6, 4)], "completed", false, "player"),
  match("2026-06-15", "ATP Challenger", "grass", "Fransesko Maestrelli", [set(7, 6, 8, 6), set(7, 5)], "completed", true, "player"),
  match("2026-06-09", "Stuttgart", "grass", "Žan-Lennard Struff", [set(2, 6), set(7, 6, 7, 5), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-07", "Stuttgart", "grass", "Roman Safiullin", [set(6, 4), set(6, 7, 1, 7), set(7, 6, 7, 5)], "completed", false, "player"),
  match("2026-06-06", "Stuttgart", "grass", "Ju Hsiau Hsu", [set(4, 6), set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-05-31", "Little Rock", "hard", "Marc-Andri Huesler", [set(4, 6), set(7, 5), set(6, 7, 2, 7)], "completed", true, "opponent"),
  match("2026-05-21", "Roland-Garros", "clay", "Federiko cina", [set(7, 5), set(2, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-05-20", "Roland-Garros", "clay", "Pedro Boskardin Dias", [set(4, 6), set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-05-18", "Roland-Garros", "clay", "Aleks Barrena", [set(2, 6), set(6, 3), set(7, 6)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Dino Prizmic.
 * Todos los sets están orientados a Prizmic, incluso cuando aparece abajo.
 */
export const PRIZMIC_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-13", "USA Cincinnati", "hard", "Kameron Norrie", [set(6, 3), set(1, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-15", "Croatia Umag", "clay", "Aleks Molkan", [set(6, 3), set(6, 7, 5, 7), set(0, 4)], "retired", true, "opponent"),
  match("2026-07-13", "Croatia Umag", "clay", "Vit Kopriva", [set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-07-01", "Wimbledon", "grass", "Feliks Auger-Aliassime", [set(6, 7, 2, 7), set(3, 6), set(5, 7)], "completed", false, "opponent"),
  match("2026-06-29", "Wimbledon", "grass", "Adam Walton", [set(4, 6), set(7, 6, 7, 3), set(6, 4), set(6, 2)], "completed", false, "player"),
  match("2026-06-13", "Great Britain", "grass", "Rinki Hižikata", [set(6, 4), set(4, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-05-27", "Roland-Garros", "clay", "Žoao Fonseka", [set(6, 3), set(6, 4), set(3, 6), set(1, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-24", "Roland-Garros", "clay", "Mitšael Zheng", [set(6, 1), set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-05-12", "ROM", "clay", "Karen Hatšanov", [set(1, 6), set(6, 7, 2, 7)], "completed", false, "opponent"),
  match("2026-05-10", "ROM", "clay", "Ugo Humbert", [set(6, 1), set(7, 5)], "completed", false, "player"),
  match("2026-05-08", "ROM", "clay", "Novak Džokovic", [set(2, 6), set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-05-06", "ROM", "clay", "Marton Fucsovics", [set(6, 4), set(6, 3)], "completed", false, "player"),
  match("2026-05-05", "ROM", "clay", "Federiko Bondioli", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-05-04", "ROM", "clay", "Tšris Rodeš", [set(6, 4), set(6, 3)], "completed", true, "player"),
  match("2026-04-26", "Spain Madrid", "clay", "Tomas Martin Ettševerri", [set(6, 2), set(4, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-04-24", "Spain Madrid", "clay", "Ben Šelton", [set(6, 4), set(6, 7, 4, 7), set(7, 6, 7, 5)], "completed", false, "player"),
  match("2026-04-22", "Spain Madrid", "clay", "Matteo Berrettini", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-04-21", "Spain Madrid", "clay", "Zsombor Piros", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-04-20", "Spain Madrid", "clay", "Tšristofer O'Konnell", [set(7, 6, 11, 9), set(6, 7, 5, 7), set(7, 6, 7, 3)], "completed", true, "player"),
  match("2026-04-12", "ATP Challenger", "clay", "Rafael Kollignon", [set(6, 7, 2, 7), set(3, 6)], "completed", false, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Žakob Firnlei.
 * Todos los sets están orientados a Firnlei, incluso cuando aparece abajo.
 */
export const FEARNLEY_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-12", "USA Cincinnati", "hard", "Nikolas Mežia", [set(3, 6), set(6, 3), set(2, 6)], "completed", false, "opponent"),
  match("2026-08-05", "Canada Montreal", "hard", "Žakub Mensik", [set(3, 6), set(6, 3), set(3, 6)], "completed", true, "opponent"),
  match("2026-08-04", "Canada Montreal", "hard", "Adrian Mannarino", [set(7, 6), set(6, 4)], "completed", true, "player"),
  match("2026-08-01", "Canada Montreal", "hard", "Sebastian Ofner", [set(7, 6, 7, 3), set(6, 2)], "completed", true, "player"),
  match("2026-07-26", "Chicago", "hard", "Aleks Mitšelsen", [set(6, 7, 4, 7), set(3, 6)], "completed", false, "opponent"),
  match("2026-07-25", "Chicago", "hard", "Mitšael Zheng", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-07-24", "Chicago", "hard", "Žeffrei Žohn Wolf", [set(7, 6, 7, 5), set(4, 6), set(6, 3)], "completed", true, "player"),
  match("2026-07-23", "Chicago", "hard", "Tristan Boir", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-07-21", "Chicago", "hard", "Remi Bertola", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-07-12", "Winnipeg", "hard", "Adam Walton", [set(5, 7), set(7, 6, 10, 8), set(6, 4)], "completed", true, "player"),
  match("2026-07-11", "Winnipeg", "hard", "Aleksis Galarniu", [set(6, 7, 2, 7), set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-07-10", "Winnipeg", "hard", "Darwin Blantš", [set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-07-09", "Winnipeg", "hard", "Stefan Kozlov", [set(3, 6), set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-07-08", "Winnipeg", "hard", "Mark Lažal", [set(7, 5), set(3, 6), set(6, 1)], "completed", true, "player"),
  match("2026-07-02", "Wimbledon", "grass", "Žaume Antoni Munar clar", [set(4, 6), set(6, 7, 3, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-30", "Wimbledon", "grass", "Aleks Mitšelsen", [set(3, 6), set(4, 6), set(6, 2), set(6, 3), set(6, 2)], "completed", false, "player"),
  match("2026-06-17", "ATP Challenger", "grass", "Benžamin Bonzi", [set(1, 6), set(6, 7, 5, 7)], "completed", true, "opponent"),
  match("2026-06-16", "ATP Challenger", "grass", "Dane Swini", [set(6, 7, 16, 18), set(6, 1), set(6, 2)], "completed", false, "player"),
  match("2026-06-14", "Great Britain", "grass", "Bu Juntšaokete", [set(3, 6), set(6, 7, 1, 7)], "completed", true, "opponent"),
  match("2026-06-13", "Great Britain", "grass", "Filippo Romano", [set(6, 3), set(6, 7, 4, 7), set(6, 4)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Mackenzie Mcdonald.
 * Todos los sets están orientados a Mcdonald, incluso cuando aparece abajo.
 */
export const MCDONALD_QUEBEC_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-11", "USA Cincinnati", "hard", "Iibing Wu", [set(6, 7, 7, 9), set(6, 1), set(5, 7)], "completed", true, "opponent"),
  match("2026-07-28", "USA Washington", "hard", "Aleks Mitšelsen", [set(4, 6), set(5, 7)], "completed", false, "opponent"),
  match("2026-07-26", "USA Washington", "hard", "Trevor Svažda", [set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-25", "USA Washington", "hard", "Edas Butvilas", [set(3, 6), set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-07-08", "Winnipeg", "hard", "Adam Walton", [set(1, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-30", "Wimbledon", "grass", "Patrick Kipson", [set(6, 3), set(1, 6), set(4, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-06-25", "Wimbledon", "grass", "Tšristofer O'Konnell", [set(6, 3), set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-06-24", "Wimbledon", "grass", "Roberto Karballes Baena", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-06-22", "Wimbledon", "grass", "Felipe Alves", [set(6, 2), set(6, 7, 5, 7), set(6, 3)], "completed", true, "player"),
  match("2026-06-16", "ATP Challenger", "grass", "Šintaro Motšizuki", [set(6, 7, 3, 7), set(5, 7)], "completed", true, "opponent"),
  match("2026-06-14", "ATP Challenger", "grass", "Budkov Kžaer, Nikolai", [set(3, 6), set(6, 3), set(6, 2)], "completed", false, "player"),
  match("2026-06-06", "ATP S-Hertogenbosch", "grass", "Niels Visker", [set(6, 7, 7, 9), set(5, 7)], "completed", true, "opponent"),
  match("2026-06-04", "Surbiton", "grass", "Rinki Hižikata", [set(3, 6), set(6, 7, 5, 7)], "completed", true, "opponent"),
  match("2026-06-02", "Surbiton", "grass", "Budkov Kžaer, Nikolai", [set(6, 3), set(7, 6, 7, 3)], "completed", true, "player"),
  match("2026-05-18", "Roland-Garros", "clay", "Žuan Karlos Prado Angelo", [set(4, 6), set(6, 7)], "completed", false, "opponent"),
  match("2026-05-04", "ROM", "clay", "Daniel Mérida", [set(5, 7), set(4, 6)], "completed", false, "opponent"),
  match("2026-04-20", "Spain Madrid", "clay", "Lloid Harris", [set(4, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-04-14", "Gwangju", "hard", "Tšun Hsin Tseng", [set(1, 6), set(6, 7, 7, 9)], "completed", false, "opponent"),
  match("2026-04-07", "Mexico City", "clay", "Rodrigo Patšeko Mendez", [set(2, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-04-01", "Houston", "clay", "Siago Agustin Tirante", [set(2, 6), set(0, 6)], "completed", false, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Aleksandre Muller.
 * Todos los sets están orientados a Muller, incluso cuando aparece abajo.
 */
export const MULLER_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-03", "Lüdenscheid", "clay", "Gui Den Auden", [set(5, 7), set(2, 6)], "completed", false, "opponent"),
  match("2026-07-31", "ATP Challenger", "clay", "Mili Polžikak", [set(6, 7, 3, 7), set(7, 6, 7, 4), set(5, 7)], "completed", true, "opponent"),
  match("2026-07-29", "ATP Challenger", "clay", "Marko Sectšinato", [set(4, 6), set(6, 2), set(7, 5)], "completed", true, "player"),
  match("2026-07-27", "ATP Challenger", "clay", "Stefano Napolitano", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-07-20", "Austria Kitzbühel", "clay", "Mariano Navüan", [set(4, 6), set(0, 6)], "completed", true, "opponent"),
  match("2026-07-14", "Switzerland Gstaad", "clay", "Aleksander Ševtšenko", [set(6, 3), set(3, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-29", "Wimbledon", "grass", "Tommi Paul", [set(1, 6), set(2, 6), set(1, 6)], "completed", true, "opponent"),
  match("2026-05-26", "Roland-Garros", "clay", "Stefanos Tsitsipas", [set(2, 6), set(0, 3)], "retired", true, "opponent"),
  match("2026-05-16", "Switzerland Geneva", "clay", "Edas Butvilas", [set(4, 6), set(1, 6)], "completed", false, "opponent"),
  match("2026-05-13", "France Bordeaux", "clay", "Rei Sakamoto", [set(4, 6), set(6, 3), set(3, 6)], "completed", false, "opponent"),
  match("2026-05-06", "ROM", "clay", "Botic van de Zandschulp", [set(5, 7), set(3, 6)], "completed", true, "opponent"),
  match("2026-04-28", "France Aix-en-Provence", "clay", "Iibing Wu", [set(3, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-04-22", "Spain Madrid", "clay", "Žan-Lennard Struff", [set(6, 7, 3, 7), set(0, 6)], "completed", true, "opponent"),
  match("2026-04-12", "Spain Barcelona", "clay", "Otto Virtanen", [set(4, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-04-11", "Spain Barcelona", "clay", "Maks Alkala Gurri", [set(6, 2), set(6, 2)], "completed", false, "player"),
  match("2026-04-07", "MON", "clay", "Korentin Mautet", [set(4, 6), set(1, 6)], "completed", false, "opponent"),
  match("2026-04-05", "MON", "clay", "Matteo Arnaldi", [set(6, 1), set(6, 7, 4, 7), set(6, 4)], "completed", false, "player"),
  match("2026-04-04", "MON", "clay", "Žan Tšoinski", [set(7, 6, 7, 1), set(6, 3)], "completed", false, "player"),
  match("2026-04-03", "MAR", "clay", "Rafael Žodar", [set(2, 6), set(0, 2)], "retired", true, "opponent"),
  match("2026-04-02", "MAR", "clay", "Vit Kopriva", [set(6, 3), set(7, 6, 7, 3)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Tšak Lam Koleman Wong.
 * Todos los sets están orientados a Wong, incluso cuando aparece abajo.
 */
export const COLEMAN_WONG_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-14", "USA Cincinnati", "hard", "Daniel Altmaier", [set(6, 3), set(3, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-08-12", "USA Cincinnati", "hard", "Otto Virtanen", [set(7, 6, 7, 4), set(7, 6, 7, 2)], "completed", true, "player"),
  match("2026-08-11", "USA Cincinnati", "hard", "Seong Tšan Hong", [set(6, 4), set(6, 2)], "completed", true, "player"),
  match("2026-07-31", "Mexico Los Cabos", "hard", "Arsur Gi", [set(6, 7, 7, 9), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-30", "Mexico Los Cabos", "hard", "Ženson Bruksbi", [set(6, 1), set(7, 5)], "completed", true, "player"),
  match("2026-07-29", "Mexico Los Cabos", "hard", "Žiri Lehecka", [set(1, 6), set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-07-27", "Mexico Los Cabos", "hard", "Darwin Blantš", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-07-23", "Chicago", "hard", "Žeffrei Žohn Wolf", [set(3, 6), set(5, 7)], "completed", false, "opponent"),
  match("2026-07-21", "Chicago", "hard", "Spencer Johnson", [set(6, 2), set(6, 4)], "completed", false, "player"),
  match("2026-07-17", "ATP Challenger", "hard", "Spencer Johnson", [set(3, 6), set(6, 7, 2, 7)], "completed", true, "opponent"),
  match("2026-07-15", "ATP Challenger", "hard", "Anton Šepp", [set(7, 5), set(7, 6, 7, 5)], "completed", true, "player"),
  match("2026-07-13", "ATP Challenger", "hard", "Tung-Lin Wu", [set(6, 2), set(6, 2)], "completed", true, "player"),
  match("2026-06-22", "Wimbledon", "grass", "Borna Gožo", [set(6, 7, 10, 12), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-15", "ATP Challenger", "grass", "Billi Harris", [set(5, 7), set(6, 3), set(1, 6)], "completed", true, "opponent"),
  match("2026-06-06", "ATP S-Hertogenbosch", "grass", "Žames McKabe", [set(6, 3), set(4, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-04", "Surbiton", "grass", "Filippo Romano", [set(4, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-06-02", "Surbiton", "grass", "Oliver Tarvet", [set(7, 6, 7, 5), set(7, 6, 12, 10)], "completed", true, "player"),
  match("2026-05-24", "Roland-Garros", "clay", "Aleksander Blockks", [set(3, 6), set(4, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-21", "Roland-Garros", "clay", "Žuan Karlos Prado Angelo", [set(4, 6), set(6, 3), set(3, 6)], "completed", true, "opponent"),
  match("2026-05-20", "Roland-Garros", "clay", "Zdenek Kolar", [set(7, 5), set(2, 6), set(6, 1)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Otto Virtanen.
 * Todos los sets están orientados a Virtanen, incluso cuando aparece abajo.
 */
export const VIRTANEN_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-12", "USA Cincinnati", "hard", "Tšak Lam Koleman Wong", [set(6, 7, 4, 7), set(6, 7, 2, 7)], "completed", false, "opponent"),
  match("2026-08-11", "USA Cincinnati", "hard", "Vignesh Gogineni", [set(6, 3), set(6, 1)], "completed", false, "player"),
  match("2026-07-30", "ATP Challenger", "hard", "Timofei Skatov", [set(2, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-28", "ATP Challenger", "hard", "Filippo Romano", [set(7, 5), set(6, 4)], "completed", false, "player"),
  match("2026-07-26", "Finland Tampere", "clay", "Diego Dedura-Palomero", [set(3, 6), set(7, 6, 7, 3), set(3, 6)], "completed", false, "opponent"),
  match("2026-07-25", "Finland Tampere", "clay", "Maks Kasnikowski", [set(6, 2), set(6, 2)], "completed", false, "player"),
  match("2026-07-24", "Finland Tampere", "clay", "Henri Svitsire", [set(5, 2)], "retired", false, "player"),
  match("2026-07-23", "Finland Tampere", "clay", "Dimitar Kuzmanov", [set(6, 4), set(6, 2)], "completed", false, "player"),
  match("2026-07-21", "Finland Tampere", "clay", "Pedro Boskardin Dias", [set(4, 6), set(7, 6, 7, 3), set(6, 3)], "completed", false, "player"),
  match("2026-07-11", "Switzerland Gstaad", "clay", "Dilan Dietritš", [set(4, 6), set(6, 7, 4, 7)], "completed", true, "opponent"),
  match("2026-07-02", "Wimbledon", "grass", "Arsur Feri", [set(7, 5), set(6, 7, 3, 7), set(3, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-30", "Wimbledon", "grass", "Ben Šelton", [set(6, 4), set(3, 6), set(6, 7, 8, 10), set(6, 2), set(7, 6, 11, 9)], "completed", true, "player"),
  match("2026-06-25", "Wimbledon", "grass", "Budkov Kžaer, Nikolai", [set(4, 6), set(6, 4), set(6, 4), set(7, 5)], "completed", false, "player"),
  match("2026-06-24", "Wimbledon", "grass", "Luka Nardi", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-06-22", "Wimbledon", "grass", "Pedro Martínez", [set(6, 4), set(1, 6), set(6, 1)], "completed", true, "player"),
  match("2026-06-20", "ATP Challenger", "grass", "Tšristofer O'Konnell", [set(6, 7, 3, 7), set(6, 7, 6, 8)], "completed", true, "opponent"),
  match("2026-06-19", "ATP Challenger", "grass", "Žizhen Žang", [set(6, 4), set(6, 7, 5, 7), set(7, 5)], "completed", false, "player"),
  match("2026-06-18", "ATP Challenger", "grass", "Billi Harris", [set(7, 6, 7, 3), set(7, 6, 7, 3)], "completed", false, "player"),
  match("2026-06-17", "ATP Challenger", "grass", "Feliks Gill", [set(6, 2), set(6, 3)], "completed", true, "player"),
  match("2026-06-16", "ATP Challenger", "grass", "Soon Woo Kwon", [set(6, 2), set(7, 5)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Moez Etšargui.
 * Todos los sets están orientados a Etšargui, incluso cuando aparece abajo.
 */
export const ECHARGUI_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-11", "USA Cincinnati", "hard", "Mitšael Zheng", [set(7, 5), set(2, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-08-04", "USA Lexington", "hard", "Spencer Johnson", [set(4, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-26", "USA Washington", "hard", "Andres Martin", [set(2, 6), set(5, 7)], "completed", false, "opponent"),
  match("2026-07-25", "USA Washington", "hard", "Lee, Jordan", [set(7, 5), set(6, 1)], "completed", false, "player"),
  match("2026-07-20", "Segovia", "hard", "Lloid Harris", [set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-14", "Pozoblanco", "hard", "Dhakšineswar Sureš", [set(6, 4), set(6, 7, 2, 7), set(6, 7, 4, 7)], "completed", false, "opponent"),
  match("2026-06-25", "Wimbledon", "grass", "Hugo Gastón", [set(1, 6), set(7, 5), set(2, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-06-24", "Wimbledon", "grass", "Kigan Smis", [set(6, 4), set(3, 6), set(7, 6, 10, 6)], "completed", false, "player"),
  match("2026-06-22", "Wimbledon", "grass", "Edas Butvilas", [set(3, 6), set(7, 5), set(6, 3)], "completed", false, "player"),
  match("2026-06-15", "Ilkley", "grass", "Žaime Faria", [set(3, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-06-02", "Italy Perugia", "clay", "Tšun Hsin Tseng", [set(4, 6), set(6, 1), set(3, 6)], "completed", true, "opponent"),
  match("2026-05-26", "Italy Vicenza", "clay", "Remi Bertola", [set(2, 6), set(6, 3), set(3, 6)], "completed", false, "opponent"),
  match("2026-05-18", "Roland-Garros", "clay", "Bernard Tomic", [set(6, 3), set(5, 7), set(3, 6)], "completed", false, "opponent"),
  match("2026-05-12", "Tunis", "clay", "Žai clarke", [set(0, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-05-04", "ROM", "clay", "Cristian Garín", [set(0, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-04-28", "Ostrava", "clay", "Cristian Garín", [set(7, 6, 7, 5), set(4, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-04-21", "Spain Madrid", "clay", "Budkov Kžaer, Nikolai", [set(1, 6), set(0, 6)], "completed", true, "opponent"),
  match("2026-04-20", "Spain Madrid", "clay", "Aleksandar Kovasevic", [set(4, 6), set(6, 4), set(7, 6, 7, 3)], "completed", false, "player"),
  match("2026-04-15", "Oeiras", "clay", "Frederiko Ferreira Silva", [set(3, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-04-13", "Oeiras", "clay", "Tšris Rodeš", [set(6, 4), set(7, 6, 7, 4)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Rodrigo Patšeko Mendez.
 * Todos los sets están orientados a Patšeko Mendez, incluso cuando aparece abajo.
 */
export const PACHECO_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-03", "USA Lexington", "hard", "Aidan Majõ", [set(4, 6), set(6, 7, 7, 9)], "completed", true, "opponent"),
  match("2026-08-02", "USA Lexington", "hard", "Roger Pascual Ferra", [set(6, 2), set(6, 3)], "completed", true, "player"),
  match("2026-07-29", "Mexico Los Cabos", "hard", "Denis Šapovalov", [set(3, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-07-28", "Mexico Los Cabos", "hard", "Šo Šimabukuro", [set(6, 7), set(7, 5), set(6, 2)], "completed", false, "player"),
  match("2026-07-07", "Colombia Bogota", "clay", "Felipe Alves", [set(4, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-03", "Ecuador", "clay", "Felipe Alves", [set(6, 2), set(6, 7, 6, 8), set(6, 7, 5, 7)], "completed", false, "opponent"),
  match("2026-07-02", "Ecuador", "clay", "Segundo Goiti Zapiko", [set(6, 2), set(6, 2)], "completed", false, "player"),
  match("2026-06-30", "Ecuador", "clay", "Bruno Fernandez", [set(5, 7), set(6, 2), set(6, 4)], "completed", false, "player"),
  match("2026-04-10", "Mexico Morelos", "hard", "Luka Pavlovic", [set(6, 2), set(4, 6), set(6, 7, 1, 7)], "completed", false, "opponent"),
  match("2026-04-09", "Mexico Morelos", "hard", "Bor Artnak", [set(6, 4), set(3, 6), set(7, 5)], "completed", false, "player"),
  match("2026-04-07", "Mexico Morelos", "hard", "Mackenzie Mcdonald", [set(6, 2), set(6, 2)], "completed", true, "player"),
  match("2026-04-04", "Mexico San Luis Potosi", "clay", "Žames Duckwors", [set(6, 4), set(3, 6), set(6, 7, 7, 9)], "completed", false, "opponent"),
  match("2026-04-03", "Mexico San Luis Potosi", "clay", "Žuan Pablo Fikovich", [set(3, 6), set(6, 1), set(6, 4)], "completed", false, "player"),
  match("2026-04-02", "Mexico San Luis Potosi", "clay", "Luka Pavlovic", [set(4, 6), set(6, 3), set(6, 0)], "completed", true, "player"),
  match("2026-03-31", "Mexico San Luis Potosi", "clay", "Tibo Kolson", [set(6, 4), set(6, 2)], "completed", false, "player"),
  match("2026-03-26", "Mexico City", "clay", "Borna Gožo", [set(6, 7, 3, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-03-25", "Mexico City", "clay", "Žames Duckwors", [set(7, 6, 7, 4), set(6, 3)], "completed", false, "player"),
  match("2026-03-24", "Mexico City", "clay", "Olukajõde Alafia Damina Aini", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-03-20", "Mexico Merida", "clay", "Mitšael Mmoh", [set(7, 6, 9, 7), set(2, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-03-19", "Mexico Merida", "clay", "Arjan Šah", [set(6, 1)], "retired", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Marselo Tomas Barrios Vera.
 * Todos los sets están orientados a Barrios Vera, incluso cuando aparece abajo.
 */
export const BARRIOS_VERA_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-01", "Canada Montreal", "hard", "Aleksandar Vukic", [set(6, 7, 4, 7), set(2, 6)], "completed", false, "opponent"),
  match("2026-07-21", "Zug", "clay", "Dilan Dietritš", [set(4, 6), set(6, 4), set(1, 6)], "completed", false, "opponent"),
  match("2026-07-14", "Amersfoort", "clay", "Niels Visker", [set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-07", "ATP Challenger", "clay", "Ilia Simakin", [set(6, 4), set(5, 7), set(6, 7, 7, 9)], "completed", true, "opponent"),
  match("2026-06-25", "Wimbledon", "grass", "Dane Swini", [set(6, 4), set(4, 6), set(6, 7, 5, 7), set(6, 0), set(2, 6)], "completed", false, "opponent"),
  match("2026-06-24", "Wimbledon", "grass", "Paul Žubb", [set(6, 4), set(3, 6), set(6, 1)], "completed", false, "player"),
  match("2026-06-22", "Wimbledon", "grass", "Marko Sectšinato", [set(7, 6, 7, 2), set(6, 3)], "completed", false, "player"),
  match("2026-06-15", "ATP Challenger", "grass", "Benžamin Bonzi", [set(3, 6), set(6, 2), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-08", "Bratislava", "clay", "Sanasi Kokkinakis", [set(4, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-05-20", "Roland-Garros", "clay", "Luka Pavlovic", [set(2, 6), set(7, 6, 7, 5), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-19", "Roland-Garros", "clay", "Harold Majõt", [set(6, 4), set(1, 6), set(6, 3)], "completed", false, "player"),
  match("2026-05-14", "ATP Challenger", "clay", "Emilio Nava", [set(6, 2), set(4, 6), set(6, 7, 9, 11)], "completed", true, "opponent"),
  match("2026-05-13", "ATP Challenger", "clay", "Nišeš Basavareddi", [set(6, 1), set(6, 4)], "completed", true, "player"),
  match("2026-05-11", "ATP Challenger", "clay", "Mitšael Zheng", [set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-05-05", "ROM", "clay", "Daniel Mérida", [set(3, 6), set(6, 3), set(6, 7, 4, 7)], "completed", false, "opponent"),
  match("2026-05-04", "ROM", "clay", "Jacopo Vasami", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-04-29", "Mauthausen", "clay", "Lukas Neumair", [set(6, 7, 4, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-04-27", "Mauthausen", "clay", "Sebastian Sorger", [set(6, 1), set(2, 6), set(6, 4)], "completed", true, "player"),
  match("2026-04-20", "Spain Madrid", "clay", "Zsombor Piros", [set(3, 6), set(5, 7)], "completed", false, "opponent"),
  match("2026-03-31", "Florianopolis", "clay", "Murkel Aležandro Dellien Vel...", [set(4, 6), set(3, 6)], "completed", true, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Kamilo Ugo Karabelli.
 * Todos los sets están orientados a Ugo Karabelli, incluso cuando aparece abajo.
 */
export const UGO_CARABELLI_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-13", "USA Cincinnati", "hard", "Miomir Kecmanovic", [set(3, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-08-03", "Canada Montreal", "hard", "Kameron Norrie", [set(6, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-20", "Portugal", "clay", "Titauan Drogat", [set(0, 6), set(6, 3), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-16", "Croatia Umag", "clay", "Roman Andres Burrutšaga", [set(2, 6), set(6, 2), set(3, 6)], "completed", false, "opponent"),
  match("2026-07-15", "Croatia Umag", "clay", "Pablo Karreno-Busta", [set(3, 6), set(7, 5), set(7, 5)], "completed", false, "player"),
  match("2026-07-14", "Croatia Umag", "clay", "Marko Topo", [set(6, 7, 2, 7), set(7, 6, 7, 3), set(6, 3)], "completed", false, "player"),
  match("2026-06-29", "Wimbledon", "grass", "Daniel Mérida", [set(6, 4), set(6, 3), set(2, 6), set(0, 3)], "retired", true, "opponent"),
  match("2026-05-27", "Roland-Garros", "clay", "Andrei Rublev", [set(1, 6), set(6, 1), set(3, 6), set(6, 7, 5, 7)], "completed", true, "opponent"),
  match("2026-05-25", "Roland-Garros", "clay", "Emilio Nava", [set(7, 6, 12, 10), set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-05-21", "ATP Hamburg", "clay", "Aleksandar Kovasevic", [set(4, 6), set(7, 6, 12, 10), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-20", "ATP Hamburg", "clay", "Francis Tiafoe", [set(7, 6, 7, 3), set(7, 6, 7, 4)], "completed", true, "player"),
  match("2026-05-18", "ATP Hamburg", "clay", "Kamil Mažtšrzak", [set(1, 6), set(6, 2), set(6, 3)], "completed", false, "player"),
  match("2026-05-15", "ATP Challenger", "clay", "Miomir Kecmanovic", [set(1, 6), set(1, 6)], "completed", true, "opponent"),
  match("2026-05-14", "ATP Challenger", "clay", "Matteo Berrettini", [set(7, 6, 7, 2), set(6, 4)], "completed", true, "player"),
  match("2026-05-06", "ROM", "clay", "Aleksander Ševtšenko", [set(3, 6), set(6, 4), set(6, 7, 5, 7)], "completed", true, "opponent"),
  match("2026-04-25", "Spain Madrid", "clay", "Flavio Kobolli", [set(7, 6, 9, 7), set(1, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-04-23", "Spain Madrid", "clay", "Gael Monfils", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-04-15", "Spain Barcelona", "clay", "Rafael Žodar", [set(3, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-04-14", "Spain Barcelona", "clay", "Karen Hatšanov", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-04-04", "MAR", "clay", "Rafael Žodar", [set(2, 6), set(1, 6)], "completed", false, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Nikolas Mežia.
 * Todos los sets están orientados a Mežia, incluso cuando aparece abajo.
 */
export const MEJIA_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-14", "USA Cincinnati", "hard", "Adam Walton", [set(6, 7, 5, 7), set(0, 6)], "completed", false, "opponent"),
  match("2026-08-13", "USA Cincinnati", "hard", "Henrivitse Rotša", [set(7, 5), set(4, 6), set(6, 3)], "completed", false, "player"),
  match("2026-08-12", "USA Cincinnati", "hard", "Žakob Firnlei", [set(6, 3), set(3, 6), set(6, 2)], "completed", true, "player"),
  match("2026-08-05", "Canada Montreal", "hard", "Lorenzo Musetti", [set(6, 7), set(2, 6)], "completed", true, "opponent"),
  match("2026-08-03", "Canada Montreal", "hard", "Martin Landaluse", [set(4, 6), set(6, 4), set(6, 3)], "completed", true, "player"),
  match("2026-08-01", "Canada Montreal", "hard", "Marko Trungelliti", [set(7, 6, 7, 5), set(3, 6), set(6, 1)], "completed", false, "player"),
  match("2026-07-25", "Mexico Los Cabos", "hard", "Nakagawa, Naoki", [set(5, 7), set(2, 6)], "completed", true, "opponent"),
  match("2026-07-12", "Colombia Bogota", "clay", "Soto, Matías", [set(6, 1), set(7, 5)], "completed", true, "player"),
  match("2026-07-11", "Colombia Bogota", "clay", "Juan Pablo Varillas Patiño-S...", [set(6, 4), set(5, 7), set(6, 1)], "completed", true, "player"),
  match("2026-07-10", "Colombia Bogota", "clay", "Hernan Kasanova", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-07-09", "Colombia Bogota", "clay", "Santiago Rodrigaz Taverna", [set(7, 6, 7, 2), set(6, 7, 3, 7), set(6, 2)], "completed", true, "player"),
  match("2026-07-07", "Colombia Bogota", "clay", "Fermín Tenti", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-07-01", "Wimbledon", "grass", "Mitšael Zheng", [set(7, 6, 7, 4), set(6, 7, 8, 10), set(1, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-29", "Wimbledon", "grass", "Adolfo Daniel Volležo", [set(4, 6), set(6, 4), set(7, 5), set(7, 6, 7, 2)], "completed", false, "player"),
  match("2026-06-25", "Wimbledon", "grass", "Tristan Šulkate", [set(6, 4), set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-06-24", "Wimbledon", "grass", "Gustavo Heide", [set(6, 4), set(6, 3)], "completed", true, "player"),
  match("2026-06-22", "Wimbledon", "grass", "Henrivitse Rotša", [set(6, 4), set(6, 7, 6, 8), set(6, 2)], "completed", false, "player"),
  match("2026-06-17", "ATP Challenger", "grass", "Ii Žau", [set(6, 7, 5, 7), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-15", "ATP Challenger", "grass", "Žuan Pablo Fikovich", [set(6, 4), set(4, 6), set(6, 3)], "completed", false, "player"),
  match("2026-06-03", "Little Rock", "hard", "Karl Poling", [set(4, 6), set(4, 6)], "completed", false, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Gausier Onclin.
 * Todos los sets están orientados a Onclin, incluso cuando aparece abajo.
 */
export const ONCLIN_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "Cancun", "hard", "Alejandro Moro Cañaas", [set(6, 4), set(5, 7), set(6, 4)], "completed", true, "player"),
  match("2026-08-17", "Cancun", "hard", "Rjan Seggerman", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-08-13", "Santo Domingo", "hard", "Andrés Andrade", [set(3, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-08-11", "Santo Domingo", "hard", "Tiler Zink", [set(6, 4), set(3, 6), set(6, 3)], "completed", true, "player"),
  match("2026-07-25", "Finland Tampere", "clay", "Diego Dedura-Palomero", [set(2, 6), set(6, 2), set(6, 7, 2, 7)], "completed", false, "opponent"),
  match("2026-07-24", "Finland Tampere", "clay", "Tom Gentzš", [set(6, 2), set(6, 7, 5, 7), set(6, 3)], "completed", true, "player"),
  match("2026-07-22", "Finland Tampere", "clay", "Niels Visker", [set(6, 2), set(7, 6, 8, 6)], "completed", true, "player"),
  match("2026-07-20", "Finland Tampere", "clay", "Duže Aždukovic", [set(7, 6, 15, 13), set(6, 1)], "completed", true, "player"),
  match("2026-07-14", "Amersfoort", "clay", "Sižs Bugaard", [set(6, 3), set(6, 7, 3, 7), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-09", "Troyes", "clay", "Florian Broska", [set(7, 5), set(6, 7, 5, 7), set(2, 6)], "completed", true, "opponent"),
  match("2026-07-07", "Troyes", "clay", "Gerard Kampana Li", [set(4, 6), set(6, 2), set(6, 2)], "completed", true, "player"),
  match("2026-06-24", "Wimbledon", "grass", "Šintaro Motšizuki", [set(2, 6), set(6, 4), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-22", "Wimbledon", "grass", "Lorenzo Giustino", [set(6, 3), set(7, 5)], "completed", false, "player"),
  match("2026-06-15", "Ilkley", "grass", "Kirian Žacvitset", [set(6, 7, 6, 8), set(6, 7, 4, 7)], "completed", true, "opponent"),
  match("2026-06-10", "Stuttgart", "grass", "Giovanni Mpetshi Perrikard", [set(6, 7, 1, 7), set(2, 6)], "completed", false, "opponent"),
  match("2026-06-08", "Stuttgart", "grass", "Fabian Marozsan", [set(7, 6, 8, 6), set(6, 3)], "completed", true, "player"),
  match("2026-06-07", "Stuttgart", "grass", "Marc-Andri Huesler", [set(7, 6, 7, 1), set(6, 4)], "completed", false, "player"),
  match("2026-06-06", "Stuttgart", "grass", "Orlando Luz", [set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-06-02", "Heilbronn", "clay", "Marvin Moeller", [set(7, 5), set(1, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-05-26", "Vicenza", "clay", "Pavel Kotov", [set(1, 6), set(6, 3), set(4, 6)], "completed", false, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Timofei Skatov.
 * Todos los sets están orientados a Skatov, incluso cuando aparece abajo.
 */
export const SKATOV_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-03", "Lüdenscheid", "clay", "Aleks Barrena", [set(6, 7, 4, 7), set(2, 6)], "completed", false, "opponent"),
  match("2026-07-31", "Porto", "clay", "Juan Pablo Varillas Patiño-S...", [set(4, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-30", "Porto", "clay", "Otto Virtanen", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-07-28", "Porto", "clay", "Somas Faurel", [set(6, 1), set(7, 6, 10, 8)], "completed", true, "player"),
  match("2026-07-23", "Portugal", "clay", "Andrei Rublev", [set(1, 6), set(1, 6)], "completed", false, "opponent"),
  match("2026-07-21", "Portugal", "clay", "Žesper De Žong", [set(1, 6), set(6, 4), set(6, 3)], "completed", true, "player"),
  match("2026-07-19", "Portugal", "clay", "Pedro Martínez", [set(3, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-07-18", "Portugal", "clay", "Žoao Domingas", [set(6, 4), set(6, 7, 5, 7), set(6, 4)], "completed", false, "player"),
  match("2026-07-13", "Switzerland Gstaad", "clay", "Rafael Kollignon", [set(6, 3), set(6, 7, 1, 7), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-12", "Switzerland Gstaad", "clay", "Vitalii Satško", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-07-11", "Switzerland Gstaad", "clay", "Anirudh Tšandrasekar", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-07-07", "Braunschweig", "clay", "Mika Petkovic", [set(5, 7), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-25", "Wimbledon", "grass", "Kirian Žacvitset", [set(6, 7, 5, 7), set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-24", "Wimbledon", "grass", "Elias Imer", [set(6, 4), set(6, 1)], "completed", false, "player"),
  match("2026-06-22", "Wimbledon", "grass", "Aleks Barrena", [set(6, 3), set(7, 6, 7, 4)], "completed", true, "player"),
  match("2026-06-13", "Lyon", "clay", "Žames Watt", [set(6, 7, 5, 7), set(7, 6, 7, 2), set(6, 7, 8, 10)], "completed", true, "opponent"),
  match("2026-06-09", "Bratislava", "clay", "Taro Daniel", [set(3, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-06", "Italy Perugia", "clay", "Henrivitse Rotša", [set(4, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-05", "Italy Perugia", "clay", "Marko Sectšinato", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-06-03", "Italy Perugia", "clay", "Tšun Hsin Tseng", [set(6, 7, 2, 7), set(7, 6, 9, 7), set(7, 6, 7, 4)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Darwin Blantš.
 * Todos los sets están orientados a Blantš, incluso cuando aparece abajo.
 */
export const BLANCH_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-12", "USA Cincinnati", "hard", "Aleksandar Vukic", [set(3, 6), set(6, 7, 4, 7)], "completed", false, "opponent"),
  match("2026-07-27", "Mexico Los Cabos", "hard", "Tšak Lam Koleman Wong", [set(3, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-21", "Pozoblanco", "hard", "Mark Lažal", [set(4, 6), set(7, 5), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-14", "ATP Challenger", "hard", "Bernard Tomic", [set(4, 6), set(7, 6, 9, 7), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-10", "Bloomfield Hills", "hard", "Žakob Firnlei", [set(3, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-09", "Bloomfield Hills", "hard", "Garrett Žohns", [set(5, 7), set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-07-08", "Bloomfield Hills", "hard", "Murfi Kassüan", [set(6, 4), set(1, 6), set(6, 3)], "completed", false, "player"),
  match("2026-06-24", "Wimbledon", "grass", "Dane Swini", [set(6, 2), set(6, 7, 7, 9), set(0, 4)], "retired", false, "opponent"),
  match("2026-06-22", "Wimbledon", "grass", "Filip cristian Žianu", [set(7, 6, 7, 1), set(6, 4)], "completed", true, "player"),
  match("2026-06-15", "ATP Challenger", "grass", "Žizhen Žang", [set(4, 6), set(7, 6, 10, 8), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-13", "Great Britain Nottingham", "grass", "Žakob Firnlei", [set(6, 7, 4, 7), set(6, 7, 6, 8)], "completed", true, "opponent"),
  match("2026-06-12", "Great Britain Nottingham", "grass", "Henrivitse Rotša", [set(7, 6, 7, 4), set(1, 6), set(6, 3)], "completed", false, "player"),
  match("2026-06-09", "Great Britain Nottingham", "grass", "Tšristofer O'Konnell", [set(7, 6, 7, 4), set(4, 6), set(6, 3)], "completed", true, "player"),
  match("2026-05-22", "Roland-Garros", "clay", "Luka Pavlovic", [set(2, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-20", "Roland-Garros", "clay", "Tristan Šulkate", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-05-19", "Roland-Garros", "clay", "Timofei Skatov", [set(6, 1), set(6, 2)], "completed", true, "player"),
  match("2026-05-11", "ATP Challenger", "clay", "Žack Pinnington Žüans", [set(3, 6), set(7, 6, 7, 4), set(5, 7)], "completed", true, "opponent"),
  match("2026-05-02", "Ostrava", "clay", "Žaime Faria", [set(3, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-01", "Ostrava", "clay", "Matsew William Donald", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-04-29", "Ostrava", "clay", "Hugo Gastón", [set(3, 6), set(6, 3), set(6, 0)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Lloid Harris.
 * Todos los sets están orientados a Harris, incluso cuando aparece abajo.
 */
export const LLOYD_HARRIS_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "Cancun", "hard", "Laslo Džere", [set(7, 6, 7, 5), set(6, 3)], "completed", true, "player"),
  match("2026-08-17", "Cancun", "hard", "Abdullah Šelbaih", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-08-16", "Santo Domingo", "hard", "Andre Ilagan", [set(6, 2), set(7, 6, 8, 6)], "completed", false, "player"),
  match("2026-08-15", "Santo Domingo", "hard", "Daniel Milavski", [set(6, 7, 6, 8), set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-08-14", "Santo Domingo", "hard", "Harri Wendelken", [set(5, 7), set(6, 2), set(7, 5)], "completed", true, "player"),
  match("2026-08-13", "Santo Domingo", "hard", "Mis Rottgering", [set(7, 5), set(6, 4)], "completed", true, "player"),
  match("2026-08-12", "Santo Domingo", "hard", "Andrew Fenti", [set(7, 6, 7, 2), set(6, 1)], "completed", true, "player"),
  match("2026-08-05", "USA Lexington", "hard", "Dusan Lažovic", [set(6, 0), set(3, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-08-03", "USA Lexington", "hard", "Henri Sirle", [set(7, 5), set(2, 6), set(6, 3)], "completed", false, "player"),
  match("2026-07-23", "Segovia", "hard", "Aleks Mitšelsen", [set(3, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-07-20", "Segovia", "hard", "Moez Etšargui", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-06-01", "Surbiton", "grass", "Bu Juntšaokete", [set(6, 7, 5, 7), set(6, 1), set(1, 6)], "completed", false, "opponent"),
  match("2026-05-20", "Roland-Garros", "clay", "Andri Pellegrino", [set(6, 3), set(0, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-05-18", "Roland-Garros", "clay", "Hugo Grenier", [set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-04-21", "Spain Madrid", "clay", "Žaime Faria", [set(6, 4), set(3, 6)], "retired", false, "opponent"),
  match("2026-04-20", "Spain Madrid", "clay", "Mackenzie Mcdonald", [set(6, 4), set(6, 2)], "completed", true, "player"),
  match("2026-03-30", "MAR", "clay", "Dusan Lažovic", [set(4, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-03-29", "MAR", "clay", "Pierre-Hugas Herbert", [set(6, 4), set(6, 3)], "completed", false, "player"),
  match("2026-03-25", "Napoli", "clay", "Marko Sectšinato", [set(2, 6), set(1, 6)], "completed", true, "opponent"),
  match("2026-03-23", "Napoli", "clay", "Ivan Gahov", [set(6, 3)], "retired", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Felipe Alves.
 * Todos los sets están orientados a Alves, incluso cuando aparece abajo.
 */
export const ALVES_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "Cancun", "hard", "Dali Blantš", [set(6, 7, 5, 7), set(7, 6, 7, 2), set(6, 2)], "completed", false, "player"),
  match("2026-08-17", "Cancun", "hard", "Luka Pavlovic", [set(7, 6, 7, 2), set(7, 6, 7, 1)], "completed", true, "player"),
  match("2026-08-08", "ITF Brazil Belem", "clay", "Paulo Andre Saraiva Dos Sa...", [set(6, 3), set(7, 5)], "completed", true, "player"),
  match("2026-08-07", "ITF Brazil Belem", "clay", "Maksimo Zeitune", [set(3, 6), set(6, 2), set(6, 3)], "completed", false, "player"),
  match("2026-08-06", "ITF Brazil Belem", "clay", "Žoao Eduardo Šiessl", [set(6, 4), set(5, 7), set(6, 4)], "completed", true, "player"),
  match("2026-08-05", "ITF Brazil Belem", "clay", "Enzo Kohlmann De Freitas", [set(7, 6), set(6, 4)], "completed", true, "player"),
  match("2026-08-04", "ITF Brazil Belem", "clay", "Lorenzo Žoavitsin Rodrigaz", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-07-26", "ITF Brazil Belem", "clay", "Paulo Andre Saraiva Dos Sa...", [set(6, 4), set(6, 3)], "completed", true, "player"),
  match("2026-07-25", "ITF Brazil Belem", "clay", "Andrade Da Silva, Lukas", [set(7, 5), set(6, 4)], "completed", true, "player"),
  match("2026-07-24", "ITF Brazil Belem", "clay", "Soto, Matías", [set(6, 3), set(6, 0)], "completed", false, "player"),
  match("2026-07-23", "ITF Brazil Belem", "clay", "Malla, Bastián", [set(3, 6), set(7, 6), set(6, 3)], "completed", false, "player"),
  match("2026-07-22", "ITF Brazil Belem", "clay", "Žoao Eduardo Šiessl", [set(6, 2), set(6, 1)], "completed", true, "player"),
  match("2026-07-08", "Colombia Bogota", "clay", "Andrade Da Silva, Lukas", [set(6, 4), set(4, 6), set(6, 7, 7, 9)], "completed", true, "opponent"),
  match("2026-07-07", "Colombia Bogota", "clay", "Rodrigo Patšeko Mendez", [set(6, 4), set(6, 3)], "completed", false, "player"),
  match("2026-07-06", "Colombia Bogota", "clay", "Brandon Perez", [set(6, 1), set(6, 4)], "completed", false, "player"),
  match("2026-07-05", "Colombia Bogota", "clay", "Andres Urri", [set(6, 1), set(6, 1)], "completed", false, "player"),
  match("2026-07-04", "Ecuador", "clay", "Hernan Kasanova", [set(6, 7, 5, 7), set(5, 7)], "completed", true, "opponent"),
  match("2026-07-03", "Ecuador", "clay", "Rodrigo Patšeko Mendez", [set(2, 6), set(7, 6, 8, 6), set(7, 6, 7, 5)], "completed", true, "player"),
  match("2026-07-02", "Ecuador", "clay", "Valerio Aboian", [set(6, 2), set(6, 4)], "completed", false, "player"),
  match("2026-06-30", "Ecuador", "clay", "Andrade Da Silva, Lukas", [set(6, 1), set(6, 2)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Moise Kouame.
 * Todos los sets están orientados a Kouame, incluso cuando aparece abajo.
 */
export const KOUAME_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-07-28", "Mexico Los Cabos", "hard", "Edward Winter", [set(1, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-14", "Bastad", "clay", "Nuno Borges", [set(4, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-07-06", "Braunschweig", "clay", "Maks Hans Rehberg", [set(4, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-05-30", "Roland-Garros", "clay", "Aležandro Tabilo", [set(6, 4), set(3, 6), set(4, 6), set(6, 7, 9, 11)], "completed", true, "opponent"),
  match("2026-05-28", "Roland-Garros", "clay", "Adolfo Daniel Volležo", [set(6, 3), set(7, 5), set(3, 6), set(2, 6), set(7, 6)], "completed", false, "player"),
  match("2026-05-26", "Roland-Garros", "clay", "Marin cilic", [set(7, 6), set(6, 2), set(6, 1)], "completed", false, "player"),
  match("2026-05-19", "ATP Challenger", "clay", "Jacopo Vasami", [set(3, 6), set(6, 7, 3, 7)], "completed", true, "opponent"),
  match("2026-05-12", "France Bordeaux", "clay", "Benžamin Bonzi", [set(6, 2), set(4, 6), set(0, 6)], "completed", true, "opponent"),
  match("2026-04-20", "Spain Madrid", "clay", "Patrick Kipson", [set(2, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-04-18", "ITF Italy", "clay", "Žuan cruz Martin Manzano", [set(6, 3), set(4, 6), set(6, 3)], "completed", false, "player"),
  match("2026-04-17", "ITF Italy", "clay", "Filip Henning", [set(6, 2), set(6, 3)], "completed", true, "player"),
  match("2026-04-17", "ITF Italy", "clay", "Andrei Tšepelev", [set(6, 1), set(6, 2)], "completed", false, "player"),
  match("2026-04-15", "ITF Italy", "clay", "Fransesko Ferrari", [set(6, 2), set(6, 0)], "completed", false, "player"),
  match("2026-04-14", "ITF Italy", "clay", "Henri Bernet", [set(7, 5), set(2, 6), set(6, 4)], "completed", false, "player"),
  match("2026-04-05", "MON", "clay", "Ugo Humbert", [set(3, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-03-20", "MIA", "hard", "Žiri Lehecka", [set(2, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-03-19", "MIA", "hard", "Zatšari Svažda", [set(5, 7), set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-03-06", "Lugano", "hard", "Hugo Gastón", [set(6, 3), set(3, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-03-04", "Lugano", "hard", "Giulio Zeppieri", [set(6, 1), set(1, 0)], "retired", true, "player"),
  match("2026-03-03", "Lugano", "hard", "Želle Sels", [set(6, 3), set(6, 0)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Alan Magadan.
 * Todos los sets están orientados a Magadan, incluso cuando aparece abajo.
 */
export const MAGADAN_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "Cancun", "hard", "Rio Nogutši", [set(6, 3), set(7, 6, 8, 6)], "completed", true, "player"),
  match("2026-08-17", "Cancun", "hard", "David Žorda Santšis", [set(6, 4), set(7, 6, 7, 5)], "completed", false, "player"),
  match("2026-08-12", "ITF USA", "hard", "Mitchell Sheldon", [set(4, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-07-26", "Mexico Los Cabos", "hard", "Nakagawa, Naoki", [set(3, 6), set(6, 7, 6, 8)], "completed", false, "opponent"),
  match("2026-07-25", "Mexico Los Cabos", "hard", "Garrett Žohns", [set(2, 6), set(6, 1), set(6, 1)], "completed", true, "player"),
  match("2026-07-22", "ATP Challenger", "hard", "Mitšael Zheng", [set(5, 7), set(3, 6)], "completed", false, "opponent"),
  match("2026-07-21", "ATP Challenger", "hard", "Stefan Kozlov", [set(3, 6), set(6, 1), set(7, 6, 7, 4)], "completed", false, "player"),
  match("2026-07-20", "ATP Challenger", "hard", "Aidan Majõ", [set(7, 6, 7, 3), set(3, 6), set(7, 6, 7, 4)], "completed", false, "player"),
  match("2026-07-19", "ATP Challenger", "hard", "Owen Demus", [set(6, 1), set(6, 0)], "completed", false, "player"),
  match("2026-07-12", "Canada Laval", "hard", "Benžamin Somas George", [set(5, 7), set(6, 1), set(3, 6)], "completed", false, "opponent"),
  match("2026-07-08", "Colombia Bogota", "clay", "Soto, Matías", [set(6, 7, 5, 7), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-06", "Colombia Bogota", "clay", "Žohan Aleksander Rodrigaz ...", [set(7, 5), set(7, 5)], "completed", true, "player"),
  match("2026-07-03", "Ecuador", "clay", "Maseus Pucinelli de Almeida", [set(1, 6), set(7, 6, 7, 4), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-01", "Ecuador", "clay", "Juan Pablo Varillas Patiño-S...", [set(6, 1), set(6, 4)], "completed", false, "player"),
  match("2026-06-30", "Ecuador", "clay", "Pedro Sakamoto", [set(2, 6), set(6, 3), set(7, 5)], "completed", false, "player"),
  match("2026-06-12", "ITF Japan", "grass", "Naoja Honda", [set(6, 4), set(6, 7, 6, 8), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-11", "ITF Japan", "grass", "Žake Delanei", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-06-10", "ITF Japan", "grass", "Sora Fukuda", [], "walkover", false, "player"),
  match("2026-06-08", "ITF Japan", "grass", "Hion Tšung", [set(4, 6), set(6, 1), set(6, 0)], "completed", true, "player"),
  match("2026-06-04", "UTR PTT", "hard", "Hunter Heck", [set(6, 0), set(6, 4)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Nakagawa, Naoki.
 * Todos los sets están orientados a Nakagawa, incluso cuando aparece abajo.
 */
export const NAKAGAWA_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-02", "USA Lexington", "hard", "Millen Hurrion", [set(4, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-27", "Mexico Los Cabos", "hard", "Bernard Tomic", [set(1, 6), set(0, 6)], "completed", true, "opponent"),
  match("2026-07-26", "Mexico Los Cabos", "hard", "Alan Magadan", [set(6, 3), set(7, 6, 8, 6)], "completed", true, "player"),
  match("2026-07-25", "Mexico Los Cabos", "hard", "Nikolas Mežia", [set(7, 5), set(6, 2)], "completed", false, "player"),
  match("2026-07-07", "Colombia Bogota", "clay", "Nick Hardt", [set(6, 7, 5, 7), set(6, 4), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-30", "Ecuador", "clay", "Žuan Manuel Serna", [set(3, 6), set(6, 4), set(1, 6)], "completed", false, "opponent"),
  match("2026-06-22", "Challenge Santa Fe", "clay", "Žuan Bautista Torres", [set(6, 3), set(2, 6), set(0, 6)], "completed", false, "opponent"),
  match("2026-06-16", "ATP Challenger", "clay", "Guido Ivan Žusto", [set(0, 6), set(1, 6)], "completed", false, "opponent"),
  match("2026-05-21", "ATP Challenger", "clay", "Ilja Ivaška", [set(1, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-20", "ATP Challenger", "clay", "Naoja Honda", [set(5, 7), set(7, 5), set(6, 4)], "completed", true, "player"),
  match("2026-05-19", "ATP Challenger", "clay", "Grigorii Lomakin", [set(6, 4), set(7, 6, 8, 6)], "completed", false, "player"),
  match("2026-05-11", "ATP Challenger", "hard", "Juta Kawahaši", [set(3, 6), set(6, 3), set(4, 6)], "completed", true, "opponent"),
  match("2026-04-10", "Mexico Morelos", "hard", "Tibo Kolson", [set(6, 7, 5, 7), set(6, 2), set(5, 7)], "completed", false, "opponent"),
  match("2026-04-09", "Mexico Morelos", "hard", "Žuan Pablo Fikovich", [set(7, 5), set(4, 6), set(6, 4)], "completed", true, "player"),
  match("2026-04-07", "Mexico Morelos", "hard", "Karl Poling", [set(7, 5), set(6, 4)], "completed", true, "player"),
  match("2026-03-31", "Mexico San Luis Potosi", "clay", "Nikolas Mežia", [set(3, 6), set(7, 6, 7, 3), set(3, 6)], "completed", true, "opponent"),
  match("2026-03-24", "Mexico City", "clay", "Andrés Andrade", [set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-03-19", "Mexico Merida", "clay", "Marc-Andri Huesler", [set(3, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-03-17", "Mexico Merida", "clay", "Tibo Kolson", [set(6, 4), set(6, 0)], "completed", true, "player"),
  match("2026-02-21", "Mexico Acapulco", "hard", "Tšak Lam Koleman Wong", [set(3, 6), set(2, 6)], "completed", true, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Henrivitse Rotša.
 * Todos los sets están orientados a Rocha, incluso cuando aparece abajo.
 */
export const ROCHA_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-18", "Cancun", "hard", "Seong Tšan Hong", [set(6, 4), set(6, 1)], "completed", true, "player"),
  match("2026-08-13", "USA Cincinnati", "hard", "Nikolas Mežia", [set(5, 7), set(6, 4), set(3, 6)], "completed", true, "opponent"),
  match("2026-08-12", "USA Cincinnati", "hard", "Markos Giron", [set(6, 4), set(7, 6, 8, 6)], "completed", false, "player"),
  match("2026-08-01", "Canada Montreal", "hard", "Martin Damm Žr", [set(3, 6), set(6, 7, 3, 7)], "completed", false, "opponent"),
  match("2026-07-20", "Portugal", "clay", "Pedro Martínez", [set(5, 7), set(5, 7)], "completed", true, "opponent"),
  match("2026-07-13", "Croatia Umag", "clay", "Damir Dzumhur", [set(2, 6), set(1, 6)], "completed", false, "opponent"),
  match("2026-06-22", "Wimbledon", "grass", "Nikolas Mežia", [set(4, 6), set(7, 6, 8, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-15", "ATP Challenger", "grass", "Tšristofer O'Konnell", [set(6, 7, 2, 7), set(1, 6)], "completed", true, "opponent"),
  match("2026-06-12", "Great Britain Nottingham", "grass", "Darwin Blantš", [set(6, 7, 4, 7), set(6, 1), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-10", "Great Britain Nottingham", "grass", "Tšarles Brum", [set(6, 2), set(6, 2)], "completed", true, "player"),
  match("2026-06-07", "Italy Perugia", "clay", "Daniel Mérida", [set(7, 6, 7, 5), set(6, 3)], "completed", true, "player"),
  match("2026-06-06", "Italy Perugia", "clay", "Timofei Skatov", [set(6, 4), set(6, 2)], "completed", false, "player"),
  match("2026-06-05", "Italy Perugia", "clay", "Remi Bertola", [set(6, 2), set(4, 6), set(6, 2)], "completed", true, "player"),
  match("2026-06-04", "Italy Perugia", "clay", "Dusan Lažovic", [set(6, 4), set(7, 5)], "completed", true, "player"),
  match("2026-06-02", "Italy Perugia", "clay", "Enriko Dolla Valle", [set(6, 4), set(7, 6, 9, 7)], "completed", true, "player"),
  match("2026-05-20", "Roland-Garros", "clay", "Borna Gožo", [set(3, 6), set(6, 3), set(6, 7, 9, 11)], "completed", true, "opponent"),
  match("2026-05-19", "Roland-Garros", "clay", "Zsombor Piros", [set(6, 4), set(7, 6)], "completed", true, "player"),
  match("2026-05-11", "ATP Challenger", "clay", "Roman Safiullin", [set(7, 5), set(6, 7, 5, 7), set(2, 6)], "completed", true, "opponent"),
  match("2026-05-04", "ROM", "clay", "Pablo Llamas Ruíz", [set(6, 4), set(3, 6), set(1, 6)], "completed", false, "opponent"),
  match("2026-04-21", "Spain Madrid", "clay", "Adolfo Daniel Volležo", [set(1, 6), set(6, 4), set(2, 6)], "completed", false, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Hubert Hurkacz.
 * Todos los sets están orientados a Hurkacz, incluso cuando aparece abajo.
 */
export const HURKACZ_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-15", "USA Cincinnati", "hard", "Tommi Paul", [set(4, 6), set(7, 6, 7, 3), set(3, 6)], "completed", false, "opponent"),
  match("2026-08-14", "USA Cincinnati", "hard", "Šo Šimabukuro", [set(6, 2), set(6, 4)], "completed", false, "player"),
  match("2026-08-07", "Canada Montreal", "hard", "Botic van de Zandschulp", [set(6, 3), set(6, 7, 4, 7), set(5, 7)], "completed", false, "opponent"),
  match("2026-08-05", "Canada Montreal", "hard", "Aležandro Tabilo", [set(6, 4), set(7, 6)], "completed", true, "player"),
  match("2026-08-04", "Canada Montreal", "hard", "Markos Giron", [set(7, 5), set(4, 6), set(6, 2)], "completed", true, "player"),
  match("2026-07-05", "Wimbledon", "grass", "Žan-Lennard Struff", [set(6, 3), set(7, 6, 7, 5), set(6, 7, 2, 7), set(5, 7), set(2, 4)], "retired", true, "opponent"),
  match("2026-07-03", "Wimbledon", "grass", "Tommi Paul", [set(4, 6), set(7, 6, 7, 5), set(7, 5), set(6, 2)], "completed", true, "player"),
  match("2026-07-01", "Wimbledon", "grass", "Sebastian Ofner", [set(7, 6, 10, 8), set(6, 4), set(6, 4)], "completed", true, "player"),
  match("2026-06-29", "Wimbledon", "grass", "Kasper Ruud", [set(6, 4), set(6, 2), set(7, 6, 9, 7)], "completed", false, "player"),
  match("2026-06-17", "Germany Halle", "grass", "Daniel Altmaier", [set(6, 3), set(3, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-06-16", "Germany Halle", "grass", "Andrei Rublev", [set(6, 3), set(6, 2)], "completed", false, "player"),
  match("2026-06-09", "ATP S-Hertogenbosch", "grass", "Marton Fucsovics", [set(6, 3), set(6, 7, 5, 7), set(6, 7, 4, 7)], "completed", true, "opponent"),
  match("2026-05-28", "Roland-Garros", "clay", "Francis Tiafoe", [set(7, 6, 7, 5), set(6, 7, 5, 7), set(4, 6), set(7, 6, 7, 1), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-25", "Roland-Garros", "clay", "Žaume Antoni Munar clar", [set(6, 3), set(6, 3), set(2, 6), set(6, 3)], "completed", false, "player"),
  match("2026-05-06", "ROM", "clay", "Jannick Hanfmann", [set(7, 6, 7, 3), set(6, 7, 2, 7), set(2, 6)], "completed", true, "opponent"),
  match("2026-05-03", "ATP Challenger", "clay", "Matteo Arnaldi", [set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-02", "ATP Challenger", "clay", "Roman Andres Burrutšaga", [set(4, 6), set(7, 6, 7, 3), set(6, 3)], "completed", true, "player"),
  match("2026-05-01", "ATP Challenger", "clay", "Matteo Berrettini", [set(4, 6), set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-04-30", "ATP Challenger", "clay", "Emilio Nava", [set(6, 4), set(6, 1)], "completed", false, "player"),
  match("2026-04-28", "ATP Challenger", "clay", "Zatšari Svažda", [set(6, 2), set(7, 6, 10, 8)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Vit Kopriva.
 * Todos los sets están orientados a Kopriva, incluso cuando aparece abajo.
 */
export const KOPRIVA_CANCUN_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-14", "USA Cincinnati", "hard", "kuentin Halis", [set(6, 7, 5, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-08-04", "Canada Montreal", "hard", "Žiri Lehecka", [set(4, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-08-03", "Canada Montreal", "hard", "Aleksis Galarniu", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-07-20", "Austria Kitzbuhel", "clay", "Ignacio Buse", [set(5, 7), set(7, 6, 7, 3), set(1, 6)], "completed", true, "opponent"),
  match("2026-07-13", "Croatia Umag", "clay", "Dino Prizmic", [set(1, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-30", "Wimbledon", "grass", "Žan Tšoinski", [set(3, 6), set(5, 7), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-25", "ATP Mallorca", "grass", "Esan kuinn", [set(7, 5), set(5, 7), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-24", "ATP Mallorca", "grass", "Ignacio Buse", [set(7, 5), set(6, 1)], "completed", true, "player"),
  match("2026-06-23", "ATP Mallorca", "grass", "Damir Dzumhur", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-06-16", "Germany Halle", "grass", "Aleksander Zverev", [set(3, 6), set(6, 4), set(2, 6)], "completed", false, "opponent"),
  match("2026-06-04", "Czech Republic Prostejov", "clay", "Vitalii Satško", [set(1, 6), set(6, 4), set(6, 7, 4, 7)], "completed", false, "opponent"),
  match("2026-06-02", "Czech Republic Prostejov", "clay", "Andrež Martin", [set(6, 0), set(6, 4)], "completed", false, "player"),
  match("2026-05-28", "Roland-Garros", "clay", "Martin Landaluse", [set(6, 1), set(6, 2), set(4, 6), set(5, 7), set(0, 6)], "completed", false, "opponent"),
  match("2026-05-26", "Roland-Garros", "clay", "Korentin Mautet", [set(6, 3), set(5, 7), set(6, 4), set(3, 6), set(6, 3)], "completed", true, "player"),
  match("2026-05-19", "ATP Hamburg", "clay", "Feliks Auger-Aliassime", [set(5, 7), set(1, 6)], "completed", false, "opponent"),
  match("2026-05-08", "ROM", "clay", "Ugo Humbert", [set(3, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-06", "ROM", "clay", "Fabian Marozsan", [set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-04-28", "Spain Madrid", "clay", "Rafael Žodar", [set(5, 7), set(0, 6)], "completed", true, "opponent"),
  match("2026-04-26", "Spain Madrid", "clay", "Arsur Rinderknetš", [set(6, 4), set(3, 6)], "retired", true, "player"),
  match("2026-04-24", "Spain Madrid", "clay", "Andrei Rublev", [set(6, 3), set(6, 4)], "completed", false, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Gausier Onclin (Cancún 1/8).
 * Todos los sets están orientados a Onclin, incluso cuando aparece abajo.
 */
export const ONCLIN_CANCUN_R8_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-19", "Cancun", "hard", "Timofei Skatov", [set(2, 6), set(6, 2), set(6, 3)], "completed", true, "player"),
  match("2026-08-18", "Cancun", "hard", "Alejandro Moro Cañaas", [set(6, 4), set(5, 7), set(6, 4)], "completed", true, "player"),
  match("2026-08-17", "Cancun", "hard", "Rjan Seggerman", [set(6, 3), set(6, 4)], "completed", true, "player"),
  match("2026-08-13", "ATP Challenger", "hard", "Andrés Andrade", [set(3, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-08-11", "ATP Challenger", "hard", "Tiler Zink", [set(6, 4), set(3, 6), set(6, 3)], "completed", true, "player"),
  match("2026-07-25", "Finland Tampere", "clay", "Diego Dedura-Palomero", [set(2, 6), set(6, 2), set(6, 7, 2, 7)], "completed", false, "opponent"),
  match("2026-07-24", "Finland Tampere", "clay", "Tom Gentzš", [set(6, 2), set(6, 7, 5, 7), set(6, 3)], "completed", true, "player"),
  match("2026-07-22", "Finland Tampere", "clay", "Niels Visker", [set(6, 2), set(7, 6, 8, 6)], "completed", true, "player"),
  match("2026-07-20", "Finland Tampere", "clay", "Duže Aždukovic", [set(7, 6, 15, 13), set(6, 1)], "completed", true, "player"),
  match("2026-07-14", "Amersfoort", "clay", "Sižs Bugaard", [set(6, 3), set(6, 7, 3, 7), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-09", "ATP Challenger", "clay", "Florian Broska", [set(7, 5), set(6, 7, 5, 7), set(2, 6)], "completed", true, "opponent"),
  match("2026-07-07", "ATP Challenger", "clay", "Gerard Kampana Li", [set(4, 6), set(6, 2), set(6, 2)], "completed", true, "player"),
  match("2026-06-24", "Wimbledon", "grass", "Šintaro Motšizuki", [set(2, 6), set(6, 4), set(3, 6)], "completed", true, "opponent"),
  match("2026-06-22", "Wimbledon", "grass", "Lorenzo Giustino", [set(6, 3), set(7, 5)], "completed", false, "player"),
  match("2026-06-15", "ATP Challenger", "grass", "Kirian Žacvitset", [set(6, 7, 6, 8), set(6, 7, 4, 7)], "completed", true, "opponent"),
  match("2026-06-10", "STU", "grass", "Giovanni Mpetshi Perrikard", [set(6, 7, 1, 7), set(2, 6)], "completed", false, "opponent"),
  match("2026-06-08", "STU", "grass", "Fabian Marozsan", [set(7, 6, 8, 6), set(6, 3)], "completed", true, "player"),
  match("2026-06-07", "STU", "grass", "Marc-Andri Huesler", [set(7, 6, 7, 1), set(6, 4)], "completed", false, "player"),
  match("2026-06-06", "STU", "grass", "Orlando Luz", [set(6, 1), set(6, 3)], "completed", false, "player"),
  match("2026-06-02", "ATP Challenger", "clay", "Marvin Moeller", [set(7, 5), set(1, 6), set(4, 6)], "completed", false, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Žuan Karlos Prado Angelo.
 * Todos los sets están orientados a Prado Angelo, incluso cuando aparece abajo.
 */
export const PRADO_ANGELO_KINGSTON_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-19", "ATP Challenger Kingston", "hard", "Andrés Andrade", [set(3, 6), set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-08-18", "ATP Challenger Kingston", "hard", "Žuan Pablo Fikovich", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-07-31", "ATP Challenger San Marino", "clay", "Facundo Diaz Akosta", [set(2, 6), set(6, 4), set(1, 6)], "completed", false, "opponent"),
  match("2026-07-29", "ATP Challenger San Marino", "clay", "Hugo Dellien", [set(7, 6, 7, 4)], "retired", true, "player"),
  match("2026-07-27", "ATP Challenger San Marino", "clay", "Daniel Rinkon", [set(6, 4), set(6, 7, 5, 7), set(6, 3)], "completed", false, "player"),
  match("2026-07-18", "Portugal Porto", "clay", "Taro Daniel", [set(4, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-07-15", "Croatia Umag", "clay", "Damir Dzumhur", [set(6, 7, 2, 7), set(1, 6)], "completed", true, "opponent"),
  match("2026-07-14", "Croatia Umag", "clay", "Lukas Neumair", [set(6, 3), set(7, 6, 8, 6)], "completed", false, "player"),
  match("2026-07-12", "Croatia Umag", "clay", "Nikolas Santšez Izvitsierdo", [set(6, 3), set(7, 6, 7, 4)], "completed", true, "player"),
  match("2026-07-11", "Croatia Umag", "clay", "Maždandzic, Marc", [set(6, 4), set(6, 3)], "completed", true, "player"),
  match("2026-07-07", "Germany Braunschweig", "clay", "Adolfo Daniel Volležo", [set(2, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-30", "Italy Milan", "clay", "David Žorda Santšis", [set(2, 6), set(6, 7, 2, 7)], "completed", false, "opponent"),
  match("2026-06-22", "Wimbledon", "grass", "Daniel Evans", [set(6, 7, 2, 7), set(3, 6)], "completed", true, "opponent"),
  match("2026-05-26", "Roland-Garros", "clay", "Martin Landaluse", [set(3, 6), set(6, 4), set(2, 6), set(7, 6, 7, 3), set(4, 6)], "completed", false, "opponent"),
  match("2026-05-21", "Roland-Garros", "clay", "Tšak Lam Koleman Wong", [set(6, 4), set(3, 6), set(6, 3)], "completed", false, "player"),
  match("2026-05-20", "Roland-Garros", "clay", "Daniil Glinka", [set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-05-18", "Roland-Garros", "clay", "Mackenzie Mcdonald", [set(6, 4), set(7, 6)], "completed", true, "player"),
  match("2026-05-12", "ATP Challenger Zagreb", "clay", "Lindro Riedi", [set(7, 6, 7, 5), set(1, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-05-07", "Italy Francavilla", "clay", "Rjan Seggerman", [set(7, 6, 7, 5), set(5, 7), set(6, 7, 5, 7)], "completed", true, "opponent"),
  match("2026-05-06", "Italy Francavilla", "clay", "Buvaisar Gadamauri", [set(6, 4), set(6, 4)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Pedro Martínez.
 * Todos los sets están orientados a Martínez, incluso cuando aparece abajo.
 */
export const MARTINEZ_KINGSTON_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-19", "ATP Challenger Kingston", "hard", "Garrett Žohns", [set(6, 4), set(6, 1)], "completed", false, "player"),
  match("2026-08-18", "ATP Challenger Kingston", "hard", "Evan Žu", [set(7, 5), set(6, 4)], "completed", false, "player"),
  match("2026-07-28", "ATP Challenger San Marino", "clay", "Hugo Dellien", [set(1, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-07-23", "Portugal Porto", "clay", "Luciano Darderi", [set(0, 6), set(1, 6)], "completed", true, "opponent"),
  match("2026-07-20", "Portugal Porto", "clay", "Henrivitse Rotša", [set(7, 5), set(7, 5)], "completed", false, "player"),
  match("2026-07-19", "Portugal Porto", "clay", "Timofei Skatov", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-07-18", "Portugal Porto", "clay", "David Žorda Santšis", [set(6, 0), set(6, 4)], "completed", true, "player"),
  match("2026-07-14", "Switzerland Gstaad", "clay", "Jannick Hanfmann", [set(6, 7, 6, 8), set(1, 6)], "completed", true, "opponent"),
  match("2026-07-08", "ATP Challenger Braunschweig", "clay", "Maks Kasnikowski", [set(6, 4), set(3, 6), set(5, 7)], "completed", true, "opponent"),
  match("2026-07-07", "ATP Challenger Braunschweig", "clay", "S D Pražwal Dev", [set(6, 3), set(4, 6), set(6, 2)], "completed", true, "player"),
  match("2026-06-22", "Wimbledon", "grass", "Otto Virtanen", [set(4, 6), set(6, 1), set(1, 6)], "completed", false, "opponent"),
  match("2026-06-16", "ATP Challenger", "clay", "Daniel Rinkon", [set(6, 7, 5, 7), set(6, 7, 5, 7)], "completed", true, "opponent"),
  match("2026-06-11", "France Lyon", "clay", "Feliks Balšaw", [set(6, 4), set(1, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-09", "France Lyon", "clay", "Svjatoslav Gulin", [set(7, 5), set(6, 1)], "completed", true, "player"),
  match("2026-06-03", "ATP Challenger Heilbronn", "clay", "Henri Svitsire", [set(6, 7, 4, 7), set(4, 6)], "completed", false, "opponent"),
  match("2026-06-01", "ATP Challenger Heilbronn", "clay", "Frederiko Ferreira Silva", [set(6, 2), set(7, 5)], "completed", false, "player"),
  match("2026-05-22", "Roland-Garros", "clay", "Emilio Nava", [set(3, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-05-20", "Roland-Garros", "clay", "Arsur Feri", [set(7, 6, 7, 3), set(4, 6), set(6, 3)], "completed", false, "player"),
  match("2026-05-19", "Roland-Garros", "clay", "Rei Sakamoto", [set(6, 2), set(7, 5)], "completed", false, "player"),
  match("2026-05-13", "ATP Challenger Turin", "clay", "Roberto Bautista-Agut", [set(3, 6), set(1, 6)], "completed", false, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Sara Bežlek (Semifinal).
 * Todos los sets están orientados a Bežlek, incluso cuando aparece abajo.
 */
export const BEJLEK_CINCINNATI_SF_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-21", "USA Cincinnati", "hard", "Madison Keis", [set(3, 6), set(6, 4), set(7, 6, 7, 5)], "completed", true, "player"),
  match("2026-08-19", "USA Cincinnati", "hard", "Arina Sabalenka", [set(7, 6, 9, 7), set(6, 4)], "completed", false, "player"),
  match("2026-08-18", "USA Cincinnati", "hard", "Ekaterina Aleksandrova", [set(4, 6), set(6, 1), set(6, 2)], "completed", true, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Barbora Krežcikova", [set(7, 6, 7, 5), set(6, 4)], "completed", false, "player"),
  match("2026-08-14", "USA Cincinnati", "hard", "Karolina Pliskova", [set(6, 0), set(6, 2)], "completed", true, "player"),
  match("2026-08-04", "Canada Toronto", "hard", "Iga Swiatek", [set(0, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-08-02", "Canada Toronto", "hard", "Ksiu Wang", [set(6, 3), set(4, 6), set(7, 5)], "completed", false, "player"),
  match("2026-07-24", "Czech Republic", "clay", "Lilli Tagger", [set(3, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-23", "Czech Republic", "clay", "Maria Timofiva", [set(6, 1), set(6, 1)], "completed", false, "player"),
  match("2026-07-21", "Czech Republic", "clay", "Anna Blinkova", [set(7, 6, 11, 9), set(3, 6), set(6, 1)], "completed", false, "player"),
  match("2026-07-17", "WTA Athens", "clay", "clara Tauson", [set(2, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-07-15", "WTA Athens", "clay", "Lilli Tagger", [set(6, 2), set(6, 2)], "completed", false, "player"),
  match("2026-07-13", "WTA Athens", "clay", "Viktoria Morvajöva", [set(6, 0), set(7, 5)], "completed", false, "player"),
  match("2026-06-30", "Wimbledon", "grass", "Sorana Cirsti", [set(1, 6), set(6, 7, 6, 8)], "completed", false, "opponent"),
  match("2026-06-24", "Great Britain", "grass", "Zeinep Sonmez", [], "walkover", false, "opponent"),
  match("2026-06-23", "Great Britain", "grass", "Laura Siegemund", [set(3, 6), set(7, 6, 7, 2), set(7, 6, 7, 3)], "completed", true, "player"),
  match("2026-06-16", "Great Britain", "grass", "Karolina Pliskova", [set(6, 2), set(6, 7, 3, 7), set(2, 6)], "completed", true, "opponent"),
  match("2026-06-09", "WTA S-Hertogenbosch", "grass", "Dajana Jastremska", [set(1, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-27", "Roland-Garros", "clay", "Iga Swiatek", [set(2, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-05-24", "Roland-Garros", "clay", "Sloane Stefens", [set(6, 3), set(6, 2)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Kori Gauff (Semifinal).
 * Todos los sets están orientados a Gauff, incluso cuando aparece abajo.
 */
export const GAUFF_CINCINNATI_SF_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-21", "USA Cincinnati", "hard", "Marta Kostjuk", [set(6, 2), set(6, 2)], "completed", true, "player"),
  match("2026-08-19", "USA Cincinnati", "hard", "Marie Bauzkova", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-08-18", "USA Cincinnati", "hard", "Ann Li", [set(6, 1), set(7, 6, 7, 3)], "completed", true, "player"),
  match("2026-08-16", "USA Cincinnati", "hard", "Ludmilla Samsonova", [set(2, 6), set(6, 4), set(6, 1)], "completed", true, "player"),
  match("2026-08-12", "Canada Toronto", "hard", "Elena Ribakina", [set(7, 5), set(2, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-08-11", "Canada Toronto", "hard", "Belinda Bencic", [], "walkover", false, "player"),
  match("2026-08-09", "Canada Toronto", "hard", "Alina Korniva", [set(6, 3), set(6, 1)], "completed", false, "player"),
  match("2026-08-07", "Canada Toronto", "hard", "Maria Sakkari", [set(6, 1), set(6, 4)], "completed", false, "player"),
  match("2026-08-05", "Canada Toronto", "hard", "Kaila Dai", [set(6, 2), set(7, 5)], "completed", false, "player"),
  match("2026-07-09", "Wimbledon", "grass", "Karolina Mutšova", [set(2, 6), set(6, 1), set(6, 7, 10, 12)], "completed", false, "opponent"),
  match("2026-07-07", "Wimbledon", "grass", "Žessika Pegula", [set(4, 6), set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-07-05", "Wimbledon", "grass", "Belinda Bencic", [set(4, 6), set(6, 3), set(6, 4)], "completed", false, "player"),
  match("2026-07-03", "Wimbledon", "grass", "claire", [set(6, 3), set(6, 7, 5, 7), set(6, 2)], "completed", false, "player"),
  match("2026-07-01", "Wimbledon", "grass", "Solana Sierra", [set(6, 3), set(3, 6), set(7, 6, 10, 7)], "completed", false, "player"),
  match("2026-06-29", "Wimbledon", "grass", "Tamara Korpatstš", [set(6, 2), set(6, 1)], "completed", false, "player"),
  match("2026-06-17", "Berlin", "grass", "Paula Badosa", [set(6, 1), set(3, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-30", "Roland-Garros", "clay", "Anastasia Potapova", [set(6, 4), set(6, 7, 1, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-28", "Roland-Garros", "clay", "Majar Šerif", [set(6, 3), set(6, 2)], "completed", true, "player"),
  match("2026-05-26", "Roland-Garros", "clay", "Tailor Townsend", [set(6, 4), set(6, 0)], "completed", true, "player"),
  match("2026-05-16", "ROM", "clay", "Elina Svitolina", [set(4, 6), set(7, 6, 7, 3), set(2, 6)], "completed", true, "opponent"),
];

/**
 * Transcripción de las 20 filas de las capturas de Rinki Hižikata.
 * Todos los sets están orientados a Hižikata, incluso cuando aparece abajo.
 */
export const HIJIKATA_WINSTON_SALEM_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-17", "USA Cincinnati", "hard", "Žakub Mensik", [set(3, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-08-15", "USA Cincinnati", "hard", "Luciano Darderi", [set(6, 4), set(6, 2)], "completed", false, "player"),
  match("2026-08-13", "USA Cincinnati", "hard", "Gael Monfils", [set(2, 6), set(7, 6, 7, 5), set(6, 3)], "completed", true, "player"),
  match("2026-08-02", "Canada Montreal", "hard", "Žaume Antoni Munar clar", [set(6, 7), set(3, 6)], "completed", false, "opponent"),
  match("2026-07-28", "Mexico Los Cabos", "hard", "Denis Sapovalov", [set(6, 2), set(3, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-06-29", "Wimbledon", "grass", "Žesper De Žong", [set(6, 7, 4, 7), set(6, 3), set(7, 5), set(4, 6), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-19", "Great Britain", "grass", "Ugo Humbert", [set(1, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-06-18", "Great Britain", "grass", "Žiri Lehecka", [set(4, 6), set(7, 5), set(7, 6, 9, 7)], "completed", true, "player"),
  match("2026-06-16", "Great Britain", "grass", "Aležandro Tabilo", [set(6, 2), set(6, 4)], "completed", true, "player"),
  match("2026-06-14", "Great Britain", "grass", "Markos Giron", [set(7, 5), set(6, 7, 4, 7), set(6, 1)], "completed", true, "player"),
  match("2026-06-13", "Great Britain", "grass", "Dino Prizmic", [set(4, 6), set(6, 4), set(7, 5)], "completed", false, "player"),
  match("2026-06-11", "Stuttgart", "grass", "Francis Tiafoe", [set(4, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-09", "Stuttgart", "grass", "Tom Gentzš", [set(6, 7, 7, 9), set(7, 6, 7, 2), set(6, 3)], "completed", false, "player"),
  match("2026-06-05", "Surbiton", "grass", "Arsur Feri", [set(6, 7, 7, 9), set(3, 6)], "completed", false, "opponent"),
  match("2026-06-04", "Surbiton", "grass", "Mackenzie Mcdonald", [set(6, 3), set(7, 6, 7, 5)], "completed", false, "player"),
  match("2026-06-02", "Surbiton", "grass", "Žakob Firnlei", [set(6, 1), set(7, 6, 7, 3)], "completed", false, "player"),
  match("2026-05-25", "Roland-Garros", "clay", "Tommi Paul", [set(6, 4), set(3, 6), set(5, 7), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-18", "ATP Hamburg", "clay", "Daniel Altmaier", [set(5, 7), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-17", "ATP Hamburg", "clay", "Henri Svitsire", [set(6, 7, 4, 7), set(7, 5), set(7, 6, 7, 5)], "completed", true, "player"),
  match("2026-05-16", "ATP Hamburg", "clay", "Taro Daniel", [set(6, 3), set(6, 7, 3, 7), set(6, 2)], "completed", true, "player"),
];

/**
 * Transcripción de las 20 filas de las capturas de Darwin Blantš.
 * Todos los sets están orientados a Blantš, incluso cuando aparece abajo.
 */
export const BLANCH_WINSTON_SALEM_HISTORY: TennisHistoryMatch[] = [
  match("2026-08-19", "USA Cincinnati", "hard", "Lloid Harris", [set(4, 6), set(2, 6)], "completed", true, "opponent"),
  match("2026-08-12", "USA Cincinnati", "hard", "Aleksandar Vukic", [set(3, 6), set(6, 7, 4, 7)], "completed", false, "opponent"),
  match("2026-07-27", "Mexico Los Cabos", "hard", "Tšak Lam Koleman Wong", [set(3, 6), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-21", "USA", "hard", "Mark Lažal", [set(4, 6), set(7, 5), set(4, 6)], "completed", false, "opponent"),
  match("2026-07-14", "USA", "hard", "Bernard Tomic", [set(4, 6), set(7, 6, 9, 7), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-10", "Great Britain", "grass", "Žakob Firnlei", [set(3, 6), set(3, 6)], "completed", true, "opponent"),
  match("2026-07-09", "Great Britain", "grass", "Garrett Žohns", [set(5, 7), set(6, 3), set(6, 3)], "completed", false, "player"),
  match("2026-07-08", "Great Britain", "grass", "Murfi Kassüan", [set(6, 4), set(1, 6), set(6, 3)], "completed", false, "player"),
  match("2026-06-24", "Wimbledon", "grass", "Dane Swini", [set(6, 2), set(6, 7, 7, 9), set(0, 4)], "retired", false, "opponent"),
  match("2026-06-22", "Wimbledon", "grass", "Filip cristian Žianu", [set(7, 6, 7, 1), set(6, 4)], "completed", true, "player"),
  match("2026-06-15", "Great Britain", "grass", "Žizhen Žang", [set(4, 6), set(7, 6, 10, 8), set(4, 6)], "completed", true, "opponent"),
  match("2026-06-13", "Great Britain", "grass", "Žakob Firnlei", [set(6, 7, 4, 7), set(6, 7, 6, 8)], "completed", true, "opponent"),
  match("2026-06-12", "Great Britain", "grass", "Henrivitse Rotša", [set(7, 6, 7, 4), set(1, 6), set(6, 3)], "completed", false, "player"),
  match("2026-06-09", "Great Britain", "grass", "Tšristofer O'Konnell", [set(7, 6, 7, 4), set(4, 6), set(6, 3)], "completed", true, "player"),
  match("2026-05-22", "Roland-Garros", "clay", "Luka Pavlovic", [set(2, 6), set(4, 6)], "completed", true, "opponent"),
  match("2026-05-20", "Roland-Garros", "clay", "Tristan Šulkate", [set(6, 4), set(6, 4)], "completed", false, "player"),
  match("2026-05-19", "Roland-Garros", "clay", "Timofei Skatov", [set(6, 1), set(6, 2)], "completed", true, "player"),
  match("2026-05-11", "Great Britain", "clay", "Zack Pinnington Žüans", [set(3, 6), set(7, 6, 7, 4), set(5, 7)], "completed", true, "opponent"),
  match("2026-05-02", "ATP Challenger", "clay", "Žaime Faria", [set(3, 6), set(2, 6)], "completed", false, "opponent"),
  match("2026-05-01", "ATP Challenger", "clay", "Matsew William Donald", [set(6, 3), set(6, 4)], "completed", true, "player"),
];

const RAW_TENNIS_EVENTS: TennisStoredEvent[] = [
  {
    id: "atp-cincinnati-2026-rublev-borges",
    status: "completed",
    input: {
      id: "atp-cincinnati-2026-rublev-borges",
      tournament: "ATP Cincinnati, EEUU Individual Masculino",
      date: "2026-08-18",
      time: "10:00",
      round: "1/16 de final (Round of 32)",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Andrei Rublev", ranking: 18, matches: RUBLEV_CINCINNATI_HISTORY },
      player2: { name: "Nuno Borges", ranking: 47, matches: BORGES_CINCINNATI_HISTORY },
    },
    actualResult: {
      winner: "Nuno Borges",
      sets: [set(3, 6), set(4, 6)],
      source: "https://www.atptour.com/en/scores/current/cincinnati/422/results",
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-atp-cincinnati-usa-men-singles",
      "https://scores24.live/es/tennis/t-rublev-andrey",
      "https://scores24.live/es/tennis/t-borges-nuno",
      "https://www.atptour.com/en/scores/current/cincinnati/422/results",
    ],
    note: "Los 20 antecedentes de cada jugador son anteriores al partido. El resultado oficial está guardado aparte y no entra al cálculo prepartido.",
  },
  {
    id: "atp-cincinnati-2026-nakashima-medvedev",
    status: "scheduled",
    input: {
      id: "atp-cincinnati-2026-nakashima-medvedev",
      tournament: "ATP Cincinnati, EEUU Indiv. Masc.",
      date: "2026-08-18",
      time: "13:30",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Brandon Nakašima", matches: NAKASHIMA_CINCINNATI_HISTORY },
      player2: { name: "Daniil Medvedev", matches: MEDVEDEV_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-atp-cincinnati-usa-men-singles",
      "https://scores24.live/es/tennis/t-nakashima-brandon",
      "https://scores24.live/es/tennis/t-medvedev-daniil",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-challenger-kingston-2026-willwerth-bueno",
    status: "scheduled",
    input: {
      id: "atp-challenger-kingston-2026-willwerth-bueno",
      tournament: "ATP Challenger Kingston, Jamaica Men Singles",
      date: "2026-08-18",
      time: "14:50",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Willwerth, Benjamin", matches: WILLWERTH_KINGSTON_HISTORY },
      player2: { name: "Gonzalo Bueno", matches: BUENO_KINGSTON_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-kingston-jamaica-men-singles",
      "https://scores24.live/es/tennis/t-willwerth-benjamin",
      "https://scores24.live/es/tennis/t-gonzalo-bueno",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cincinnati-2026-faria-walton",
    status: "scheduled",
    input: {
      id: "atp-cincinnati-2026-faria-walton",
      tournament: "ATP Cincinnati, EEUU Indiv. Masc.",
      date: "2026-08-18",
      time: "16:05",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Žaime Faria", matches: FARIA_CINCINNATI_HISTORY },
      player2: { name: "Adam Walton", matches: WALTON_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-atp-cincinnati-usa-men-singles",
      "https://scores24.live/es/tennis/t-faria-jaime-1",
      "https://scores24.live/es/tennis/t-walton-adam",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-challenger-quebec-2026-dejong-sweeny",
    status: "scheduled",
    input: {
      id: "atp-challenger-quebec-2026-dejong-sweeny",
      tournament: "ATP Challenger Quebec City, Canada Men Singles",
      date: "2026-08-18",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Žesper De Žong", matches: DE_JONG_QUEBEC_HISTORY },
      player2: { name: "Dane Swini", matches: SWEENY_QUEBEC_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-quebec-city-canada-men-singles",
      "https://scores24.live/es/tennis/t-de-jong-jesper",
      "https://scores24.live/es/tennis/t-sweeny-dane",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cincinnati-2026-cerundolo-aliassime",
    status: "scheduled",
    input: {
      id: "atp-cincinnati-2026-cerundolo-aliassime",
      tournament: "ATP Cincinnati, EEUU Indiv. Masc.",
      date: "2026-08-18",
      time: "18:00",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Žuan Manuel Serundolo", matches: CERUNDOLO_CINCINNATI_HISTORY },
      player2: { name: "Feliks Auger-Aliassime", matches: ALIASSSIME_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-atp-cincinnati-usa-men-singles",
      "https://scores24.live/es/tennis/t-cerundolo-juan-manuel",
      "https://scores24.live/es/tennis/t-auger-aliassime-felix",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-challenger-quebec-2026-maestrelli-popyrin",
    status: "scheduled",
    input: {
      id: "atp-challenger-quebec-2026-maestrelli-popyrin",
      tournament: "ATP Challenger Quebec City, Canada Men Singles",
      date: "2026-08-18",
      time: "17:30",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Fransesko Maestrelli", matches: MAESTRELLI_QUEBEC_HISTORY },
      player2: { name: "Aleksei Popirin", matches: POPYRIN_QUEBEC_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-quebec-city-canada-men-singles",
      "https://scores24.live/es/tennis/t-maestrelli-francesco",
      "https://scores24.live/es/tennis/t-popyrin-alexei",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-challenger-quebec-2026-bonzi-boulais",
    status: "scheduled",
    input: {
      id: "atp-challenger-quebec-2026-bonzi-boulais",
      tournament: "ATP Challenger Quebec City, Canada Men Singles",
      date: "2026-08-18",
      time: "18:40",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Benžamin Bonzi", matches: BONZI_QUEBEC_HISTORY },
      player2: { name: "Žustin Baulais", matches: BOULAIS_QUEBEC_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-quebec-city-canada-men-singles",
      "https://scores24.live/es/tennis/t-bonzi-benjamin",
      "https://scores24.live/es/tennis/t-boulais-justin",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-challenger-kingston-2026-schwarzler-miyoshi",
    status: "scheduled",
    input: {
      id: "atp-challenger-kingston-2026-schwarzler-miyoshi",
      tournament: "ATP Challenger Kingston, Jamaica Men Singles",
      date: "2026-08-18",
      time: "17:45",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Žoel Žosef Šwarzler", matches: SCHWARZLER_KINGSTON_HISTORY },
      player2: { name: "Kenta Miioši", matches: MIYOSHI_KINGSTON_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-kingston-jamaica-men-singles",
      "https://scores24.live/es/tennis/t-joel-josef-schwarzler",
      "https://scores24.live/es/tennis/t-miyoshi-kenta",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "wta-cincinnati-2026-sabalenka-wang",
    status: "scheduled",
    input: {
      id: "wta-cincinnati-2026-sabalenka-wang",
      tournament: "WTA Cincinnati, EEUU Indiv. Fem.",
      date: "2026-08-18",
      time: "18:00",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Arina Sabalenka", matches: SABALENKA_CINCINNATI_HISTORY },
      player2: { name: "Ksinju Wang", matches: XINYU_WANG_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-wta-wta-cincinnati-usa-women-singles",
      "https://scores24.live/es/tennis/t-aryna-sabalenka",
      "https://scores24.live/es/tennis/t-wang-xin-yu",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugadora.",
  },
  {
    id: "atp-cincinnati-2026-jodar-cobolli",
    status: "scheduled",
    input: {
      id: "atp-cincinnati-2026-jodar-cobolli",
      tournament: "ATP Cincinnati, EEUU Indiv. Masc.",
      date: "2026-08-19",
      time: "10:00",
      round: "1/8",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Rafael Žodar", matches: JODAR_CINCINNATI_HISTORY },
      player2: { name: "Flavio Kobolli", matches: COBOLLI_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-atp-cincinnati-usa-men-singles",
      "https://scores24.live/es/tennis/t-jodar-rafael",
      "https://scores24.live/es/tennis/t-flavio-cobolli-4",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cincinnati-2026-tirante-mensik",
    status: "scheduled",
    input: {
      id: "atp-cincinnati-2026-tirante-mensik",
      tournament: "ATP Cincinnati, EEUU Indiv. Masc.",
      date: "2026-08-19",
      time: "11:10",
      round: "1/8",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Siago Agustin Tirante", matches: TIRANTE_CINCINNATI_HISTORY },
      player2: { name: "Žakub Mensik", matches: MENSIK_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-atp-cincinnati-usa-men-singles",
      "https://scores24.live/es/tennis/t-tirante-thiago-agustin",
      "https://scores24.live/es/tennis/t-mensik-jakub-1",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cincinnati-2026-zverev-paul",
    status: "scheduled",
    input: {
      id: "atp-cincinnati-2026-zverev-paul",
      tournament: "ATP Cincinnati, EEUU Indiv. Masc.",
      date: "2026-08-19",
      time: "12:00",
      round: "1/8",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Aleksander Zverev", matches: ZVEREV_CINCINNATI_HISTORY },
      player2: { name: "Tommi Paul", matches: PAUL_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-atp-cincinnati-usa-men-singles",
      "https://scores24.live/es/tennis/t-alexander-zverev",
      "https://scores24.live/es/tennis/t-paul-tommy",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cincinnati-2026-fils-de-minaur",
    status: "scheduled",
    input: {
      id: "atp-cincinnati-2026-fils-de-minaur",
      tournament: "ATP Cincinnati, EEUU Indiv. Masc.",
      date: "2026-08-19",
      time: "12:20",
      round: "1/8",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Arsur Fils", matches: FILS_CINCINNATI_HISTORY },
      player2: { name: "Aleks De Minaur", matches: DE_MINAUR_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-atp-cincinnati-usa-men-singles",
      "https://scores24.live/es/tennis/t-fils-arthur-1",
      "https://scores24.live/es/tennis/t-de-minaur-alex",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "wta-cincinnati-2026-swiatek-parry",
    status: "scheduled",
    input: {
      id: "wta-cincinnati-2026-swiatek-parry",
      tournament: "WTA Cincinnati, EEUU Indiv. Fem.",
      date: "2026-08-19",
      time: "10:00",
      round: "1/8",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Iga Swiatek", matches: SWIATEK_CINCINNATI_HISTORY },
      player2: { name: "Diane Parri", matches: PARRY_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-wta-wta-cincinnati-usa-women-singles",
      "https://scores24.live/es/tennis/t-swiatek-iga",
      "https://scores24.live/es/tennis/t-parry-diane",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugadora.",
  },
  {
    id: "wta-cincinnati-2026-cirstea-pegula",
    status: "scheduled",
    input: {
      id: "wta-cincinnati-2026-cirstea-pegula",
      tournament: "WTA Cincinnati, EEUU Indiv. Fem.",
      date: "2026-08-19",
      time: "11:10",
      round: "1/8",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Sorana Cirsti", matches: CIRSTEA_CINCINNATI_HISTORY },
      player2: { name: "Žessika Pegula", matches: PEGULA_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-wta-wta-cincinnati-usa-women-singles",
      "https://scores24.live/es/tennis/t-cirstea-sorana",
      "https://scores24.live/es/tennis/t-pegula-jessica",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugadora.",
  },
  {
    id: "wta-cincinnati-2026-shnaider-rybakina",
    status: "scheduled",
    input: {
      id: "wta-cincinnati-2026-shnaider-rybakina",
      tournament: "WTA Cincinnati, EEUU Indiv. Fem.",
      date: "2026-08-19",
      time: "13:00",
      round: "1/8",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Diana Šnaider", matches: SHNAIDER_CINCINNATI_HISTORY },
      player2: { name: "Elena Ribakina", matches: RYBAKINA_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-wta-wta-cincinnati-usa-women-singles",
      "https://scores24.live/es/tennis/t-diana-shnaider",
      "https://scores24.live/es/tennis/t-rybakina-elena",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugadora.",
  },
  {
    id: "wta-cincinnati-2026-noskova-anisimova",
    status: "scheduled",
    input: {
      id: "wta-cincinnati-2026-noskova-anisimova",
      tournament: "WTA Cincinnati, EEUU Indiv. Fem.",
      date: "2026-08-19",
      time: "13:10",
      round: "1/8",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Linda Noskova", matches: NOSKOVA_CINCINNATI_HISTORY },
      player2: { name: "Amanda Anisimova", matches: ANISIMOVA_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-wta-wta-cincinnati-usa-women-singles",
      "https://scores24.live/es/tennis/t-linda-noskova",
      "https://scores24.live/es/tennis/t-anisimova-amanda",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugadora.",
  },
  {
    id: "atp-challenger-quebec-2026-sakellaridis-blanchet",
    status: "scheduled",
    input: {
      id: "atp-challenger-quebec-2026-sakellaridis-blanchet",
      tournament: "ATP Challenger Quebec City, Canada Men Singles",
      date: "2026-08-19",
      time: "11:30",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Stefanos Sakellaridis", matches: SAKELLARIDIS_QUEBEC_HISTORY },
      player2: { name: "Ugo Blantšet", matches: BLANCHET_QUEBEC_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-quebec-city-canada-men-singles",
      "https://scores24.live/es/tennis/t-sakellaridis-stefanos-1",
      "https://scores24.live/es/tennis/t-blanchet-ugo",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-challenger-quebec-2026-chan-daniel",
    status: "scheduled",
    input: {
      id: "atp-challenger-quebec-2026-chan-daniel",
      tournament: "ATP Challenger Quebec City, Canada Men Singles",
      date: "2026-08-19",
      time: "11:30",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Dunkan Tšan", matches: CHAN_QUEBEC_HISTORY },
      player2: { name: "Taro Daniel", matches: DANIEL_QUEBEC_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-quebec-city-canada-men-singles",
      "https://scores24.live/es/tennis/t-duncan-chan",
      "https://scores24.live/es/tennis/t-daniel-taro",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-challenger-quebec-2026-jacquet-vukic",
    status: "scheduled",
    input: {
      id: "atp-challenger-quebec-2026-jacquet-vukic",
      tournament: "ATP Challenger Quebec City, Canada Men Singles",
      date: "2026-08-19",
      time: "12:40",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Kirian Žacvitset", matches: JACQUET_QUEBEC_HISTORY },
      player2: { name: "Aleksandar Vukic", matches: VUKIC_QUEBEC_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-quebec-city-canada-men-singles",
      "https://scores24.live/es/tennis/t-kyrian-jacquet",
      "https://scores24.live/es/tennis/t-vukic-aleksandar",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-challenger-quebec-2026-kwon-mochizuki",
    status: "scheduled",
    input: {
      id: "atp-challenger-quebec-2026-kwon-mochizuki",
      tournament: "ATP Challenger Quebec City, Canada Men Singles",
      date: "2026-08-19",
      time: "12:40",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Soon Woo Kwon", matches: KWON_QUEBEC_HISTORY },
      player2: { name: "Šintaro Motšizuki", matches: MOCHIZUKI_QUEBEC_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-quebec-city-canada-men-singles",
      "https://scores24.live/es/tennis/t-kwon-soon-woo",
      "https://scores24.live/es/tennis/t-shintaro-mochizuki",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cincinnati-2026-faria-musetti",
    status: "scheduled",
    input: {
      id: "atp-cincinnati-2026-faria-musetti",
      tournament: "ATP Cincinnati, EEUU Indiv. Masc.",
      date: "2026-08-19",
      time: "15:20",
      round: "1/8",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Žaime Faria", matches: FARIA_CINCINNATI_R8_HISTORY },
      player2: { name: "Lorenzo Musetti", matches: MUSETTI_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-atp-cincinnati-usa-men-singles",
      "https://scores24.live/es/tennis/t-faria-jaime-1",
      "https://scores24.live/es/tennis/t-musetti-lorenzo",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cincinnati-2026-fritz-oconnell",
    status: "scheduled",
    input: {
      id: "atp-cincinnati-2026-fritz-oconnell",
      tournament: "ATP Cincinnati, EEUU Indiv. Masc.",
      date: "2026-08-19",
      time: "18:00",
      round: "1/8",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Tailor Fritz", matches: FRITZ_CINCINNATI_HISTORY },
      player2: { name: "Tšristofer O'Konnell", matches: OCONNELL_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-atp-cincinnati-usa-men-singles",
      "https://scores24.live/es/tennis/t-taylor-fritz",
      "https://scores24.live/es/tennis/t-o-connell-christopher",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cincinnati-2026-tiafoe-aliassime",
    status: "scheduled",
    input: {
      id: "atp-cincinnati-2026-tiafoe-aliassime",
      tournament: "ATP Cincinnati, EEUU Indiv. Masc.",
      date: "2026-08-19",
      time: "19:10",
      round: "1/8",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Francis Tiafoe", matches: TIAFOE_CINCINNATI_HISTORY },
      player2: { name: "Feliks Auger-Aliassime", matches: ALIASSIME_CINCINNATI_R8_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-atp-cincinnati-usa-men-singles",
      "https://scores24.live/es/tennis/t-tiafoe-francis",
      "https://scores24.live/es/tennis/t-auger-aliassime-felix",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "wta-cincinnati-2026-gauff-bouzkova",
    status: "scheduled",
    input: {
      id: "wta-cincinnati-2026-gauff-bouzkova",
      tournament: "WTA Cincinnati, EEUU Indiv. Fem.",
      date: "2026-08-19",
      time: "14:00",
      round: "1/8",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Kori Gauff", matches: GAUFF_CINCINNATI_HISTORY },
      player2: { name: "Marie Bauzkova", matches: BOUZKOVA_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-wta-wta-cincinnati-usa-women-singles",
      "https://scores24.live/es/tennis/t-gauff-cori",
      "https://scores24.live/es/tennis/t-marie-bouzkova",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "wta-cincinnati-2026-keys-wang",
    status: "scheduled",
    input: {
      id: "wta-cincinnati-2026-keys-wang",
      tournament: "WTA Cincinnati, EEUU Indiv. Fem.",
      date: "2026-08-19",
      time: "18:00",
      round: "1/8",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Madison Keis", matches: KEYS_CINCINNATI_HISTORY },
      player2: { name: "Ksiiu Wang", matches: XIYU_WANG_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-wta-wta-cincinnati-usa-women-singles",
      "https://scores24.live/es/tennis/t-keys-madison",
      "https://scores24.live/es/tennis/t-wang-xiyu",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "wta-cincinnati-2026-sabalenka-bejlek",
    status: "scheduled",
    input: {
      id: "wta-cincinnati-2026-sabalenka-bejlek",
      tournament: "WTA Cincinnati, EEUU Indiv. Fem.",
      date: "2026-08-19",
      time: "19:30",
      round: "1/8",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Arina Sabalenka", matches: SABALENKA_CINCINNATI_R8_HISTORY },
      player2: { name: "Sara Bežlek", matches: BEJLEK_CINCINNATI_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-wta-wta-cincinnati-usa-women-singles",
      "https://scores24.live/es/tennis/t-aryna-sabalenka",
      "https://scores24.live/es/tennis/t-bejlek-sara-1",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-quebec-2026-galarneau-prizmic",
    status: "scheduled",
    input: {
      id: "atp-quebec-2026-galarneau-prizmic",
      tournament: "ATP Challenger Quebec City, Canada Men Singles",
      date: "2026-08-19",
      time: "17:30",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Aleksis Galarniu", matches: GALARNEAU_QUEBEC_HISTORY },
      player2: { name: "Dino Prizmic", matches: PRIZMIC_QUEBEC_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-quebec-city-canada-men-singles",
      "https://scores24.live/es/tennis/t-galarneau-alexis",
      "https://scores24.live/es/tennis/t-prizmic-dino-1",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-quebec-2026-fearnley-mcdonald",
    status: "scheduled",
    input: {
      id: "atp-quebec-2026-fearnley-mcdonald",
      tournament: "ATP Challenger Quebec City, Canada Men Singles",
      date: "2026-08-19",
      time: "18:40",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Žakob Firnlei", matches: FEARNLEY_QUEBEC_HISTORY },
      player2: { name: "Mackenzie Mcdonald", matches: MCDONALD_QUEBEC_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-quebec-city-canada-men-singles",
      "https://scores24.live/es/tennis/t-jacob-fearnley-1",
      "https://scores24.live/es/tennis/t-mackenzie-mcdonald",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cancun-2026-muller-wong",
    status: "scheduled",
    input: {
      id: "atp-cancun-2026-muller-wong",
      tournament: "Challenger Cancun",
      date: "2026-08-19",
      time: "15:00",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Aleksandre Muller", matches: MULLER_CANCUN_HISTORY },
      player2: { name: "Tšak Lam Koleman Wong", matches: COLEMAN_WONG_CANCUN_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-cancun-mexico-men-singles-1",
      "https://scores24.live/es/tennis/t-muller-alexandre",
      "https://scores24.live/es/tennis/t-chak-lam-coleman-wong",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cancun-2026-virtanen-echargui",
    status: "scheduled",
    input: {
      id: "atp-cancun-2026-virtanen-echargui",
      tournament: "Challenger Cancun",
      date: "2026-08-19",
      time: "15:00",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Otto Virtanen", matches: VIRTANEN_CANCUN_HISTORY },
      player2: { name: "Moez Etšargui", matches: ECHARGUI_CANCUN_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-cancun-mexico-men-singles-1",
      "https://scores24.live/es/tennis/t-virtanen-otto",
      "https://scores24.live/es/tennis/t-echargui-moez",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cancun-2026-pacheco-barrios-vera",
    status: "scheduled",
    input: {
      id: "atp-cancun-2026-pacheco-barrios-vera",
      tournament: "Challenger Cancun",
      date: "2026-08-19",
      time: "16:10",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Rodrigo Patšeko Mendez", matches: PACHECO_CANCUN_HISTORY },
      player2: { name: "Marselo Tomas Barrios Vera", matches: BARRIOS_VERA_CANCUN_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-cancun-mexico-men-singles-1",
      "https://scores24.live/es/tennis/t-rodrigo-pacheco-mendez",
      "https://scores24.live/es/tennis/t-marcelo-tomas-barrios-vera",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cancun-2026-ugo-carabelli-mejia",
    status: "scheduled",
    input: {
      id: "atp-cancun-2026-ugo-carabelli-mejia",
      tournament: "Challenger Cancun",
      date: "2026-08-19",
      time: "16:10",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Kamilo Ugo Karabelli", matches: UGO_CARABELLI_CANCUN_HISTORY },
      player2: { name: "Nikolas Mežia", matches: MEJIA_CANCUN_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-cancun-mexico-men-singles-1",
      "https://scores24.live/es/tennis/t-ugo-carabelli-camilo",
      "https://scores24.live/es/tennis/t-mejia-nicolas",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cancun-2026-onclin-skatov",
    status: "scheduled",
    input: {
      id: "atp-cancun-2026-onclin-skatov",
      tournament: "Challenger Cancun",
      date: "2026-08-19",
      time: "16:10",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Gausier Onclin", matches: ONCLIN_CANCUN_HISTORY },
      player2: { name: "Timofei Skatov", matches: SKATOV_CANCUN_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-cancun-mexico-men-singles-1",
      "https://scores24.live/es/tennis/t-onclin-gauthier",
      "https://scores24.live/es/tennis/t-skatov-timofey",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cancun-2026-blanch-harris",
    status: "scheduled",
    input: {
      id: "atp-cancun-2026-blanch-harris",
      tournament: "Challenger Cancun",
      date: "2026-08-19",
      time: "17:20",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Darwin Blantš", matches: BLANCH_CANCUN_HISTORY },
      player2: { name: "Lloid Harris", matches: LLOYD_HARRIS_CANCUN_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-cancun-mexico-men-singles-1",
      "https://scores24.live/es/tennis/t-blanch-darwin-2",
      "https://scores24.live/es/tennis/t-harris-lloyd-george-muirhead",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cancun-2026-alves-kouame",
    status: "scheduled",
    input: {
      id: "atp-cancun-2026-alves-kouame",
      tournament: "Challenger Cancun",
      date: "2026-08-19",
      time: "17:20",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Felipe Alves", matches: ALVES_CANCUN_HISTORY },
      player2: { name: "Moise Kouame", matches: KOUAME_CANCUN_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-cancun-mexico-men-singles-1",
      "https://scores24.live/es/tennis/t-alves-felipe-1",
      "https://scores24.live/es/tennis/t-kouame-moise-1",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cancun-2026-magadan-nakagawa",
    status: "scheduled",
    input: {
      id: "atp-cancun-2026-magadan-nakagawa",
      tournament: "Challenger Cancun",
      date: "2026-08-19",
      time: "17:20",
      round: "1/16",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Alan Magadan", matches: MAGADAN_CANCUN_HISTORY },
      player2: { name: "Nakagawa, Naoki", matches: NAKAGAWA_CANCUN_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-cancun-mexico-men-singles-1",
      "https://scores24.live/es/tennis/t-alan-magadan-4",
      "https://scores24.live/es/tennis/t-hernandez-serrano-juan-alejandro",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cancun-2026-rocha-hurkacz",
    status: "scheduled",
    input: {
      id: "atp-cancun-2026-rocha-hurkacz",
      tournament: "Challenger Cancun",
      date: "2026-08-20",
      time: "16:00",
      round: "1/8",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Henrivitse Rotša", matches: ROCHA_CANCUN_HISTORY },
      player2: { name: "Hubert Hurkacz", matches: HURKACZ_CANCUN_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-cancun-mexico-men-singles-1",
      "https://scores24.live/es/tennis/t-rocha-henrique-1",
      "https://scores24.live/es/tennis/t-hurkacz-hubert",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-cancun-2026-kopriva-onclin",
    status: "scheduled",
    input: {
      id: "atp-cancun-2026-kopriva-onclin",
      tournament: "Challenger Cancun",
      date: "2026-08-20",
      time: "16:00",
      round: "1/8",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Vit Kopriva", matches: KOPRIVA_CANCUN_HISTORY },
      player2: { name: "Gausier Onclin", matches: ONCLIN_CANCUN_R8_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-cancun-mexico-men-singles-1",
      "https://scores24.live/es/tennis/t-vit-kopriva",
      "https://scores24.live/es/tennis/t-onclin-gauthier",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "atp-challenger-kingston-2026-prado-martinez",
    status: "scheduled",
    input: {
      id: "atp-challenger-kingston-2026-prado-martinez",
      tournament: "ATP Challenger Kingston, Jamaica Men Singles",
      date: "2026-08-20",
      time: "15:20",
      round: "Cuartos de final",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Žuan Karlos Prado Angelo", matches: PRADO_ANGELO_KINGSTON_HISTORY },
      player2: { name: "Pedro Martínez", matches: MARTINEZ_KINGSTON_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-challenger-kingston-jamaica-men-singles",
      "https://scores24.live/es/tennis/t-prado-angelo-juan-carlos-1",
      "https://scores24.live/es/tennis/t-martinez-portero-pedro",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
  {
    id: "wta-cincinnati-2026-bejlek-gauff",
    status: "scheduled",
    input: {
      id: "wta-cincinnati-2026-bejlek-gauff",
      tournament: "WTA Cincinnati, EEUU Indiv. Fem.",
      date: "2026-08-22",
      time: "20:15",
      round: "Semifinal",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Sara Bežlek", matches: BEJLEK_CINCINNATI_SF_HISTORY },
      player2: { name: "Kori Gauff", matches: GAUFF_CINCINNATI_SF_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-wta-wta-cincinnati-usa-women-singles",
      "https://scores24.live/es/tennis/t-bejlek-sara-1",
      "https://scores24.live/es/tennis/t-gauff-cori",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugadora.",
  },
  {
    id: "atp-winston-salem-2026-hijikata-blanch",
    status: "scheduled",
    input: {
      id: "atp-winston-salem-2026-hijikata-blanch",
      tournament: "ATP Winston-Salem, EEUU Indiv. Masc.",
      date: "2026-08-23",
      time: "19:10",
      round: "1/32",
      surface: "hard",
      bestOf: 3,
      player1: { name: "Rinki Hižikata", matches: HIJIKATA_WINSTON_SALEM_HISTORY },
      player2: { name: "Darwin Blantš", matches: BLANCH_WINSTON_SALEM_HISTORY },
    },
    sourceUrls: [
      "https://scores24.live/es/tennis/l-atp-atp-winston-salem-usa-men-singles",
      "https://scores24.live/es/tennis/t-hijikata-rinky",
      "https://scores24.live/es/tennis/t-blanch-darwin-2",
    ],
    note: "Transcripción exacta de 20 partidos oficiales por jugador.",
  },
];

export const tennisEvents: TennisStoredEvent[] = [...RAW_TENNIS_EVENTS].sort((a, b) => {
  const dateA = a.input.date ?? "";
  const dateB = b.input.date ?? "";
  const dateComp = dateA.localeCompare(dateB);
  if (dateComp !== 0) return dateComp;

  const timeA = a.input.time && a.input.time.trim() ? a.input.time.trim() : "99:99";
  const timeB = b.input.time && b.input.time.trim() ? b.input.time.trim() : "99:99";
  const timeComp = timeA.localeCompare(timeB);
  if (timeComp !== 0) return timeComp;

  const tournamentComp = (a.input.tournament ?? "").localeCompare(b.input.tournament ?? "");
  if (tournamentComp !== 0) return tournamentComp;

  const p1Comp = (a.input.player1?.name ?? "").localeCompare(b.input.player1?.name ?? "");
  if (p1Comp !== 0) return p1Comp;

  return a.id.localeCompare(b.id);
});

