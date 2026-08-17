import { z } from "zod";
import { ApiFootballError } from "@/services/api-football";
import { buildApiFootballPackage } from "@/services/api-football-package-service";
import type { ApiFootballImportResult, ApiFootballProgress } from "@/lib/api-football-import-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const inputSchema = z.object({
  homeTeam: z.string().trim().min(1, "Indica el equipo local."),
  awayTeam: z.string().trim().min(1, "Indica el equipo visitante."),
  date: z.iso.date("Usa la fecha YYYY-MM-DD."),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Usa la hora HH:mm.").optional().or(z.literal("")),
  competition: z.string().trim().optional(),
  fixtureId: z.number().int().positive().optional(),
});

function eventMessage(name: "progress" | "result", payload: ApiFootballProgress | ApiFootballImportResult): Uint8Array {
  return new TextEncoder().encode(`event: ${name}\ndata: ${JSON.stringify(payload)}\n\n`);
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ kind: "error", message: "El cuerpo de la consulta no es JSON valido." } satisfies ApiFootballImportResult, { status: 400 });
  }
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      { kind: "error", message: parsed.error.issues.map((issue) => issue.message).join(" ") } satisfies ApiFootballImportResult,
      { status: 400 }
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      void (async () => {
        try {
          const result = await buildApiFootballPackage(
            { ...parsed.data, time: parsed.data.time || undefined, competition: parsed.data.competition || undefined },
            { onProgress: (progress) => controller.enqueue(eventMessage("progress", progress)) }
          );
          controller.enqueue(eventMessage("result", result));
        } catch (error) {
          const message = error instanceof ApiFootballError ? error.message : "No se pudo completar la consulta a API-Football.";
          controller.enqueue(eventMessage("result", { kind: "error", message }));
        } finally {
          controller.close();
        }
      })();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
