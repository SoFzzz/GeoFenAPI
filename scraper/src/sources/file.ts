import { readData } from '../sync';
import type { CatalogProduct } from '../sync';
import type { PriceSource, ScrapedPrice } from './source';

interface SamplePrices {
  nota?: string;
  source: string;
  currency: string;
  prices: { chain: string; barcode: string; price: number; url?: string }[];
}

/**
 * Fuente local: lee data/sample-prices.json (precios de ejemplo para la demo).
 * Solo devuelve precios de productos que estén en el catálogo.
 */
export function createFileSource(): PriceSource {
  return {
    name: 'file',
    async fetchPrices(products: CatalogProduct[]): Promise<ScrapedPrice[]> {
      const sample = readData<SamplePrices>('sample-prices.json');
      const barcodes = new Set(products.map((p) => p.barcode));
      const result: ScrapedPrice[] = [];

      for (const entry of sample.prices) {
        if (!barcodes.has(entry.barcode)) {
          console.warn(`file: el código ${entry.barcode} no está en el catálogo, se omite`);
          continue;
        }
        result.push({
          chain: entry.chain,
          barcode: entry.barcode,
          price: entry.price,
          currency: sample.currency,
          url: entry.url,
          source: sample.source,
        });
      }
      return result;
    },
  };
}
