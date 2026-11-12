import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

/**
 * LatestPricesQueryDto: parámetros de GET /prices/latest (productId obligatorio).
 */
export class LatestPricesQueryDto {
  @ApiProperty({ example: 1, description: 'ID del producto a consultar' })
  @Type(() => Number)
  @IsInt({ message: 'productId debe ser un entero' })
  @IsPositive({ message: 'productId debe ser positivo' })
  productId: number;
}
