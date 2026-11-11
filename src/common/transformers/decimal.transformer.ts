import { ValueTransformer } from 'typeorm';

/**
 * Transformer para columnas decimal: PostgreSQL devuelve los decimales como
 * string, así que se convierten a number al leer. Al escribir se deja igual.
 */
export const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : parseFloat(value),
};
