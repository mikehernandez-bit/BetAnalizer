import { describe, expect, it } from "vitest";
import { getTodayIso } from "@/services/match-service";

describe("getTodayIso", () => {
  it("calcula la fecha actual en vez de devolver un valor fijo", () => {
    // Regresión: TODAY_ISO solía ser una constante hardcodeada ("2026-08-04")
    // que se desalineaba del reloj real con el paso de los días (partidos de
    // hoy aparecían como "en 2 días" y viceversa). Ahora se calcula siempre.
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Lima",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const expected = `${values.year}-${values.month}-${values.day}`;
    expect(getTodayIso()).toBe(expected);
    expect(getTodayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
