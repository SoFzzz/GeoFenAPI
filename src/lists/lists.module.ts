import { Module } from '@nestjs/common';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';

/**
 * ListsModule: Módulo funcional encargado de agrupar y encapsular el dominio de Listas.
 *
 * @Module(): Decorador que define los metadatos del módulo.
 * - controllers: Los controladores HTTP que pertenecen a este módulo (ListsController).
 * - providers: Los servicios o proveedores que serán instanciados por el inyector de dependencias (ListsService).
 */
@Module({
  controllers: [ListsController],
  providers: [ListsService],
})
export class ListsModule {}
