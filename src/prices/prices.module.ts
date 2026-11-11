import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricesController } from './prices.controller';
import { PricesService } from './prices.service';
import { Price } from './entities/price.entity';
import { ProductsModule } from '../products/products.module';
import { StoresModule } from '../stores/stores.module';
import { Product } from '../products/entities/product.entity';
import { Store } from '../stores/entities/store.entity';

/**
 * PricesModule: Módulo funcional para la gestión y consulta de precios.
 * Importa ProductsModule y StoresModule para validar existencia de productos y tiendas.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Price, Product, Store]),
    ProductsModule,
    StoresModule,
  ],
  controllers: [PricesController],
  providers: [PricesService],
  exports: [PricesService],
})
export class PricesModule {}
