import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { List } from './entities/list.entity';

/**
 * ListsModule: Módulo funcional encargado de agrupar y encapsular el dominio de Listas.
 *
 * @Module(): Decorador que define los metadatos del módulo.
 * - imports: Registra la entidad List con TypeOrmModule.forFeature().
 * - controllers: Los controladores HTTP que pertenecen a este módulo (ListsController).
 * - providers: Los servicios o proveedores que serán instanciados por el inyector de dependencias (ListsService).
 */
@Module({
  imports: [TypeOrmModule.forFeature([List])],
  controllers: [ListsController],
  providers: [ListsService],
})
export class ListsModule {}
