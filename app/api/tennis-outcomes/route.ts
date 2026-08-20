import { NextRequest } from "next/server";
import { parseTennisOutcomeFile, readTennisOutcomeFile, writeTennisOutcomeFile } from "@/lib/tennis-outcome-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const file = await readTennisOutcomeFile();
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
    return Response.json({ success: false, message: "El cuerpo de la petición no es JSON válido." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body) || !("outcomes" in body)) {
    return Response.json({ success: false, message: 'Falta el campo "outcomes".' }, { status: 400 });
  }

  try {
    const incoming = parseTennisOutcomeFile({ version: 1, outcomes: (body as Record<string, unknown>).outcomes });
    const current = await readTennisOutcomeFile();
    const next = { version: 1 as const, outcomes: { ...current.outcomes, ...incoming.outcomes } };
    await writeTennisOutcomeFile(next);
    return Response.json({ success: true, ...next });
  } catch (error) {
    return Response.json({ success: false, message: (error as Error).message }, { status: 422 });
  }
}
