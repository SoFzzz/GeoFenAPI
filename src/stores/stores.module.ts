import { Module } from '@nestjs/common';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';

/**
 * StoresModule: Módulo funcional para la gestión y consulta de tiendas comerciales.
 * Agrupa StoresController (capa HTTP) y StoresService (lógica y datos).
 */
@Module({
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
