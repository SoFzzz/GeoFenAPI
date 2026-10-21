import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { Store } from './entities/store.entity';

/**
 * StoresModule: Módulo funcional para la gestión y consulta de tiendas comerciales.
 * Agrupa StoresController (capa HTTP) y StoresService (lógica y datos).
 *
 * TypeOrmModule.forFeature([Store]): Registra el repositorio de la entidad Store
 * para poder inyectarlo en StoresService con @InjectRepository(Store).
 */
@Module({
  imports: [TypeOrmModule.forFeature([Store])],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
