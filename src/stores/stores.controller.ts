import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { Store } from './entities/store.entity';

/**
 * StoresController: Controlador HTTP para el recurso '/stores'.
 * Expone operaciones de lectura para consultar establecimientos comerciales.
 */
@ApiTags('stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  /**
   * GET /stores
   * Retorna todas las tiendas precargadas en el sistema.
   */
  @Get()
  @ApiOperation({ summary: 'Obtener el catálogo de tiendas comerciales' })
  @ApiResponse({ status: 200, description: 'Catálogo de tiendas obtenido exitosamente.' })
  findAll(): Promise<Store[]> {
    return this.storesService.findAll();
  }

  /**
   * GET /stores/:id
   * Retorna el detalle de una tienda por su identificador.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener información de una tienda específica por ID' })
  @ApiParam({ name: 'id', description: 'ID numérico de la tienda', example: 1 })
  @ApiResponse({ status: 200, description: 'Tienda encontrada.' })
  @ApiResponse({ status: 400, description: 'ID no numérico.' })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Store> {
    return this.storesService.findOne(id);
  }
}
