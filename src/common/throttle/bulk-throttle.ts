import { ExecutionContext, SetMetadata } from '@nestjs/common';

/** Clave de metadatos que marca los endpoints sujetos al límite de ingesta masiva. */
export const BULK_THROTTLE_KEY = 'bulk-throttle';

/**
 * Marca un endpoint para aplicarle el límite estricto 'bulk' (THROTTLE_BULK_LIMIT),
 * además del límite global.
 */
export const BulkThrottle = () => SetMetadata(BULK_THROTTLE_KEY, true);

/**
 * Indica si el límite 'bulk' debe omitirse: solo aplica a los endpoints marcados.
 */
export const skipUnlessBulk = (context: ExecutionContext): boolean =>
  !Reflect.getMetadata(BULK_THROTTLE_KEY, context.getHandler());
