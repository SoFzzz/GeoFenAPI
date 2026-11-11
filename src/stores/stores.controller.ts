import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { StoresService } from './stores.service';
import { BulkStoresDto } from './dto/bulk-stores.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Store } from './entities/store.entity';

/**
 * StoresController: Controlador HTTP para el recurso '/stores'.
 * Expone el CRUD de establecimientos comerciales.
 */
@ApiTags('stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  /**
   * GET /stores
   * Retorna todas las tiendas registradas.
   */
  @Get()
  @ApiOperation({ summary: 'Obtener el catálogo de tiendas comerciales' })
  @ApiResponse({ status: 200, description: 'Catálogo de tiendas obtenido exitosamente.' })
  async findAll(): Promise<Store[]> {
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
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Store> {
    return this.storesService.findOne(id);
  }

  /**
   * POST /stores
   * Crea una nueva tienda validando el cuerpo con CreateStoreDto.
   */
  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar una nueva tienda' })
  @ApiResponse({ status: 201, description: 'Tienda creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos en el cuerpo (class-validator).' })
  @ApiResponse({ status: 409, description: 'Ya existe una tienda con la misma cadena y dirección.' })
  async create(@Body() createStoreDto: CreateStoreDto): Promise<Store> {
    return this.storesService.create(createStoreDto);
  }

  @Post('bulk')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear o actualizar tiendas en lote (upsert por cadena y dirección)' })
  @ApiResponse({ status: 200, description: 'Lote procesado: cantidad recibida, creadas y actualizadas.' })
  @ApiResponse({ status: 400, description: 'Alguna tienda es inválida o el lote supera 500 elementos.' })
  @ApiResponse({ status: 401, description: 'API key inválida o ausente.' })
  async bulkUpsert(@Body() dto: BulkStoresDto) {
    return this.storesService.bulkUpsert(dto.stores);
  }

  /**
   * PATCH /stores/:id
   * Actualización parcial de una tienda existente.
   */
  @Patch(':id')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Actualizar parcialmente una tienda' })
  @ApiParam({ name: 'id', description: 'ID numérico de la tienda a actualizar', example: 1 })
  @ApiResponse({ status: 200, description: 'Tienda actualizada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos o ID inválidos.' })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada para actualizar.' })
  @ApiResponse({ status: 409, description: 'El cambio coincide con otra tienda por cadena y dirección.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<Store> {
    return this.storesService.update(id, updateStoreDto);
  }

  /**
   * DELETE /stores/:id
   * Elimina una tienda.
   */
  @Delete(':id')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Eliminar una tienda por su ID' })
  @ApiParam({ name: 'id', description: 'ID numérico de la tienda a eliminar', example: 1 })
  @ApiResponse({ status: 200, description: 'Tienda eliminada exitosamente.' })
  @ApiResponse({ status: 400, description: 'ID no numérico.' })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada para eliminar.' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.storesService.remove(id);
  }
}
