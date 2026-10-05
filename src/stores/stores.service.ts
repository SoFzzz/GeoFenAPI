import { Injectable, NotFoundException } from '@nestjs/common';
import { Store } from './interfaces/store.interface';

/**
 * StoresService: Capa de servicio de solo lectura para la consulta de tiendas cercanas.
 *
 * Sigue el mismo patrón @Injectable() con alcance Singleton que ListsService.
 */
@Injectable()
export class StoresService {
  // Arreglo en memoria con 3 tiendas precargadas de la ciudad de Pasto (Nariño)
  private readonly stores: Store[] = [
    {
      id: 1,
      name: 'Éxito Panamericana',
      address: 'Av. Panamericana # 22-10, Pasto, Nariño',
    },
    {
      id: 2,
      name: 'Alkosto Centro',
      address: 'Calle 19 # 20-56, Centro, Pasto, Nariño',
    },
    {
      id: 3,
      name: 'Supermercado Amorel',
      address: 'Carrera 27 # 16-45, San Andrés, Pasto, Nariño',
    },
  ];

  /**
   * Retorna el listado completo de tiendas comerciales disponibles.
   */
  findAll(): Store[] {
    return this.stores;
  }

  /**
   * Retorna una tienda específica por su identificador.
   * Aplica retorno temprano con NotFoundException si no existe.
   */
  findOne(id: number): Store {
    const store = this.stores.find((item) => item.id === id);

    if (!store) {
      throw new NotFoundException(`Tienda con ID ${id} no encontrada`);
    }

    return store;
  }
}
