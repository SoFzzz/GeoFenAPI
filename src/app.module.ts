import { Module } from '@nestjs/common';
import { ListsModule } from './lists/lists.module';
import { StoresModule } from './stores/stores.module';

/**
 * AppModule: Módulo raíz de la aplicación GeoFen API.
 * Importa los submódulos funcionales de Listas y Tiendas.
 */
@Module({
  imports: [ListsModule, StoresModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
