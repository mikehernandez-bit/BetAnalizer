export const API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io";

export class ApiFootballError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "ApiFootballError";
  }
}

export interface ApiFootballGateway {
  get<T>(endpoint: string, params?: Record<string, string | number | undefined>, ttlMs?: number): Promise<T[]>;
}

interface ApiFootballEnvelope<T> {
  errors?: Record<string, unknown> | unknown[];
  response?: T[];
  results?: number;
}

interface CacheEntry {
  expiresAt: number;
  response: Promise<unknown>;
}

const responseCache = new Map<string, CacheEntry>();
const REQUEST_TIMEOUT_MS = 15_000;
const DEFAULT_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

function isEmptyErrors(value: unknown): boolean {
  if (Array.isArray(value)) return value.length === 0;
  if (value && typeof value === "object") return Object.keys(value).length === 0;
  return !value;
}

function toApiError(status: number, detail?: string): ApiFootballError {
  if (status === 401 || status === 403) return new ApiFootballError("API-Football rechazo la clave configurada.", status);
  if (status === 429) return new ApiFootballError("Limite de solicitudes de API-Football alcanzado.", status);
  if (status === 404) return new ApiFootballError("API-Football no encontro el recurso solicitado.", status);
  if (status >= 500) return new ApiFootballError("API-Football no esta disponible temporalmente.", status);
  return new ApiFootballError(detail || "No se pudo consultar API-Football.", status);
}

function cacheKey(endpoint: string, params: Record<string, string | number | undefined>): string {
  return `${endpoint}?${Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join("&")}`;
}

function errorMessageFromPayload(errors: unknown): string {
  const text = JSON.stringify(errors).toLowerCase();
  if (text.includes("suspended")) return "La cuenta de API-Football esta suspendida. Reactivala en el panel de API-Football.";
  if (text.includes("rate") || text.includes("limit")) return "Limite de solicitudes de API-Football alcanzado.";
  if (text.includes("plan")) return "Tu plan de API-Football no incluye estos datos o esta temporada. Amplia el plan para poder completar el paquete.";
  if (text.includes("key") || text.includes("access")) return "API-Football rechazo la clave o el acceso configurado.";
  return "API-Football devolvio una respuesta con errores.";
}

export function clearApiFootballCache(): void {
  responseCache.clear();
}

/**
 * Cliente unico de API-Football. Solo puede importarse desde servidor: la clave
 * se lee en runtime y nunca forma parte de una respuesta ni del bundle cliente.
 */
export class ApiFootballClient implements ApiFootballGateway {
  async get<T>(endpoint: string, params: Record<string, string | number | undefined> = {}, ttlMs = DEFAULT_CACHE_TTL_MS): Promise<T[]> {
    const key = cacheKey(endpoint, params);
    const now = Date.now();
    const cached = responseCache.get(key);
    if (cached && cached.expiresAt > now) return cached.response as Promise<T[]>;

    const response = this.request<T>(endpoint, params);
    responseCache.set(key, { expiresAt: now + ttlMs, response });
    try {
      return await response;
    } catch (error) {
      responseCache.delete(key);
      throw error;
    }
  }

  private async request<T>(endpoint: string, params: Record<string, string | number | undefined>): Promise<T[]> {
    const apiKey = process.env.API_FOOTBALL_KEY?.trim();
    if (!apiKey) {
      throw new ApiFootballError("Falta configurar API_FOOTBALL_KEY en el servidor. Agregala en .env.local y reinicia la aplicacion.", 503);
    }

    const url = new URL(endpoint, API_FOOTBALL_BASE_URL);
    for (const [name, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") url.searchParams.set(name, String(value));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        headers: { "x-apisports-key": apiKey },
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) throw toApiError(response.status);
      const payload = (await response.json()) as ApiFootballEnvelope<T>;
      if (!isEmptyErrors(payload.errors)) {
        throw new ApiFootballError(errorMessageFromPayload(payload.errors), 502);
      }
      return Array.isArray(payload.response) ? payload.response : [];
    } catch (error) {
      if (error instanceof ApiFootballError) throw error;
      if ((error as Error).name === "AbortError") throw new ApiFootballError("La consulta a API-Football excedio el tiempo de espera.", 504);
      throw new ApiFootballError("No fue posible conectar con API-Football.", 502);
    } finally {
      clearTimeout(timeout);
    }
  }
}
