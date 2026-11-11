import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { AllExceptionsFilter } from './all-exceptions.filter';

/**
 * Pruebas del filtro global de excepciones con un contexto HTTP simulado.
 */
describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ method: 'POST', originalUrl: '/stores', url: '/stores' }),
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  it('traduce el error 23505 de PostgreSQL a 409', () => {
    const error = new QueryFailedError('INSERT', [], {
      code: '23505',
      detail: 'Key (chain, address)=(x, y) already exists.',
    } as unknown as Error);

    filter.catch(error, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    const body = json.mock.calls[0][0];
    expect(body).toMatchObject({
      statusCode: 409,
      error: 'Conflict',
      path: '/stores',
    });
    expect(JSON.stringify(body)).not.toContain('chain');
  });

  it('deja pasar una HttpException conservando sus campos extra', () => {
    filter.catch(
      new NotFoundException({
        message: 'El lote referencia productos o tiendas inexistentes',
        missingProductIds: [99],
        missingStoreIds: [],
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(404);
    expect(json.mock.calls[0][0]).toMatchObject({
      statusCode: 404,
      error: 'Not Found',
      message: 'El lote referencia productos o tiendas inexistentes',
      missingProductIds: [99],
      missingStoreIds: [],
    });
  });

  it('mantiene los mensajes de validación como arreglo', () => {
    filter.catch(
      new BadRequestException({ message: ['a', 'b'], error: 'Bad Request' }),
      host,
    );

    expect(json.mock.calls[0][0].message).toEqual(['a', 'b']);
  });

  it('responde 500 genérico ante un error desconocido sin exponer detalles', () => {
    filter.catch(new Error('password=secreto en la conexión'), host);

    expect(status).toHaveBeenCalledWith(500);
    const body = json.mock.calls[0][0];
    expect(body.message).toBe('Error interno del servidor');
    expect(JSON.stringify(body)).not.toContain('secreto');
    expect(Logger.prototype.error).toHaveBeenCalled();
  });
});
