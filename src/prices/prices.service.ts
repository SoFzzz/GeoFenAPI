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
   * Reporta un nuevo precio para un producto en una tienda.
   * Valida existencia de producto y tienda previamente.
   */
  async reportPrice(dto: ReportPriceDto): Promise<Price> {
    await this.productsService.findOne(dto.productId);
    await this.storesService.findOne(dto.storeId);

    const price = this.priceRepository.create({
      ...dto,
      currency: dto.currency || 'COP',
      source: dto.source || 'scraper',
      scrapedAt: new Date(),
    });

    return this.priceRepository.save(price);
  }

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

    const scrapedAt = new Date();
    const prices = this.priceRepository.create(
      dtos.map((dto) => ({
        ...dto,
        currency: dto.currency || 'COP',
        source: dto.source || 'scraper',
        scrapedAt,
      })),
    );
    await this.priceRepository.save(prices);

    return { received: dtos.length, saved: prices.length };
  }
}
