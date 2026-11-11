import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

/**
 * CategoriesService: lógica de negocio para categorías de productos.
 */
@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /** Retorna todas las categorías ordenadas por nombre. */
  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }

  /** Retorna una categoría por id. */
  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return category;
  }

  /** Crea una categoría. Rechaza nombres duplicados. */
  async create(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findOneBy({ name: dto.name });

    if (existing) {
      throw new ConflictException(
        `Ya existe la categoría "${dto.name}"`,
      );
    }

    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  /** Actualiza parcialmente una categoría. */
  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (dto.name && dto.name !== category.name) {
      const duplicated = await this.categoryRepository.findOneBy({ name: dto.name });
      if (duplicated) {
        throw new ConflictException(`Ya existe la categoría "${dto.name}"`);
      }
    }

    this.categoryRepository.merge(category, dto);
    return this.categoryRepository.save(category);
  }

  /** Elimina una categoría por id. */
  async remove(id: number): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    return { message: `Categoría con ID ${id} eliminada exitosamente` };
  }
}
