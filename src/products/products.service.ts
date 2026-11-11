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
  async findAll(categoryId?: number): Promise<Product[]> {
    if (categoryId) {
      await this.categoriesService.findOne(categoryId);
      return this.productRepository.find({
        where: { categoryId },
        order: { name: 'ASC' },
      });
    }

    return this.productRepository.find({ order: { id: 'ASC' } });
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
