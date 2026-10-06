import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object (DTO) para la creación de una lista de compras.
 * Incorpora decoradores de OpenAPI/Swagger (@ApiProperty) para documentar el esquema interactivo.
 */
export class CreateListDto {
  /**
   * Nombre descriptivo de la lista de compras.
   */
  @ApiProperty({
    example: 'Compras fin de semana',
    description: 'Nombre asignado a la lista de compras',
  })
  @IsString({ message: 'El nombre de la lista debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la lista es obligatorio y no puede estar vacío' })
  name: string;

  /**
   * Artículos o productos incluidos en la lista.
   */
  @ApiProperty({
    example: ['Leche', 'Arroz', 'Café', 'Manzanas'],
    description: 'Arreglo de nombres de productos o artículos',
    type: [String],
  })
  @IsArray({ message: 'Los items deben ser proporcionados en formato de arreglo' })
  @IsString({ each: true, message: 'Cada item dentro del arreglo debe ser una cadena de texto' })
  items: string[];
}
