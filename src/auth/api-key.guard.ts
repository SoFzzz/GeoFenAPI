import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';

/**
 * ApiKeyGuard: protege los endpoints de escritura. Compara el header x-api-key
 * con SCRAPER_API_KEY del .env y responde 401 si falta o no coincide.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  /**
   * Permite la petición solo con la clave correcta. Si SCRAPER_API_KEY no está
   * definida, rechaza todo (falla cerrado).
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const expected = this.config.get<string>('SCRAPER_API_KEY');
    const received = request.header('x-api-key');

    if (!expected || !received || !this.isSameKey(received, expected)) {
      throw new UnauthorizedException('API key inválida o ausente');
    }

    return true;
  }

  /** Compara las claves en tiempo constante. */
  private isSameKey(received: string, expected: string): boolean {
    const a = Buffer.from(received);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
