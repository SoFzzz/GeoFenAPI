import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseOlimpicaOffer } from './olimpica.parser';

const EAN = '7702511000021';

/** Respuesta mínima del catálogo VTEX para un producto. */
function product(ean: string, offer: Record<string, number>, linkText = 'arroz-diana-1-kg') {
  return { linkText, items: [{ ean, sellers: [{ commertialOffer: offer }] }] };
}

describe('parseOlimpicaOffer', () => {
  it('devuelve precio y url del producto con el EAN exacto', () => {
    const body = [product(EAN, { Price: 4200, ListPrice: 4500, AvailableQuantity: 10 })];
    assert.deepEqual(parseOlimpicaOffer(body, EAN), {
      price: 4200,
      listPrice: 4500,
      url: 'https://www.olimpica.com/arroz-diana-1-kg/p',
    });
  });

  it('descarta precio 0', () => {
    const body = [product(EAN, { Price: 0, AvailableQuantity: 10 })];
    assert.equal(parseOlimpicaOffer(body, EAN), null);
  });

  it('descarta productos sin stock', () => {
    const body = [product(EAN, { Price: 4200, AvailableQuantity: 0 })];
    assert.equal(parseOlimpicaOffer(body, EAN), null);
  });

  it('devuelve null con un arreglo vacío o una respuesta inesperada', () => {
    assert.equal(parseOlimpicaOffer([], EAN), null);
    assert.equal(parseOlimpicaOffer({ error: 'x' }, EAN), null);
  });

  it('ignora resultados con otro EAN y toma el que coincide', () => {
    const body = [
      product('1111111111111', { Price: 999, AvailableQuantity: 5 }, 'otro'),
      product(EAN, { Price: 4200, AvailableQuantity: 5 }),
    ];
    assert.equal(parseOlimpicaOffer(body, EAN)?.price, 4200);
    assert.equal(parseOlimpicaOffer([body[0]], EAN), null);
  });
});
