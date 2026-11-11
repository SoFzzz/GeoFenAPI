import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Data Transfer Object (DTO) para la creación de una tienda.
 */
export class CreateStoreDto {
  /**
   * Nombre comercial de la sucursal.
   */
  @ApiProperty({
    example: 'Éxito Panamericana',
    description: 'Nombre de la tienda',
    maxLength: 150,
  })
  @IsString({ message: 'El nombre de la tienda debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la tienda es obligatorio y no puede estar vacío' })
  @MaxLength(150, { message: 'El nombre de la tienda no puede superar los 150 caracteres' })
  name: string;

  /**
   * Cadena o marca a la que pertenece la tienda.
   */
  @ApiProperty({
    example: 'Éxito',
    description: 'Cadena comercial a la que pertenece la tienda',
    maxLength: 100,
  })
  @IsString({ message: 'La cadena debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La cadena es obligatoria y no puede estar vacía' })
  @MaxLength(100, { message: 'La cadena no puede superar los 100 caracteres' })
  chain: string;

  /**
   * Dirección física de la tienda.
   */
  @ApiProperty({
    example: 'Av. Panamericana # 22-10, Pasto, Nariño',
    description: 'Dirección de la tienda',
    maxLength: 255,
  })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria y no puede estar vacía' })
  @MaxLength(255, { message: 'La dirección no puede superar los 255 caracteres' })
  address: string;

  /**
   * Latitud en grados decimales.
   */
  @ApiProperty({
    example: 1.2136,
    description: 'Latitud en grados decimales (entre -90 y 90)',
  })
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @Min(-90, { message: 'La latitud no puede ser menor a -90' })
  @Max(90, { message: 'La latitud no puede ser mayor a 90' })
  latitude: number;

  /**
   * Longitud en grados decimales.
   */
  @ApiProperty({
    example: -77.2811,
    description: 'Longitud en grados decimales (entre -180 y 180)',
  })
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180, { message: 'La longitud no puede ser menor a -180' })
  @Max(180, { message: 'La longitud no puede ser mayor a 180' })
  longitude: number;

  /**
   * Horario de atención (opcional).
   */
  @ApiPropertyOptional({
    example: 'Lunes a sábado 8:00 - 20:00',
    description: 'Horario de atención de la tienda',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'El horario debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El horario no puede superar los 255 caracteres' })
  schedule?: string;
}
