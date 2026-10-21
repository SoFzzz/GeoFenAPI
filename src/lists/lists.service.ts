import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from './entities/list.entity';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';

/**
 * ListsService: Lógica de negocio y persistencia de Listas mediante TypeORM.
 *
 * @Injectable(): Registra el servicio en el contenedor IoC.
 * NestJS instancia esta clase una sola vez (Patrón Singleton) y la inyecta
 * donde sea requerida.
 *
 * OnModuleInit: Interfaz del ciclo de vida de NestJS. Su método onModuleInit()
 * se ejecuta una vez que el módulo ya fue construido y sus dependencias están
 * listas, justo antes de que la aplicación empiece a atender peticiones.
 */
@Injectable()
export class ListsService implements OnModuleInit {
  /**
   * PATRÓN REPOSITORY:
   * Repository<List> es un objeto que encapsula todas las operaciones sobre la
   * tabla 'lists' (buscar, guardar, eliminar). El servicio no escribe SQL; le pide
   * al repositorio que lo haga y trabaja con objetos List.
   *
   * @InjectRepository(List): Decorador de @nestjs/typeorm que le indica al contenedor
   * de NestJS que inyecte el repositorio asociado a la entidad List (registrado
   * previamente en ListsModule con TypeOrmModule.forFeature).
   */
  constructor(
    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,
  ) {}

  /**
   * SEMILLA DE DATOS (Seed):
   * Al iniciar la aplicación se insertan las dos listas originales, pero solo
   * si la tabla está vacía. Así, reiniciar el servidor no duplica registros.
   */
  async onModuleInit(): Promise<void> {
    const total = await this.listsRepository.count();

    if (total > 0) {
      return;
    }

    await this.listsRepository.save([
      {
        name: 'Compras semanales del hogar',
        items: ['Leche', 'Huevos', 'Pan artesanal', 'Café de Nariño'],
      },
      {
        name: 'Artículos de despensa',
        items: ['Arroz', 'Aceite vegetal', 'Sal marina', 'Lentejas'],
      },
    ]);
  }

  /**
   * Obtiene la colección completa de listas ordenadas por ID ascendente.
   *
   * ASYNC / AWAIT:
   * Consultar la base de datos es una operación de E/S (red) que tarda un tiempo
   * indeterminado. 'async' permite que el método devuelva una Promesa, y 'await'
   * pausa esta función hasta que llegan los datos, sin bloquear el hilo principal
   * de Node.js mientras tanto.
   */
  async findAll(): Promise<List[]> {
    return this.listsRepository.find({ order: { id: 'ASC' } });
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
    const list = await this.listsRepository.findOneBy({ id });

    if (!list) {
      throw new NotFoundException(`Lista con ID ${id} no encontrada`);
    }

    return list;
  }

  /**
   * Crea y guarda una nueva lista en la base de datos.
   *
   * create() construye una instancia de List en memoria a partir del DTO (sin tocar
   * la BD). save() la inserta y devuelve la entidad con el ID que asignó PostgreSQL.
   */
  async create(dto: CreateListDto): Promise<List> {
    const newList = this.listsRepository.create(dto);
    return this.listsRepository.save(newList);
  }

  /**
   * Actualiza los datos de una lista existente mediante reemplazo total.
   *
   * Primero se busca la lista (si no existe, se lanza 404). Luego merge() copia
   * sobre la entidad encontrada las propiedades del DTO, conservando el ID
   * inmutable, y save() persiste los cambios.
   */
  async update(id: number, dto: UpdateListDto): Promise<List> {
    const list = await this.findOne(id);

    const updatedList = this.listsRepository.merge(list, dto);
    return this.listsRepository.save(updatedList);
  }

  /**
   * Elimina una lista de la base de datos.
   *
   * Se verifica primero la existencia con findOne() para responder 404 de forma
   * explícita. Como remove() limpia el ID de la entidad tras borrarla, guardamos
   * el 'id' original antes para construir el mensaje de respuesta.
   */
  async remove(id: number): Promise<{ message: string }> {
    const list = await this.findOne(id);

    await this.listsRepository.remove(list);
    return { message: `Lista con ID ${id} eliminada exitosamente` };
  }
}
