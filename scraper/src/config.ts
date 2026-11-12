import 'dotenv/config';

/** Configuración de una ejecución del scraper. */
export interface Config {
  apiUrl: string;
  apiKey: string;
  city: string;
  dryRun: boolean;
  requestDelayMs: number;
  sources: string[];
  /** Máximo de productos que consultan las fuentes web (flag --limit=N, para pruebas) */
  limit?: number;
}

/** Interpreta un texto como booleano ("true", "1", "yes"). */
function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return ['true', '1', 'yes', 'si'].includes(value.trim().toLowerCase());
}

/** Separa una lista por comas, sin vacíos ni repetidos. */
function parseList(value: string): string[] {
  return [
    ...new Set(
      value
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

/**
 * Carga la configuración desde el .env y los flags de la línea de comandos
 * (`--dry-run`, `--source=file,olimpica`, `--limit=N`). Los flags tienen prioridad.
 */
export function loadConfig(argv: string[] = process.argv.slice(2)): Config {
  const env = process.env;

  let dryRun = parseBool(env.DRY_RUN, true);
  let sourcesRaw = env.SOURCES ?? 'file';
  let limit: number | undefined;

  for (const arg of argv) {
    if (arg === '--dry-run') dryRun = true;
    else if (arg.startsWith('--source=')) sourcesRaw = arg.slice('--source='.length);
    else if (arg.startsWith('--sources=')) sourcesRaw = arg.slice('--sources='.length);
    else if (arg.startsWith('--limit=')) {
      limit = Number(arg.slice('--limit='.length));
      if (!Number.isInteger(limit) || limit < 1) {
        throw new Error('--limit debe ser un entero mayor o igual a 1.');
      }
    } else throw new Error(`Argumento desconocido: ${arg}`);
  }

  const apiKey = env.SCRAPER_API_KEY?.trim() ?? '';
  if (!dryRun && !apiKey) {
    throw new Error(
      'Falta SCRAPER_API_KEY en el .env del scraper (obligatoria cuando DRY_RUN=false).',
    );
  }

  const delay = Number(env.REQUEST_DELAY_MS ?? 1500);
  if (!Number.isFinite(delay) || delay < 0) {
    throw new Error('REQUEST_DELAY_MS debe ser un número mayor o igual a 0.');
  }

  const sources = parseList(sourcesRaw);
  if (sources.length === 0) {
    throw new Error('Indica al menos una fuente en SOURCES o con --source=.');
  }

  return {
    apiUrl: (env.API_URL ?? 'http://localhost:3000').replace(/\/+$/, ''),
    apiKey,
    city: env.CITY?.trim() || 'Pasto',
    dryRun,
    requestDelayMs: delay,
    sources,
    limit,
  };
}
