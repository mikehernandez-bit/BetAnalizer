import { NextRequest } from "next/server";
import {
  parseFootballOutcomeFile,
  readFootballOutcomeFile,
  writeFootballOutcomeFile,
} from "@/lib/football-outcome-store";
import type { RecordedMatchOutcome } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const file = await readFootballOutcomeFile();
    return Response.json({ success: true, ...file });
  } catch (error) {
    return Response.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "El cuerpo de la peticiÃ³n no es JSON vÃ¡lido." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ success: false, message: "Cuerpo de peticiÃ³n invÃ¡lido." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;

  try {
    const current = await readFootballOutcomeFile();
    let nextOutcomes = { ...current.outcomes };

    if ("matchId" in payload && "outcome" in payload) {
      const matchId = String(payload.matchId);
      const outcome = payload.outcome as RecordedMatchOutcome;
      nextOutcomes[matchId] = outcome;
    } else if ("outcomes" in payload && typeof payload.outcomes === "object" && payload.outcomes !== null) {
      nextOutcomes = { ...nextOutcomes, ...(payload.outcomes as Record<string, RecordedMatchOutcome>) };
    } else {
      return Response.json({ success: false, message: 'Falta "matchId" y "outcome", o el objeto "outcomes".' }, { status: 400 });
    }

    const next = { version: 1 as const, outcomes: nextOutcomes };
    await writeFootballOutcomeFile(next);
    return Response.json({ success: true, ...next });
  } catch (error) {
    return Response.json({ success: false, message: (error as Error).message }, { status: 422 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("matchId");
  if (!matchId) {
    return Response.json({ success: false, message: 'Falta el parÃ¡metro "matchId".' }, { status: 400 });
  }

  try {
    const current = await readFootballOutcomeFile();
    const nextOutcomes = { ...current.outcomes };
    delete nextOutcomes[matchId];
    const next = { version: 1 as const, outcomes: nextOutcomes };
    await writeFootballOutcomeFile(next);
    return Response.json({ success: true, ...next });
  } catch (error) {
    return Response.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}