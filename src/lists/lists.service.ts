import { Injectable, NotFoundException } from '@nestjs/common';
import { List } from './interfaces/list.interface';

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
}
