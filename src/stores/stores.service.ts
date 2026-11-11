import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

/**
 * StoresService: Lógica de negocio y persistencia en PostgreSQL para Tiendas.
 *
 * Usa el repositorio de TypeORM inyectado con @InjectRepository.
 */
@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  /**
   * Retorna todas las tiendas ordenadas por id ascendente.
   */
  async findAll(): Promise<Store[]> {
    return this.storeRepository.find({ order: { id: 'ASC' } });
  }

  /**
   * Retorna una tienda por su identificador.
   * Aplica retorno temprano con NotFoundException si no existe.
   */
  async findOne(id: number): Promise<Store> {
    const store = await this.storeRepository.findOneBy({ id });

    if (!store) {
      throw new NotFoundException(`Tienda con ID ${id} no encontrada`);
    }

    return store;
  }

  /**
   * Crea una tienda. Rechaza duplicados por cadena y dirección.
   */
  async create(dto: CreateStoreDto): Promise<Store> {
    const existing = await this.storeRepository.findOneBy({
      chain: dto.chain,
      address: dto.address,
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una tienda de la cadena ${dto.chain} en la dirección ${dto.address}`,
      );
    }

    const store = this.storeRepository.create(dto);
    return this.storeRepository.save(store);
  }

  async bulkUpsert(dtos: CreateStoreDto[]) {
    const byKey = new Map(dtos.map((dto) => [`${dto.chain}|${dto.address}`, dto]));
    const unique = [...byKey.values()];

    const updated = await this.storeRepository.count({
      where: unique.map(({ chain, address }) => ({ chain, address })),
    });
    await this.storeRepository.upsert(unique, ['chain', 'address']);

    return {
      received: dtos.length,
      created: unique.length - updated,
      updated,
    };
  }

  /**
   * Actualiza parcialmente una tienda. Si el cambio coincide con otra tienda
   * por cadena y dirección, lanza ConflictException.
   */
  async update(id: number, dto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);
    this.storeRepository.merge(store, dto);

    const duplicated = await this.storeRepository.findOneBy({
      chain: store.chain,
      address: store.address,
    });

    if (duplicated && duplicated.id !== id) {
      throw new ConflictException(
        `Ya existe una tienda de la cadena ${store.chain} en la dirección ${store.address}`,
      );
    }

    return this.storeRepository.save(store);
  }

  /**
   * Elimina una tienda por su identificador.
   */
  async remove(id: number): Promise<{ message: string }> {
    const store = await this.findOne(id);
    await this.storeRepository.remove(store);
    return { message: `Tienda con ID ${id} eliminada exitosamente` };
  }
}
