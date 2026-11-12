import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const logger = new Logger('HTTP');

/**
 * Middleware que registra método, ruta, código de estado y duración en ms de cada
 * petición. Se ejecuta al terminar la respuesta, por lo que también cubre los errores.
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();

  res.on('finish', () => {
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`;
    if (res.statusCode >= 500) logger.error(message);
    else if (res.statusCode >= 400) logger.warn(message);
    else logger.log(message);
  });

  next();
}
