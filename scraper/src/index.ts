import { ApiClient, sleep } from './api/client';
import { pricesBulk } from './api/endpoints';
import { loadConfig } from './config';
import { chunk, toNewPrices } from './prices';
import { createFileSource } from './sources/file';
import { createOlimpicaSource } from './sources/olimpica';
import type { PriceSource, ScrapedPrice } from './sources/source';
import { readData, syncCatalog, syncStores } from './sync';
import type { CatalogProduct } from './sync';

/** Pausa entre lotes: los endpoints bulk permiten 10 peticiones por minuto. */
const BATCH_PAUSE_MS = 6500;

/** Fuentes disponibles por nombre. */
const SOURCES: Record<string, (delay: number) => PriceSource> = {
  file: () => createFileSource(),
  olimpica: (delay) => createOlimpicaSource({ requestDelayMs: delay }),
};

/** Ejecuta el flujo completo: sincroniza catálogo y tiendas, obtiene precios y los envía. */
async function main(): Promise<void> {
  const config = loadConfig();

  const unknown = config.sources.filter((s) => !(s in SOURCES));
  if (unknown.length > 0) {
    throw new Error(
      `Fuente desconocida: ${unknown.join(', ')}. Disponibles: ${Object.keys(SOURCES).join(', ')}.`,
    );
  }

  const client = new ApiClient(config);
  const scrapedAt = new Date().toISOString();
  console.log(
    `GeoFen scraper: ${config.city}, fuentes ${config.sources.join(', ')}, ${config.dryRun ? 'DRY RUN (no escribe nada)' : 'envío real'}`,
  );

  const catalog = await syncCatalog(client, config.dryRun);
  const stores = await syncStores(client, config.city, config.dryRun);

  // Obtener precios de cada fuente (el límite solo aplica a las web)
  const products = readData<{ products: CatalogProduct[] }>('catalog.json').products;
  const scraped: ScrapedPrice[] = [];
  const porFuente: Record<string, number> = {};
  for (const name of config.sources) {
    const subset = name !== 'file' && config.limit ? products.slice(0, config.limit) : products;
    const found = await SOURCES[name](config.requestDelayMs).fetchPrices(subset);
    porFuente[name] = found.length;
    scraped.push(...found);
  }

  const mapped = toNewPrices(scraped, catalog.productIds, stores.storeIds, scrapedAt);
  const batches = chunk(mapped.prices);

  console.log('\nResumen');
  console.log(
    `- Catálogo: ${catalog.summary.categoriasCreadas} categorías y ${catalog.summary.productosCreados} productos ${config.dryRun ? 'por crear' : 'creados'}`,
  );
  console.log(
    `- Tiendas: ${stores.summary.enviadas} enviadas, ${stores.summary.creadas} ${config.dryRun ? 'nuevas' : 'creadas'}, ${stores.summary.actualizadas} ${config.dryRun ? 'existentes' : 'actualizadas'}`,
  );
  if (stores.summary.faltantes.length > 0) {
    console.log(`  Sin registrar en la API: ${stores.summary.faltantes.join(', ')}`);
  }
  for (const [name, count] of Object.entries(porFuente)) {
    console.log(`- Precios de ${name}: ${count}`);
  }
  console.log(
    `- Omitidos: ${mapped.sinTiendas} por cadena sin tiendas, ${mapped.sinProducto} por producto sin id`,
  );
  console.log(`- Precios por enviar: ${mapped.prices.length} en ${batches.length} lote(s)`);

  if (config.dryRun) {
    console.log('\nMuestra de lo que se enviaría:');
    console.log(JSON.stringify(mapped.prices.slice(0, 5), null, 2));
    return;
  }

  for (const [i, batch] of batches.entries()) {
    if (i > 0) await sleep(BATCH_PAUSE_MS);
    const res = await pricesBulk(client, batch);
    console.log(
      `Lote ${i + 1}/${batches.length}: received ${res.received}, saved ${res.saved}, duplicates ${res.duplicates}`,
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
