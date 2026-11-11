import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { STATUS_CODES } from 'http';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * Respuesta de error unificada que recibe el cliente.
 */
export interface ErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
  [extra: string]: unknown;
}

/**
 * Traducción de errores de PostgreSQL (SQLSTATE) a respuestas HTTP genéricas.
 * 23505 y 23503 son conflictos con el estado actual de los datos (409);
 * el resto son datos mal formados o fuera de rango (400).
 */
const POSTGRES_ERRORS: Record<string, { status: number; message: string }> = {
  '23505': {
    status: HttpStatus.CONFLICT,
    message: 'Ya existe un registro con esos datos',
  },
  '23503': {
    status: HttpStatus.CONFLICT,
    message: 'La operación viola una relación con otro registro',
  },
  '23502': {
    status: HttpStatus.BAD_REQUEST,
    message: 'Falta un dato obligatorio',
  },
  '22P02': {
    status: HttpStatus.BAD_REQUEST,
    message: 'Alguno de los valores enviados tiene un formato inválido',
  },
  '22003': {
    status: HttpStatus.BAD_REQUEST,
    message: 'Alguno de los valores enviados está fuera de rango',
  },
};

/**
 * AllExceptionsFilter: unifica el formato de todos los errores.
 * Respeta las HttpException (incluidos sus campos extra), traduce los errores
 * de PostgreSQL y oculta los detalles internos de cualquier otro error (500).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  /**
   * Construye la respuesta de error y registra los fallos inesperados.
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { status, payload } = this.toPayload(exception, request);

    response.status(status).json({
      statusCode: status,
      error: STATUS_CODES[status] ?? 'Error',
      ...payload,
      path: request.originalUrl ?? request.url,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Obtiene el estado HTTP y el contenido (mensaje y campos extra) del error.
   */
  private toPayload(
    exception: unknown,
    request: Request,
  ): { status: number; payload: Partial<ErrorBody> } {
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const payload =
        typeof body === 'string'
          ? { message: body }
          : { ...(body as Partial<ErrorBody>) };
      delete payload.statusCode;
      payload.message ??= exception.message;
      return { status: exception.getStatus(), payload };
    }

    if (exception instanceof QueryFailedError) {
      const code = (exception as { driverError?: { code?: string } })
        .driverError?.code;
      const known = code ? POSTGRES_ERRORS[code] : undefined;

      if (known) {
        this.logger.warn(
          `${request.method} ${request.originalUrl} -> error de base de datos ${code}`,
        );
        return { status: known.status, payload: { message: known.message } };
      }
    }

    const stack = exception instanceof Error ? exception.stack : String(exception);
    this.logger.error(
      `${request.method} ${request.originalUrl} -> error no controlado`,
      stack,
    );
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      payload: { message: 'Error interno del servidor' },
    };
  }
}
