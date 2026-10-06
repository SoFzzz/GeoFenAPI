import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object (DTO) para la actualización de una lista de compras.
 * Documentado con Swagger @ApiProperty para reflejar los tipos en /api.
 */
export class UpdateListDto {
  @ApiProperty({
    example: 'Compras semanales actualizadas',
    description: 'Nuevo nombre para la lista',
  })
  @IsString({ message: 'El nombre de la lista debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la lista no puede estar vacío' })
  name: string;

  @ApiProperty({
    example: ['Leche deslactosada', 'Avena', 'Frutas mixtas'],
    description: 'Arreglo actualizado de artículos',
    type: [String],
  })
  @IsArray({ message: 'Los items deben ser un arreglo de cadenas' })
  @IsString({ each: true, message: 'Cada item de la lista debe ser de tipo texto' })
  items: string[];
}
