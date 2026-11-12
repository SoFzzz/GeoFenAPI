import type { Config } from '../config';

const TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;
const MAX_WAIT_MS = 120000;

/** Error de la API con el formato { statusCode, error, message, path, timestamp }. */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly detail: string,
    public readonly method: string,
    public readonly path: string,
  ) {
    super(`${method} ${path} -> ${statusCode}: ${detail}`);
    this.name = 'ApiError';
  }
}

/** Pausa asíncrona. */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Segundos de espera que pide el servidor ante un 429 (Retry-After o retry-after-<nombre>). */
function retryAfterMs(res: Response): number {
  const values: number[] = [];
  res.headers.forEach((value, name) => {
    if (name === 'retry-after' || name.startsWith('retry-after-')) {
      const seconds = Number(value);
      if (Number.isFinite(seconds)) values.push(seconds);
    }
  });
  const seconds = values.length ? Math.max(...values) : 5;
  return Math.min(Math.max(seconds, 1) * 1000, MAX_WAIT_MS);
}

/** Convierte el cuerpo de error de la API en un texto legible. */
function describeError(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const { message } = body as { message: unknown };
    return Array.isArray(message) ? message.join('; ') : String(message);
  }
  return fallback;
}

/** Cliente HTTP mínimo para la API de GeoFen (fetch nativo). */
export class ApiClient {
  constructor(private readonly config: Pick<Config, 'apiUrl' | 'apiKey'>) {}

  /**
   * Hace una petición JSON. Envía x-api-key en las escrituras y reintenta
   * hasta 2 veces ante un 429 esperando lo que indique el servidor.
   */
  async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (method !== 'GET') {
      headers['Content-Type'] = 'application/json';
      headers['x-api-key'] = this.config.apiKey;
    }

    for (let attempt = 0; ; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      let res: Response;
      try {
        res = await fetch(this.config.apiUrl + path, {
          method,
          headers,
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: controller.signal,
        });
      } catch (error) {
        const reason =
          error instanceof Error && error.name === 'AbortError'
            ? `sin respuesta tras ${TIMEOUT_MS} ms`
            : 'no se pudo conectar con la API';
        throw new Error(`${method} ${path}: ${reason} (${this.config.apiUrl})`);
      } finally {
        clearTimeout(timer);
      }

      if (res.status === 429 && attempt < MAX_RETRIES) {
        const wait = retryAfterMs(res);
        console.warn(`429 en ${path}: reintento ${attempt + 1}/${MAX_RETRIES} en ${Math.ceil(wait / 1000)} s`);
        await sleep(wait);
        continue;
      }

      const text = await res.text();
      let data: unknown = undefined;
      try {
        data = text ? JSON.parse(text) : undefined;
      } catch {
        // cuerpo no JSON
      }

      if (!res.ok) {
        throw new ApiError(res.status, describeError(data, res.statusText), method, path);
      }
      return data as T;
    }
  }
}
