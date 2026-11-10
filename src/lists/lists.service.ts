import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from './entities/list.entity';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';

/**
 * ListsService: Lógica de negocio y persistencia en PostgreSQL para Listas.
 *
 * @Injectable(): Registra el servicio en el contenedor IoC.
 * NestJS instancia esta clase una sola vez (Patrón Singleton) y le inyecta
 * el repositorio de TypeORM de la entidad List.
 */
@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  /**
   * Obtiene la colección completa de listas ordenadas por id.
   */
  async findAll(): Promise<List[]> {
    return this.listRepository.find({ order: { id: 'ASC' } });
  }

  /**
   * Obtiene una lista por su identificador numérico.
   *
   * TÉCNICA DE RETORNO TEMPRANO (Early Return):
   * En lugar de anidar condicionales 'if (...) { ... } else { ... }',
   * evaluamos primero el caso de error / ausencia de datos y cortamos
   * la ejecución lanzando la excepción de inmediato. Esto mantiene el código
   * lineal, legible y libre de indentación innecesaria.
   */
  async findOne(id: number): Promise<List> {
    const list = await this.listRepository.findOneBy({ id });

    if (!list) {
      throw new NotFoundException(`Lista con ID ${id} no encontrada`);
    }

    return list;
  }

  /**
   * Crea y persiste una nueva lista.
   */
  async create(dto: CreateListDto): Promise<List> {
    const newList = this.listRepository.create({
      name: dto.name,
      items: dto.items,
    });

    return this.listRepository.save(newList);
  }

  /**
   * Actualiza los datos de una lista existente mediante reemplazo total.
   */
  async update(id: number, dto: UpdateListDto): Promise<List> {
    const list = await this.listRepository.findOneBy({ id });

    if (!list) {
      throw new NotFoundException(`Lista con ID ${id} no encontrada`);
    }

    list.name = dto.name;
    list.items = dto.items;

    return this.listRepository.save(list);
  }

  /**
   * Elimina una lista de la base de datos.
   */
  async remove(id: number): Promise<{ message: string }> {
    const list = await this.listRepository.findOneBy({ id });

    if (!list) {
      throw new NotFoundException(`Lista con ID ${id} no encontrada`);
    }

    await this.listRepository.remove(list);
    return { message: `Lista con ID ${id} eliminada exitosamente` };
  }
}
