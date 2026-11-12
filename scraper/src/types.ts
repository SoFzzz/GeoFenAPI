/** Categoría tal como la devuelve la API. */
export interface Category {
  id: number;
  name: string;
}

/** Producto tal como lo devuelve la API (la categoría llega como relación). */
export interface Product {
  id: number;
  name: string;
  brand: string | null;
  barcode: string | null;
  category?: Category | null;
}

/** Tienda tal como la devuelve la API. */
export interface Store {
  id: number;
  name: string;
  chain: string;
  address: string;
  latitude: number;
  longitude: number;
  schedule: string | null;
}

/** Cuerpo de POST /categories. */
export interface NewCategory {
  name: string;
}

/** Cuerpo de POST /products. */
export interface NewProduct {
  name: string;
  brand?: string;
  barcode?: string;
  categoryId?: number;
}

/** Elemento de POST /stores/bulk (upsert por cadena + dirección). */
export interface NewStore {
  name: string;
  chain: string;
  address: string;
  latitude: number;
  longitude: number;
  schedule?: string;
}

/** Elemento de POST /prices/bulk. */
export interface NewPrice {
  productId: number;
  storeId: number;
  price: number;
  currency?: string;
  source?: string;
  scrapedAt?: string;
}

/** Respuesta de POST /stores/bulk. */
export interface StoresBulkResult {
  received: number;
  created: number;
  updated: number;
}

/** Respuesta de POST /prices/bulk. */
export interface PricesBulkResult {
  received: number;
  saved: number;
  duplicates: number;
}
