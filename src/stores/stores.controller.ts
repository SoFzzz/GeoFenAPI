import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { Store } from './interfaces/store.interface';

/**
 * StoresController: Controlador HTTP para el recurso '/stores'.
 * Expone únicamente operaciones de lectura (GET) siguiendo el patrón de diseño MVP.
 */
@Controller('stores')
export class StoresController {
  /**
   * Inyección del servicio StoresService mediante el constructor.
   * NestJS proporciona la instancia singleton automáticamente.
   */
  constructor(private readonly storesService: StoresService) {}

  /**
   * GET /stores
   * Retorna la lista de tiendas comerciales disponibles.
   * Código HTTP: 200 OK.
   */
  @Get()
  findAll(): Store[] {
    return this.storesService.findAll();
  }

  /**
   * GET /stores/:id
   * Obtiene la información de una tienda por su identificador.
   * Utiliza ParseIntPipe para validar y transformar el parámetro 'id'.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Store {
    return this.storesService.findOne(id);
  }
}
