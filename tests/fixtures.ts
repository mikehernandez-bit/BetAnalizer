import { MATCH_PACKAGE_EXAMPLE } from "@/lib/match-package-prompt";
import type { MatchPackage } from "@/lib/validation/match-package";

/** Copia profunda del ejemplo oficial, lista para mutar en cada test sin afectar a otros. */
export function makeValidPackage(overrides: Partial<MatchPackage> = {}): MatchPackage {
  const clone = JSON.parse(JSON.stringify(MATCH_PACKAGE_EXAMPLE)) as MatchPackage;
  return { ...clone, ...overrides };
}

export function makeValidFilePayload(packages: MatchPackage[] = [makeValidPackage()]) {
  return { version: 1, packages };
}
