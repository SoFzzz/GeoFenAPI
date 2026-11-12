import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiKeyGuard } from './api-key.guard';

/** Pruebas unitarias de ApiKeyGuard con un ConfigService simulado. */
describe('ApiKeyGuard', () => {
  const crearGuard = (clave?: string) =>
    new ApiKeyGuard({
      get: jest.fn().mockReturnValue(clave),
    } as unknown as ConfigService);

  const crearContexto = (header?: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          header: (name: string) =>
            name === 'x-api-key' ? header : undefined,
        }),
      }),
    }) as unknown as ExecutionContext;

  it('permite la petición con la clave correcta', () => {
    expect(crearGuard('clave-local').canActivate(crearContexto('clave-local'))).toBe(true);
  });

  it('responde 401 con una clave incorrecta', () => {
    expect(() =>
      crearGuard('clave-local').canActivate(crearContexto('otra-clave')),
    ).toThrow(UnauthorizedException);
  });

  it('responde 401 si falta el header', () => {
    expect(() =>
      crearGuard('clave-local').canActivate(crearContexto(undefined)),
    ).toThrow(UnauthorizedException);
  });

  it('responde 401 si SCRAPER_API_KEY no está definida', () => {
    expect(() =>
      crearGuard(undefined).canActivate(crearContexto('clave-local')),
    ).toThrow(UnauthorizedException);
  });

  it('responde 401 si SCRAPER_API_KEY está vacía y el header también', () => {
    expect(() => crearGuard('').canActivate(crearContexto(''))).toThrow(
      UnauthorizedException,
    );
  });
});
