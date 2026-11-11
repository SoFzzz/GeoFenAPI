import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

/**
 * PricesQueryDto: filtros opcionales para GET /prices.
 */
export class PricesQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Filtrar por ID de producto' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'productId debe ser un entero' })
  @IsPositive({ message: 'productId debe ser positivo' })
  productId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filtrar por ID de tienda' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'storeId debe ser un entero' })
  @IsPositive({ message: 'storeId debe ser positivo' })
  storeId?: number;
}
