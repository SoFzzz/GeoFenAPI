import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * PaginationQueryDto: parámetros page y limit (máximo 100) para los listados.
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un entero' })
  @Min(1, { message: 'page debe ser al menos 1' })
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un entero' })
  @Min(1, { message: 'limit debe ser al menos 1' })
  @Max(100, { message: 'limit no puede superar 100' })
  limit: number = 20;
}

/** Respuesta paginada: elementos de la página, total y parámetros usados. */
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/** Arma la respuesta paginada a partir de los datos y el total. */
export function paginated<T>(
  data: T[],
  total: number,
  { page, limit }: PaginationQueryDto,
): Paginated<T> {
  return { data, total, page, limit };
}

/** Convierte page y limit en skip y take para TypeORM. */
export function pageOptions({ page, limit }: PaginationQueryDto) {
  return { skip: (page - 1) * limit, take: limit };
}
