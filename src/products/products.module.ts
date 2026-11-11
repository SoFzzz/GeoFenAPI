import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CategoriesModule } from '../categories/categories.module';

/**
 * ProductsModule: Módulo funcional para la gestión del catálogo de productos.
 * Importa CategoriesModule para validar existencia de categorías asignadas.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CategoriesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
