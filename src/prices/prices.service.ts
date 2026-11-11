import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Price } from './entities/price.entity';
import { ReportPriceDto } from './dto/report-price.dto';
import { Product } from '../products/entities/product.entity';
import { Store } from '../stores/entities/store.entity';
import { ProductsService } from '../products/products.service';
import { StoresService } from '../stores/stores.service';

/**
 * PricesService: Lógica de negocio y persistencia en PostgreSQL para Precios.
 * Inyecta ProductsService y StoresService para asegurar la integridad referencial.
 */
@Injectable()
export class PricesService {
  constructor(
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly productsService: ProductsService,
    private readonly storesService: StoresService,
  ) {}

  /**
   * Consulta precios reportados, con filtros opcionales por producto y tienda.
   */
  async findAll(productId?: number, storeId?: number): Promise<Price[]> {
    const where: FindOptionsWhere<Price> = {};

    if (productId) {
      where.productId = productId;
    }

    if (storeId) {
      where.storeId = storeId;
    }

    return this.priceRepository.find({
      where,
      order: { scrapedAt: 'DESC' },
    });
  }

  /**
   * Precio más reciente de un producto en cada tienda (incluye la tienda).
   * Lanza 404 si el producto no existe.
   */
  async findLatestByProduct(productId: number): Promise<Price[]> {
    await this.productsService.findOne(productId);

    return this.priceRepository
      .createQueryBuilder('price')
      .innerJoinAndSelect('price.store', 'store')
      .where('price.productId = :productId', { productId })
      .distinctOn(['price.storeId'])
      .orderBy('price.storeId', 'ASC')
      .addOrderBy('price.scrapedAt', 'DESC')
      .addOrderBy('price.id', 'DESC')
      .getMany();
  }

  /**
   * Reporta un precio para un producto en una tienda.
   * Si ya existe un reporte con el mismo producto, tienda y scrapedAt se ignora
   * y se devuelve el existente (created = false); si no, se guarda (created = true).
   */
  async reportPrice(
    dto: ReportPriceDto,
  ): Promise<{ price: Price; created: boolean }> {
    await this.productsService.findOne(dto.productId);
    await this.storesService.findOne(dto.storeId);

    const row = this.toRow(dto, new Date());
    const inserted = await this.insertIgnoringDuplicates([row]);

    const price = await this.priceRepository.findOneOrFail({
      where: {
        productId: row.productId,
        storeId: row.storeId,
        scrapedAt: row.scrapedAt,
      },
    });

    return { price, created: inserted > 0 };
  }

  /**
   * Reporta precios en lote (todo o nada ante inexistentes). Los duplicados,
   * tanto contra la base como dentro del mismo lote, se ignoran sin error.
   */
  async reportBulk(dtos: ReportPriceDto[]) {
    const productIds = [...new Set(dtos.map((dto) => dto.productId))];
    const storeIds = [...new Set(dtos.map((dto) => dto.storeId))];

    const [products, stores] = await Promise.all([
      this.productRepository.findBy({ id: In(productIds) }),
      this.storeRepository.findBy({ id: In(storeIds) }),
    ]);

    const missingProducts = productIds.filter(
      (id) => !products.some((product) => product.id === id),
    );
    const missingStores = storeIds.filter(
      (id) => !stores.some((store) => store.id === id),
    );

    if (missingProducts.length || missingStores.length) {
      throw new NotFoundException({
        message: 'El lote referencia productos o tiendas inexistentes',
        missingProductIds: missingProducts,
        missingStoreIds: missingStores,
      });
    }

    const now = new Date();
    const saved = await this.insertIgnoringDuplicates(
      dtos.map((dto) => this.toRow(dto, now)),
    );

    return {
      received: dtos.length,
      saved,
      duplicates: dtos.length - saved,
    };
  }

  /**
   * Convierte el DTO en la fila a insertar aplicando los valores por defecto.
   * Sin scrapedAt usa la fecha indicada (la actual).
   */
  private toRow(dto: ReportPriceDto, now: Date) {
    return {
      productId: dto.productId,
      storeId: dto.storeId,
      price: dto.price,
      currency: dto.currency || 'COP',
      source: dto.source || 'scraper',
      scrapedAt: dto.scrapedAt ? new Date(dto.scrapedAt) : now,
    };
  }

  /**
   * Inserta las filas con ON CONFLICT DO NOTHING sobre la restricción única
   * y devuelve cuántas se guardaron realmente.
   */
  private async insertIgnoringDuplicates(
    rows: ReturnType<PricesService['toRow']>[],
  ): Promise<number> {
    const result = await this.priceRepository
      .createQueryBuilder()
      .insert()
      .into(Price)
      .values(rows)
      .orIgnore()
      .returning('id')
      .execute();

    return result.raw.length;
  }
}
