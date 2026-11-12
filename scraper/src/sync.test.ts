import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalize } from './sync';

describe('normalize', () => {
  it('quita tildes y pasa a minúsculas', () => {
    assert.equal(normalize('Olímpica'), 'olimpica');
    assert.equal(normalize('ÉXITO'), 'exito');
  });

  it('hace coincidir variantes de una misma cadena', () => {
    assert.equal(normalize('Olimpica'), normalize(' Olímpica '));
  });
});
