import { Module } from '@nestjs/common';
import { ListsModule } from './lists/lists.module';

/**
 * AppModule: Módulo raíz de la aplicación GeoFen API.
 * Importa los submódulos funcionales organizados por dominio.
 */
@Module({
  imports: [ListsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
