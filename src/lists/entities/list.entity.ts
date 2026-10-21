import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidad List: Representa la tabla 'lists' en PostgreSQL.
 *
 * @Entity('lists'): Indica a TypeORM que esta clase es un mapeo de una tabla
 * llamada 'lists'. Cada instancia de la clase corresponde a una fila.
 *
 * Esta clase reemplaza a la antigua interfaz List: una interfaz solo existe
 * en tiempo de compilación, mientras que una entidad existe en tiempo de
 * ejecución y permite leer y escribir registros reales en la base de datos.
 *
 * @ApiProperty: Documenta cada campo en el esquema OpenAPI (Swagger).
 */
@Entity('lists')
export class List {
  /**
   * @PrimaryGeneratedColumn(): Clave primaria autoincremental (SERIAL en PostgreSQL).
   * La base de datos asigna el ID, por eso no lo enviamos al crear una lista.
   */
  @ApiProperty({ example: 1, description: 'Identificador único autoincremental' })
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * @Column({ length: 120 }): Columna VARCHAR(120) con longitud máxima.
   */
  @ApiProperty({
    example: 'Compras semanales del hogar',
    description: 'Nombre descriptivo de la lista de compras',
    maxLength: 120,
  })
  @Column({ length: 120 })
  name: string;

  /**
   * @Column('text', { array: true }): Columna de tipo arreglo nativo de PostgreSQL (TEXT[]).
   * Permite guardar los artículos dentro de la misma fila, sin una tabla adicional.
   * default '{}' es el literal de arreglo vacío de PostgreSQL.
   */
  @ApiProperty({
    example: ['Leche', 'Huevos', 'Pan artesanal'],
    description: 'Artículos incluidos en la lista',
    type: [String],
  })
  @Column('text', { array: true, default: '{}' })
  items: string[];
}
