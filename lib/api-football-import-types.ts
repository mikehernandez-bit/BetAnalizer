import type { ImportedFile, MatchPackage } from "@/lib/validation/match-package";

export const API_FOOTBALL_TIMEZONE = "America/Lima";

export interface ApiFootballImportInput {
  homeTeam: string;
  awayTeam: string;
  date: string;
  time?: string;
  competition?: string;
  fixtureId?: number;
}

export interface ApiFootballProgress {
  step: string;
  completed: number;
  total: number;
  homeCompleted?: number;
  awayCompleted?: number;
}

export interface ApiFootballFixtureCandidate {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  country: string;
  date: string;
  time: string;
  status: string;
}

export interface ApiFootballMissingData {
  fixtureId?: number;
  team?: string;
  opponent?: string;
  date?: string;
  fields: string[];
}

export interface ApiFootballImportSummary {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  homeHistoryCount: number;
  awayHistoryCount: number;
  sourceCount: number;
}

export interface ApiFootballCompleteResult {
  kind: "complete";
  package: MatchPackage;
  file: ImportedFile;
  summary: ApiFootballImportSummary;
}

export interface ApiFootballAmbiguousResult {
  kind: "ambiguous";
  message: string;
  candidates: ApiFootballFixtureCandidate[];
}

export interface ApiFootballIncompleteResult {
  kind: "incomplete";
  message: string;
  issues: ApiFootballMissingData[];
  summary?: Partial<ApiFootballImportSummary>;
}

export interface ApiFootballErrorResult {
  kind: "error";
  message: string;
}

export type ApiFootballImportResult =
  | ApiFootballCompleteResult
  | ApiFootballAmbiguousResult
  | ApiFootballIncompleteResult
  | ApiFootballErrorResult;
