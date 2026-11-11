import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination';

export class ProductsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Filtrar por ID de categoría' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'categoryId debe ser un entero' })
  @IsPositive({ message: 'categoryId debe ser positivo' })
  categoryId?: number;
}
