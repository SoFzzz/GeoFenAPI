import { IsArray, IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object (DTO) para la creación de una lista de compras.
 * Define la forma de los datos esperados en el cuerpo (Body) de la petición HTTP POST
 * y aplica reglas de validación automáticas en tiempo de ejecución.
 */
export class CreateListDto {
  /**
   * Nombre identificador de la lista.
   * @IsString(): Verifica que el valor recibido sea de tipo string.
   * @IsNotEmpty(): Rechaza cadenas vacías o compuestas únicamente por espacios.
   */
  @IsString({ message: 'El nombre de la lista debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la lista es obligatorio y no puede estar vacío' })
  name: string;

  /**
   * Arreglo con los nombres de los productos o artículos a comprar.
   * @IsArray(): Verifica que la propiedad sea un arreglo.
   * @IsString({ each: true }): Valida que cada elemento individual del arreglo sea un string.
   */
  @IsArray({ message: 'Los items deben ser proporcionados en formato de arreglo' })
  @IsString({ each: true, message: 'Cada item dentro del arreglo debe ser una cadena de texto' })
  items: string[];
}
