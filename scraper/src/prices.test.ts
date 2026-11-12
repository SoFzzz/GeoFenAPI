import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BATCH_SIZE, chunk, toNewPrices } from './prices';
import type { ScrapedPrice } from './sources/source';

const AT = '2026-11-10T15:00:00.000Z';

const scraped = (chain: string, barcode = '111'): ScrapedPrice => ({
  chain,
  barcode,
  price: 5000,
  currency: 'COP',
  source: 'manual',
});

describe('toNewPrices', () => {
  const productIds = new Map([['111', 7]]);

  it('asigna el precio a cada tienda de la cadena con el mismo scrapedAt', () => {
    const storeIds = new Map([['exito', [1, 2]]]);
    const { prices } = toNewPrices([scraped('Éxito')], productIds, storeIds, AT);
    assert.equal(prices.length, 2);
    assert.deepEqual(prices.map((p) => p.storeId), [1, 2]);
    assert.ok(prices.every((p) => p.productId === 7 && p.scrapedAt === AT));
  });

  it('omite cadenas sin tiendas', () => {
    const res = toNewPrices([scraped('Alkosto')], productIds, new Map(), AT);
    assert.equal(res.prices.length, 0);
    assert.equal(res.sinTiendas, 1);
  });

  it('omite productos sin id', () => {
    const res = toNewPrices([scraped('Éxito', '999')], productIds, new Map([['exito', [1]]]), AT);
    assert.equal(res.prices.length, 0);
    assert.equal(res.sinProducto, 1);
  });
});

describe('chunk', () => {
  it('agrupa en lotes de 1000', () => {
    const groups = chunk(Array.from({ length: 2500 }, (_, i) => i));
    assert.equal(BATCH_SIZE, 1000);
    assert.deepEqual(groups.map((g) => g.length), [1000, 1000, 500]);
  });

  it('devuelve una lista vacía si no hay elementos', () => {
    assert.deepEqual(chunk([]), []);
  });
});
