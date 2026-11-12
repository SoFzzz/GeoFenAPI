/**
 * Reemplazo de @nestjs/config en las pruebas e2e (Jest no carga ESM).
 * Solo expone el token que usa ApiKeyGuard.
 */
export class ConfigService {
  get<T = string>(key: string): T | undefined {
    return process.env[key] as T | undefined;
  }
}
