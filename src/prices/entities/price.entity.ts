import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Store } from '../../stores/entities/store.entity';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';

/**
 * Entidad Price: reporte de precio para un producto en una tienda específica.
 *
 * Incluye el valor numérico (con decimalTransformer), moneda ISO (ej. 'COP'),
 * fuente del dato (ej. 'scraper', 'manual') y fecha en que fue extraído/reportado.
 * La restricción única (producto, tienda, scrapedAt) evita reportes duplicados;
 * el mismo precio con otra fecha queda como historial.
 */
@Entity({ name: 'prices' })
@Unique('uq_prices_product_store_scraped_at', ['productId', 'storeId', 'scrapedAt'])
export class Price {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  price: number;

  @Column({ type: 'varchar', length: 3, default: 'COP' })
  currency: string;

  @Column({ type: 'varchar', length: 50, default: 'scraper' })
  source: string;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'scraped_at',
  })
  scrapedAt: Date;

  @ManyToOne(() => Product, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id' })
  productId: number;

  @ManyToOne(() => Store, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ name: 'store_id' })
  storeId: number;

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
