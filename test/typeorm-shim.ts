import { Inject } from '@nestjs/common';

/**
 * Reemplazo de @nestjs/typeorm en las pruebas (Jest no carga ESM).
 * Un token por entidad, inyectado con @Inject.
 */
export const getRepositoryToken = (entity: { name: string }): string =>
  `${entity.name}Repository`;

export const InjectRepository = (entity: { name: string }) =>
  Inject(getRepositoryToken(entity));
