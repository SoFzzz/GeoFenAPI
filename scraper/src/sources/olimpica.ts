import { sleep } from '../api/client';
import type { Config } from '../config';
import type { CatalogProduct } from '../sync';
import { parseOlimpicaOffer } from './olimpica.parser';
import type { PriceSource, ScrapedPrice } from './source';

const BASE_URL = 'https://www.olimpica.com';
const USER_AGENT = 'GeoFenScraper/0.1 (proyecto academico)';
const TIMEOUT_MS = 15000;

/** Busca un EAN en el catálogo público; acepta respuestas 200 y 206. */
async function searchByEan(ean: string): Promise<unknown> {
  const url = `${BASE_URL}/api/catalog_system/pub/products/search?fq=alternateIds_Ean:${encodeURIComponent(ean)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: controller.signal,
    });
    if (res.status !== 200 && res.status !== 206) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fuente web: precios online de Olímpica por EAN. Pausa entre peticiones y,
 * si una falla, registra el error y sigue con el siguiente producto.
 */
export function createOlimpicaSource(config: Pick<Config, 'requestDelayMs'>): PriceSource {
  return {
    name: 'olimpica',
    async fetchPrices(products: CatalogProduct[]): Promise<ScrapedPrice[]> {
      const prices: ScrapedPrice[] = [];
      for (const [i, product] of products.entries()) {
        if (i > 0) await sleep(config.requestDelayMs);
        try {
          const offer = parseOlimpicaOffer(await searchByEan(product.barcode), product.barcode);
          if (!offer) {
            console.warn(`olimpica: sin precio disponible para ${product.name} (${product.barcode})`);
            continue;
          }
          prices.push({
            chain: 'Olímpica',
            barcode: product.barcode,
            price: offer.price,
            currency: 'COP',
            url: offer.url,
            source: 'olimpica.com',
          });
        } catch (error) {
          const reason = error instanceof Error ? error.message : String(error);
          console.error(`olimpica: error con ${product.name} (${product.barcode}): ${reason}`);
        }
      }
      return prices;
    },
  };
}
