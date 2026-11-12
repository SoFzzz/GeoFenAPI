import type { CatalogProduct } from '../sync';

/** Precio de un producto en una cadena, tal como lo entrega una fuente. */
export interface ScrapedPrice {
  chain: string;
  barcode: string;
  price: number;
  currency: string;
  url?: string;
  source: string;
}

/** Fuente de precios (archivo local, sitio web, etc.). */
export interface PriceSource {
  name: string;
  fetchPrices(products: CatalogProduct[]): Promise<ScrapedPrice[]>;
}
