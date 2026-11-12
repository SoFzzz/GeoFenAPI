import type { ScrapedPrice } from './sources/source';
import { normalize } from './sync';
import type { NewPrice } from './types';

/** Máximo de precios por petición a POST /prices/bulk. */
export const BATCH_SIZE = 1000;

/** Resultado de convertir los precios de las fuentes a precios de la API. */
export interface MappedPrices {
  prices: NewPrice[];
  sinTiendas: number;
  sinProducto: number;
}

/**
 * Convierte precios por cadena en precios por tienda: cada precio se asigna a
 * todas las tiendas de su cadena, con el mismo scrapedAt para toda la ejecución.
 * Omite los de cadenas sin tiendas o productos que no existen en la API.
 */
export function toNewPrices(
  scraped: ScrapedPrice[],
  productIds: Map<string, number>,
  storeIds: Map<string, number[]>,
  scrapedAt: string,
): MappedPrices {
  const result: MappedPrices = { prices: [], sinTiendas: 0, sinProducto: 0 };

  for (const item of scraped) {
    const productId = productIds.get(item.barcode);
    if (productId === undefined) {
      result.sinProducto++;
      continue;
    }
    const stores = storeIds.get(normalize(item.chain));
    if (!stores || stores.length === 0) {
      result.sinTiendas++;
      continue;
    }
    for (const storeId of stores) {
      result.prices.push({
        productId,
        storeId,
        price: item.price,
        currency: item.currency,
        source: item.source,
        scrapedAt,
      });
    }
  }
  return result;
}

/** Divide una lista en grupos de como máximo `size` elementos. */
export function chunk<T>(items: T[], size: number = BATCH_SIZE): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += size) groups.push(items.slice(i, i + size));
  return groups;
}
