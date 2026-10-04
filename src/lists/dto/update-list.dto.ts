import { IsArray, IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object (DTO) para la actualización completa (PUT) de una lista de compras.
 * Requiere los mismos campos que la creación para garantizar el reemplazo total del recurso.
 */
export class UpdateListDto {
  @IsString({ message: 'El nombre de la lista debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la lista no puede estar vacío' })
  name: string;

  @IsArray({ message: 'Los items deben ser un arreglo de cadenas' })
  @IsString({ each: true, message: 'Cada item de la lista debe ser de tipo texto' })
  items: string[];
}
