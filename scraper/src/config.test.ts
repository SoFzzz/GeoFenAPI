import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { loadConfig } from './config';

const KEYS = ['API_URL', 'SCRAPER_API_KEY', 'CITY', 'DRY_RUN', 'REQUEST_DELAY_MS', 'SOURCES'];
let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  for (const k of KEYS) delete process.env[k];
});

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe('loadConfig', () => {
  it('usa valores por defecto', () => {
    const config = loadConfig([]);
    assert.equal(config.apiUrl, 'http://localhost:3000');
    assert.equal(config.city, 'Pasto');
    assert.equal(config.dryRun, true);
    assert.deepEqual(config.sources, ['file']);
  });

  it('los flags tienen prioridad sobre el .env', () => {
    process.env.SOURCES = 'file';
    process.env.DRY_RUN = 'false';
    process.env.SCRAPER_API_KEY = 'k';
    const config = loadConfig(['--dry-run', '--source=file,olimpica', '--limit=3']);
    assert.equal(config.dryRun, true);
    assert.deepEqual(config.sources, ['file', 'olimpica']);
    assert.equal(config.limit, 3);
  });

  it('exige la API key cuando no es dry run', () => {
    process.env.DRY_RUN = 'false';
    assert.throws(() => loadConfig([]), /SCRAPER_API_KEY/);
  });

  it('rechaza flags desconocidos y límites inválidos', () => {
    assert.throws(() => loadConfig(['--foo']), /Argumento desconocido/);
    assert.throws(() => loadConfig(['--limit=0']), /--limit/);
  });
});
