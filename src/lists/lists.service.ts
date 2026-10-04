import { Injectable, NotFoundException } from '@nestjs/common';
import { List } from './interfaces/list.interface';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';

/**
 * ListsService: Capa de lógica de negocio para la gestión de listas de compras.
 *
 * @Injectable() marca esta clase como un "Provider" dentro del contenedor IoC de NestJS.
 * Por defecto, NestJS maneja las dependencias bajo el patrón Singleton:
 * crea una única instancia de este servicio y la comparte en toda la aplicación,
 * ahorrando memoria y centralizando el estado en memoria.
 */
@Injectable()
export class ListsService {
  // Arreglo en memoria para persistencia temporal (sin base de datos externa)
  private lists: List[] = [
    {
      id: 1,
      name: 'Compras semanales del hogar',
      items: ['Leche', 'Huevos', 'Pan artesanal', 'Café de Nariño'],
    },
  ];

  // Contador interno para simular claves primarias auto-incrementables
  private currentId = 2;

  /**
   * Retorna todas las listas de compras registradas en memoria.
   */
  findAll(): List[] {
    return this.lists;
  }

  /**
   * Busca y retorna una lista por su ID.
   * Aplica la técnica de Retorno Temprano (Early Return) para evitar bloques 'else' innecesarios.
   */
  findOne(id: number): List {
    const list = this.lists.find((item) => item.id === id);

    if (!list) {
      throw new NotFoundException(`Lista de compras con ID ${id} no encontrada`);
    }

    return list;
  }

  /**
   * Registra una nueva lista de compras asignando un ID numérico autoincremental.
   */
  create(dto: CreateListDto): List {
    const newList: List = {
      id: this.currentId++,
      name: dto.name,
      items: dto.items,
    };
    this.lists.push(newList);
    return newList;
  }

  /**
   * Actualiza una lista existente buscando por su ID.
   * Versión base: busca el índice y actualiza los campos.
   */
  update(id: number, dto: UpdateListDto): List {
    const list = this.findOne(id);
    list.name = dto.name;
    list.items = dto.items;
    return list;
  }

  /**
   * Elimina una lista por su ID.
   */
  remove(id: number): { message: string } {
    const list = this.findOne(id);
    this.lists = this.lists.filter((item) => item.id !== list.id);
    return { message: `Lista con ID ${id} eliminada correctamente` };
  }
}
