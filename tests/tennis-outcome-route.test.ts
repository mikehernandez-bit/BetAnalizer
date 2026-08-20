import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/tennis-outcomes/route";
import type { TennisRecordedOutcome } from "@/types/tennis";

let tempDir: string;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "betanalyzer-tennis-outcomes-"));
  process.env.TENNIS_OUTCOMES_STORE_PATH = path.join(tempDir, "tennis-recorded-outcomes.json");
});

afterEach(async () => {
  delete process.env.TENNIS_OUTCOMES_STORE_PATH;
  await fs.rm(tempDir, { recursive: true, force: true });
});

function postRequest(outcomes: Record<string, TennisRecordedOutcome>) {
  return new NextRequest("http://localhost/api/tennis-outcomes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ outcomes }),
  });
}

function outcome(id: string, winner = "Jugador A"): TennisRecordedOutcome {
  return { id, winner, score: "6-4 6-3", recordedAt: "2026-08-18T20:00:00.000Z" };
}

describe("persistencia de resultados de tenis", () => {
  it("empieza vacío y conserva los resultados enviados por el navegador", async () => {
    expect(await (await GET()).json()).toMatchObject({ success: true, outcomes: {} });

    const first = outcome("partido-1");
    const response = await POST(postRequest({ [first.id]: first }));
    expect(response.status).toBe(200);
    expect(await (await GET()).json()).toMatchObject({ outcomes: { "partido-1": first } });
  });

  it("fusiona nuevos resultados y permite corregir uno existente", async () => {
    const first = outcome("partido-1");
    await POST(postRequest({ [first.id]: first }));

    const corrected = outcome("partido-1", "Jugador B");
    const second = outcome("partido-2");
    await POST(postRequest({ [corrected.id]: corrected, [second.id]: second }));

    const stored = await (await GET()).json();
    expect(stored.outcomes).toEqual({ "partido-1": corrected, "partido-2": second });
  });

  it("rechaza registros cuyo id no coincide con la clave", async () => {
    const response = await POST(postRequest({ "partido-1": outcome("otro-id") }));
    expect(response.status).toBe(422);
    expect((await response.json()).success).toBe(false);
    expect(await (await GET()).json()).toMatchObject({ outcomes: {} });
  });
});
