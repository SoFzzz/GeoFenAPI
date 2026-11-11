import { Inject } from '@nestjs/common';

/**
 * Sustituto de @nestjs/typeorm para las pruebas: ese paquete se publica como
 * ESM puro (usa import.meta) y Jest lo ejecuta como CommonJS.
 * Mantiene la misma idea: un token por entidad inyectado con @Inject.
 */
export const getRepositoryToken = (entity: { name: string }): string =>
  `${entity.name}Repository`;

export const InjectRepository = (entity: { name: string }) =>
  Inject(getRepositoryToken(entity));
