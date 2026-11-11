/**
 * Sustituto de @nestjs/config para las pruebas e2e: el paquete es ESM puro y
 * Jest lo carga como CommonJS. Solo expone el token que usa ApiKeyGuard.
 */
export class ConfigService {
  get<T = string>(key: string): T | undefined {
    return process.env[key] as T | undefined;
  }
}
