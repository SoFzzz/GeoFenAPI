import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';

/**
 * Entidad Store: tienda comercial con su ubicación geográfica.
 * La restricción única (chain, address) evita duplicados de una misma sucursal.
 * La columna location es de solo lectura: PostgreSQL la calcula a partir de
 * latitude y longitude y un índice GIST acelera las búsquedas por radio.
 */
@Entity({ name: 'stores' })
@Unique('uq_stores_chain_address', ['chain', 'address'])
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  chain: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({
    type: 'decimal',
    precision: 9,
    scale: 6,
    transformer: decimalTransformer,
  })
  latitude: number;

  @Column({
    type: 'decimal',
    precision: 9,
    scale: 6,
    transformer: decimalTransformer,
  })
  longitude: number;

  /**
   * Punto geográfico (SRID 4326) generado por la base; no se lee ni se escribe desde la API.
   */
  @Index('idx_stores_location', { spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    generatedType: 'STORED',
    asExpression:
      'ST_SetSRID(ST_MakePoint(longitude::double precision, latitude::double precision), 4326)::geography',
    select: false,
    insert: false,
    update: false,
  })
  location?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  schedule: string | null;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt: Date;
}
