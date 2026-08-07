/**
 * Deterministic pseudo-random generator used exclusively by the mock data
 * layer so the same seed always reproduces the same fixtures/statistics.
 * Swap the data/ + this file out entirely once a real stats API is wired up.
 */

export function createRng(seed: number) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return h;
}

export function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function randFloat(rng: () => number, min: number, max: number, decimals = 1): number {
  const value = rng() * (max - min) + min;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function chance(rng: () => number, probability: number): boolean {
  return rng() < probability;
}

export function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

export function shuffle<T>(rng: () => number, items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
