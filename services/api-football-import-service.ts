import type { ApiFootballImportInput, ApiFootballImportResult, ApiFootballProgress } from "@/lib/api-football-import-types";

function parseServerEvent(block: string): { event: string; data: string } | null {
  const lines = block.split(/\r?\n/);
  const event = lines.find((line) => line.startsWith("event:"))?.slice("event:".length).trim();
  const data = lines.find((line) => line.startsWith("data:"))?.slice("data:".length).trim();
  return event && data ? { event, data } : null;
}

export async function consultApiFootball(
  input: ApiFootballImportInput,
  onProgress: (progress: ApiFootballProgress) => void
): Promise<ApiFootballImportResult> {
  const response = await fetch("/api/api-football/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok || !response.body) {
    const payload = (await response.json().catch(() => null)) as ApiFootballImportResult | null;
    return payload?.kind === "error" ? payload : { kind: "error", message: "No se pudo iniciar la consulta a API-Football." };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  let result: ApiFootballImportResult | null = null;

  while (true) {
    const next = await reader.read();
    if (next.done) break;
    pending += decoder.decode(next.value, { stream: true });
    const blocks = pending.split(/\r?\n\r?\n/);
    pending = blocks.pop() ?? "";
    for (const block of blocks) {
      const event = parseServerEvent(block);
      if (!event) continue;
      try {
        if (event.event === "progress") onProgress(JSON.parse(event.data) as ApiFootballProgress);
        if (event.event === "result") result = JSON.parse(event.data) as ApiFootballImportResult;
      } catch {
        return { kind: "error", message: "La respuesta de API-Football no pudo procesarse." };
      }
    }
  }
  return result ?? { kind: "error", message: "API-Football no devolvio un resultado final." };
}
