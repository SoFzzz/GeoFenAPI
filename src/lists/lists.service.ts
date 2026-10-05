import { Injectable, NotFoundException } from '@nestjs/common';
import { List } from './interfaces/list.interface';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';

/**
 * ListsService: Lógica de negocio y persistencia en memoria para Listas.
 *
 * @Injectable(): Registra el servicio en el contenedor IoC.
 * NestJS instancia esta clase una sola vez (Patrón Singleton) y la inyecta
 * donde sea requerida, garantizando que el arreglo 'lists' conserve su estado.
 */
@Injectable()
export class ListsService {
  // Arreglo en memoria: Almacenamiento temporal de listas de compras
  private lists: List[] = [
    {
      id: 1,
      name: 'Compras semanales del hogar',
      items: ['Leche', 'Huevos', 'Pan artesanal', 'Café de Nariño'],
    },
    {
      id: 2,
      name: 'Artículos de despensa',
      items: ['Arroz', 'Aceite vegetal', 'Sal marina', 'Lentejas'],
    },
  ];

  // Generador de identificadores autoincrementables
  private currentId = 3;

  /**
   * Obtiene la colección completa de listas.
   */
  findAll(): List[] {
    return this.lists;
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
  findOne(id: number): List {
    const list = this.lists.find((item) => item.id === id);

    if (!list) {
      throw new NotFoundException(`Lista con ID ${id} no encontrada`);
    }

    return list;
  }

  /**
   * Agrega una nueva lista al arreglo en memoria.
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
   * Actualiza los datos de una lista existente mediante reemplazo total.
   *
   * Se utiliza el operador Spread (...existente, ...dto) para fusionar
   * las propiedades conservando el identificador inmutable.
   */
  update(id: number, dto: UpdateListDto): List {
    const index = this.lists.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(`Lista con ID ${id} no encontrada`);
    }

    // Reemplazo conservando el ID con spread operator
    const updatedList: List = {
      ...this.lists[index],
      name: dto.name,
      items: dto.items,
    };

    this.lists[index] = updatedList;
    return updatedList;
  }

  /**
   * Elimina una lista del almacenamiento en memoria.
   */
  remove(id: number): { message: string } {
    const index = this.lists.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(`Lista con ID ${id} no encontrada`);
    }

    this.lists.splice(index, 1);
    return { message: `Lista con ID ${id} eliminada exitosamente` };
  }
}
