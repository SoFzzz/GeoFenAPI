import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoriesService } from '../categories/categories.service';
import { Paginated, pageOptions, paginated } from '../common/pagination';
import { ProductsQueryDto } from './dto/products-query.dto';

/**
 * ProductsService: Lógica de negocio y persistencia en PostgreSQL para Productos.
 *
 * Administra el catálogo base de productos (nombre, marca, código de barras y categoría).
 * Inyecta CategoriesService para validar que la categoría exista si se provee categoryId.
 */
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  /**
   * Retorna todos los productos, opcionalmente filtrados por categoría.
   */
  async findAll(query: ProductsQueryDto): Promise<Paginated<Product>> {
    const { categoryId } = query;

    if (categoryId) {
      await this.categoriesService.findOne(categoryId);
    }

    const [data, total] = await this.productRepository.findAndCount({
      where: categoryId ? { categoryId } : {},
      order: categoryId ? { name: 'ASC' } : { id: 'ASC' },
      ...pageOptions(query),
    });

    return paginated(data, total, query);
  }

  /**
   * Retorna un producto por su ID.
   */
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  /**
   * Crea un nuevo producto validando unicidad de barcode y existencia de categoría.
   */
  async create(dto: CreateProductDto): Promise<Product> {
    if (dto.categoryId) {
      await this.categoriesService.findOne(dto.categoryId);
    }

    if (dto.barcode) {
      const existing = await this.productRepository.findOneBy({
        barcode: dto.barcode,
      });
      if (existing) {
        throw new ConflictException(
          `Ya existe un producto con el código de barras ${dto.barcode}`,
        );
      }
    }

    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  /**
   * Actualiza parcialmente un producto existente.
   */
  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.categoryId && dto.categoryId !== product.categoryId) {
      await this.categoriesService.findOne(dto.categoryId);
    }

    if (dto.barcode && dto.barcode !== product.barcode) {
      const existing = await this.productRepository.findOneBy({
        barcode: dto.barcode,
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe un producto con el código de barras ${dto.barcode}`,
        );
      }
    }

    this.productRepository.merge(product, dto);
    return this.productRepository.save(product);
  }

  /**
   * Elimina un producto por ID.
   */
  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return { message: `Producto con ID ${id} eliminado exitosamente` };
  }
}
