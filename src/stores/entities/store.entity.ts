import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidad Store: Representa la tabla 'stores' en PostgreSQL.
 * Define los datos de una tienda comercial de GeoFen.
 *
 * @Entity('stores'): Indica a TypeORM el nombre de la tabla.
 * @PrimaryGeneratedColumn(): La base de datos genera el id automáticamente (autoincremental).
 * @Column(): Declara una columna; 'length' limita el tamaño de tipo VARCHAR.
 * @ApiProperty(): Documenta el campo en Swagger (no afecta a la base de datos).
 */
@Entity('stores')
export class Store {
  @ApiProperty({ example: 1, description: 'Identificador único de la tienda' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Éxito Panamericana', description: 'Nombre comercial de la tienda' })
  @Column({ length: 120 })
  name: string;

  @ApiProperty({
    example: 'Av. Panamericana # 22-10, Pasto, Nariño',
    description: 'Dirección física de la tienda',
  })
  @Column({ length: 200 })
  address: string;
}
