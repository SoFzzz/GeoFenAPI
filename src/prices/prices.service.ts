import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Price } from './entities/price.entity';
import { ReportPriceDto } from './dto/report-price.dto';
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
}
