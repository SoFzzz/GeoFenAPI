import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * DTO para la creación de un producto.
 */
export class CreateProductDto {
  @ApiProperty({
    example: 'Arroz Diana 1kg',
    description: 'Nombre del producto',
    maxLength: 150,
  })
  @IsString({ message: 'El nombre del producto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @MaxLength(150, { message: 'El nombre no puede superar los 150 caracteres' })
  name: string;

  @ApiPropertyOptional({
    example: 'Diana',
    description: 'Marca del producto',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'La marca debe ser una cadena de texto' })
  @MaxLength(100, { message: 'La marca no puede superar los 100 caracteres' })
  brand?: string;

  @ApiPropertyOptional({
    example: '7702354012345',
    description: 'Código de barras (único, opcional)',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'El código de barras debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El código de barras no puede superar los 50 caracteres' })
  barcode?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID de la categoría a la que pertenece el producto',
  })
  @IsOptional()
  @IsInt({ message: 'El ID de categoría debe ser un número entero' })
  @IsPositive({ message: 'El ID de categoría debe ser positivo' })
  categoryId?: number;
}

