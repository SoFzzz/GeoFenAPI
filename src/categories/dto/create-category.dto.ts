import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * DTO para la creación de una categoría de productos.
 */
export class CreateCategoryDto {
  @ApiProperty({
    example: 'Granos y cereales',
    description: 'Nombre de la categoría',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre de la categoría debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  name: string;
}
