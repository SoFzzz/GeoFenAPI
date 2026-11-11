import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsISO4217CurrencyCode,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
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
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsISO4217CurrencyCode({ message: 'La moneda debe ser un código ISO 4217 válido (ej. COP)' })
  currency?: string;

  @ApiPropertyOptional({
    example: 'scraper',
    description: 'Fuente de la cual se obtuvo el precio',
    default: 'scraper',
  })
  @IsOptional()
  @IsString({ message: 'La fuente debe ser texto' })
  source?: string;

  @ApiPropertyOptional({
    example: '2026-11-10T15:30:00Z',
    description:
      'Fecha ISO 8601 en que se extrajo el precio. Con ella se detectan reportes duplicados; si se omite se usa la fecha actual',
  })
  @IsOptional()
  @IsDateString({}, { message: 'scrapedAt debe ser una fecha ISO 8601 válida' })
  scrapedAt?: string;
}
