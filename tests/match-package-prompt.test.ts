import { describe, expect, it } from "vitest";
import { getStrictMatchPackagePrompt } from "@/lib/match-package-prompt";

describe("strict match package prompt", () => {
  it("blocks estimates and requires complete, verifiable data", () => {
    const prompt = getStrictMatchPackagePrompt();

    expect(prompt).toContain("100% REALES, COMPLETOS y COMPROBABLES");
    expect(prompt).toContain('resultStatus: "verified"');
    expect(prompt).toContain('statsStatus: "provided"');
    expect(prompt).toContain("NO generes JSON parcial");
    expect(prompt).toContain("NO PUEDO GENERAR EL JSON");
    expect(prompt).toContain("exactamente 5 registros historicos completos");
    expect(prompt).toContain("ARCHIVO descargable con extension .json");
    expect(prompt).toContain('valor exacto de "id" mas ".json"');
    expect(prompt).toContain("No pegues el JSON como texto en el chat");
    expect(prompt).toContain("NO PUEDO CREAR EL ARCHIVO .json");
  });
});
