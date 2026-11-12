import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  createCategory,
  createProduct,
  listCategories,
  listProducts,
  listStores,
  storesBulk,
} from './api/endpoints';
import type { ApiClient } from './api/client';
import type { NewStore } from './types';

/** Producto del catálogo local (la categoría va por nombre). */
export interface CatalogProduct {
  name: string;
  brand?: string;
  barcode: string;
  category: string;
}

interface Catalog {
  categories: string[];
  products: CatalogProduct[];
}

interface StoresFile {
  city: string;
  stores: NewStore[];
}

/** Resumen de la sincronización del catálogo. */
export interface CatalogSummary {
  categoriasCreadas: number;
  productosCreados: number;
}

const DATA_DIR = join(__dirname, '..', 'data');

/** Lee un JSON de scraper/data. */
export function readData<T>(file: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, file), 'utf-8')) as T;
}

/** Texto en minúsculas y sin tildes, para comparar nombres. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Asegura que existan las categorías y productos de catalog.json.
 * Con dryRun no escribe: solo informa lo que se crearía.
 * Devuelve el mapa barcode -> productId de lo que existe en la API.
 */
export async function syncCatalog(
  client: ApiClient,
  dryRun = false,
): Promise<{ productIds: Map<string, number>; summary: CatalogSummary }> {
  const catalog = readData<Catalog>('catalog.json');
  const summary: CatalogSummary = { categoriasCreadas: 0, productosCreados: 0 };

  // Categorías por nombre normalizado
  const categoryIds = new Map<string, number>();
  for (const c of await listCategories(client)) {
    categoryIds.set(normalize(c.name), c.id);
  }
  const names = new Set([
    ...catalog.categories,
    ...catalog.products.map((p) => p.category),
  ]);
  for (const name of names) {
    if (categoryIds.has(normalize(name))) continue;
    summary.categoriasCreadas++;
    if (dryRun) {
      console.log(`[dry-run] se crearía la categoría "${name}"`);
      continue;
    }
    const created = await createCategory(client, { name });
    categoryIds.set(normalize(name), created.id);
  }

  // Productos por barcode
  const productIds = new Map<string, number>();
  for (const p of await listProducts(client)) {
    if (p.barcode) productIds.set(p.barcode.trim(), p.id);
  }
  for (const p of catalog.products) {
    if (productIds.has(p.barcode)) continue;
    summary.productosCreados++;
    if (dryRun) {
      console.log(`[dry-run] se crearía el producto "${p.name}" (${p.barcode})`);
      continue;
    }
    const created = await createProduct(client, {
      name: p.name,
      brand: p.brand,
      barcode: p.barcode,
      categoryId: categoryIds.get(normalize(p.category)),
    });
    productIds.set(p.barcode, created.id);
  }

  return { productIds, summary };
}

/**
 * Envía stores.json a POST /stores/bulk y devuelve el mapa cadena -> ids de
 * tienda (cadena normalizada, sin tildes ni mayúsculas), solo con las tiendas
 * de stores.json emparejadas por cadena + dirección. Con dryRun no envía nada
 * y el mapa solo trae las que ya existen; las ausentes quedan en `faltantes`.
 */
export async function syncStores(
  client: ApiClient,
  city: string,
  dryRun = false,
): Promise<{
  storeIds: Map<string, number[]>;
  summary: {
    enviadas: number;
    creadas: number;
    actualizadas: number;
    faltantes: string[];
  };
}> {
  const file = readData<StoresFile>('stores.json');
  if (normalize(file.city) !== normalize(city)) {
    throw new Error(
      `stores.json es de "${file.city}" y CITY es "${city}": no hay tiendas para esa ciudad.`,
    );
  }

  const key = (s: { chain: string; address: string }) =>
    `${normalize(s.chain)}|${s.address.trim()}`;
  const existing = await listStores(client);
  const known = new Set(existing.map(key));
  let stores = existing;
  let summary = {
    enviadas: file.stores.length,
    creadas: 0,
    actualizadas: 0,
    faltantes: [] as string[],
  };

  if (dryRun) {
    summary.creadas = file.stores.filter((s) => !known.has(key(s))).length;
    summary.actualizadas = file.stores.length - summary.creadas;
    console.log(
      `[dry-run] se enviarían ${summary.enviadas} tiendas (${summary.creadas} nuevas, ${summary.actualizadas} existentes)`,
    );
  } else {
    const res = await storesBulk(client, file.stores);
    summary = {
      ...summary,
      enviadas: res.received,
      creadas: res.created,
      actualizadas: res.updated,
    };
    stores = await listStores(client);
  }

  // Solo las tiendas de stores.json, no las demás de la cadena
  const byKey = new Map(stores.map((s) => [key(s), s.id]));
  const storeIds = new Map<string, number[]>();
  for (const s of file.stores) {
    const id = byKey.get(key(s));
    if (id === undefined) {
      summary.faltantes.push(`${s.name} (${s.chain})`);
      continue;
    }
    const chain = normalize(s.chain);
    storeIds.set(chain, [...(storeIds.get(chain) ?? []), id]);
  }
  return { storeIds, summary };
}
