import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { Store } from './entities/store.entity';

/**
 * StoresModule: Módulo funcional para la gestión de tiendas comerciales.
 * Agrupa StoresController (capa HTTP), StoresService (lógica) y registra
 * la entidad Store mediante TypeOrmModule.forFeature().
 */
@Module({
  imports: [TypeOrmModule.forFeature([Store])],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
