import type {
  Category,
  NewCategory,
  NewPrice,
  NewProduct,
  NewStore,
  PricesBulkResult,
  Product,
  Store,
  StoresBulkResult,
} from '../types';
import type { ApiClient } from './client';

const PAGE_SIZE = 100;

interface Page<T> {
  data: T[];
  total: number;
}

/** Recorre un listado paginado (page/limit) hasta completar `total`. */
async function listAll<T>(client: ApiClient, path: string): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; ; page++) {
    const res = await client.request<Page<T> | T[]>(
      'GET',
      `${path}?page=${page}&limit=${PAGE_SIZE}`,
    );
    // Algunos recursos devuelven el arreglo completo sin paginar
    if (Array.isArray(res)) return res;
    items.push(...res.data);
    if (res.data.length === 0 || items.length >= res.total) return items;
  }
}

/** Lista todas las categorías (la API las devuelve sin paginar). */
export const listCategories = (client: ApiClient) =>
  listAll<Category>(client, '/categories');

/** Lista todos los productos. */
export const listProducts = (client: ApiClient) =>
  listAll<Product>(client, '/products');

/** Lista todas las tiendas. */
export const listStores = (client: ApiClient) =>
  listAll<Store>(client, '/stores');

/** Crea una categoría. */
export const createCategory = (client: ApiClient, category: NewCategory) =>
  client.request<Category>('POST', '/categories', category);

/** Crea un producto. */
export const createProduct = (client: ApiClient, product: NewProduct) =>
  client.request<Product>('POST', '/products', product);

/** Crea o actualiza tiendas por (cadena, dirección). Máximo 500 por llamada. */
export const storesBulk = (client: ApiClient, stores: NewStore[]) =>
  client.request<StoresBulkResult>('POST', '/stores/bulk', { stores });

/** Envía precios en lote. Máximo 1000 por llamada. */
export const pricesBulk = (client: ApiClient, prices: NewPrice[]) =>
  client.request<PricesBulkResult>('POST', '/prices/bulk', { prices });
