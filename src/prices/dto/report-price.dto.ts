import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

/**
 * ReportPriceDTO: DTO para reportar el precio de un producto en una tienda.
 */
export class ReportPriceDto {
  @ApiProperty({
    example: 1,
    description: 'ID numérico del producto',
  })
  @IsInt({ message: 'El ID del producto debe ser un entero' })
  @IsPositive({ message: 'El ID del producto debe ser positivo' })
  productId: number;

  @ApiProperty({
    example: 1,
    description: 'ID numérico de la tienda',
  })
  @IsInt({ message: 'El ID de la tienda debe ser un entero' })
  @IsPositive({ message: 'El ID de la tienda debe ser positivo' })
  storeId: number;

  @ApiProperty({
    example: 4500.0,
    description: 'Precio reportado del producto (debe ser mayor a 0)',
  })
  @IsNumber({}, { message: 'El precio debe ser un número válido' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  price: number;

  @ApiPropertyOptional({
    example: 'COP',
    description: 'Código ISO de la moneda (3 caracteres)',
    default: 'COP',
  })
  @IsOptional()
  @IsString({ message: 'La moneda debe ser una cadena de texto' })
  @Length(3, 3, { message: 'La moneda debe tener exactamente 3 caracteres (código ISO)' })
  currency?: string;

  @ApiPropertyOptional({
    example: 'scraper',
    description: 'Fuente de la cual se obtuvo el precio',
    default: 'scraper',
  })
  @IsOptional()
  @IsString({ message: 'La fuente debe ser texto' })
  source?: string;
}
