import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';

/**
 * StoresService: Capa de servicio de solo lectura para la consulta de tiendas cercanas.
 *
 * Sigue el mismo patrón @Injectable() con alcance Singleton que ListsService.
 *
 * Repository pattern: @InjectRepository(Store) entrega un Repository<Store> de TypeORM,
 * que es el encargado de ejecutar las consultas SQL sobre la tabla 'stores'.
 *
 * OnModuleInit: Hook de ciclo de vida de NestJS que se ejecuta una vez la base de datos
 * está conectada. Aquí se usa para cargar datos de ejemplo (seed) si la tabla está vacía.
 */
@Injectable()
export class StoresService implements OnModuleInit {
  // Tiendas precargadas de la ciudad de Pasto (Nariño) usadas como datos de ejemplo
  private readonly seedData: Partial<Store>[] = [
    {
      name: 'Éxito Panamericana',
      address: 'Av. Panamericana # 22-10, Pasto, Nariño',
    },
    {
      name: 'Alkosto Centro',
      address: 'Calle 19 # 20-56, Centro, Pasto, Nariño',
    },
    {
      name: 'Supermercado Amorel',
      address: 'Carrera 27 # 16-45, San Andrés, Pasto, Nariño',
    },
  ];

  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
  ) {}

  /**
   * Se ejecuta al iniciar el módulo. Inserta las tiendas de ejemplo solo si la
   * tabla está vacía, así evitamos duplicarlas en cada reinicio de la aplicación.
   */
  async onModuleInit(): Promise<void> {
    const total = await this.storesRepository.count();

    if (total === 0) {
      await this.storesRepository.save(this.seedData);
    }
  }

  /**
   * Retorna el listado completo de tiendas comerciales disponibles, ordenadas por id.
   */
  async findAll(): Promise<Store[]> {
    return this.storesRepository.find({ order: { id: 'ASC' } });
  }

  /**
   * Retorna una tienda específica por su identificador.
   * Aplica retorno temprano con NotFoundException si no existe.
   */
  async findOne(id: number): Promise<Store> {
    const store = await this.storesRepository.findOneBy({ id });

    if (!store) {
      throw new NotFoundException(`Tienda con ID ${id} no encontrada`);
    }

    return store;
  }
}
