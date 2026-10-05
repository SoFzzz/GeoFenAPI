import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';

/**
 * StoresModule: Módulo funcional para el dominio de Tiendas comerciales.
 * Registra el proveedor StoresService para inyección de dependencias.
 */
@Module({
  controllers: [],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
