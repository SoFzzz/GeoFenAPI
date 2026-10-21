import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { List } from './entities/list.entity';

/**
 * ListsModule: Módulo funcional encargado de agrupar y encapsular el dominio de Listas.
 *
 * @Module(): Decorador que define los metadatos del módulo.
 * - imports: Módulos de los que depende. TypeOrmModule.forFeature([List]) registra
 *   el repositorio de la entidad List en el contenedor de dependencias, de modo que
 *   pueda inyectarse con @InjectRepository(List) dentro de ListsService.
 * - controllers: Los controladores HTTP que pertenecen a este módulo (ListsController).
 * - providers: Los servicios o proveedores que serán instanciados por el inyector de dependencias (ListsService).
 */
@Module({
  imports: [TypeOrmModule.forFeature([List])],
  controllers: [ListsController],
  providers: [ListsService],
})
export class ListsModule {}
