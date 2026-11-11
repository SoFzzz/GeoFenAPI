import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { BulkThrottle } from '../common/throttle/bulk-throttle';
import { PricesService } from './prices.service';
import { BulkPricesDto } from './dto/bulk-prices.dto';
import { LatestPricesQueryDto } from './dto/latest-prices-query.dto';
import { PricesQueryDto } from './dto/prices-query.dto';
import { ReportPriceDto } from './dto/report-price.dto';
import { Price } from './entities/price.entity';

/**
 * PricesController: Controlador HTTP para el recurso '/prices'.
 * Expone consulta de precios con filtros e ingesta/reporte de precios.
 */
@ApiTags('prices')
@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  /**
   * GET /prices?productId=&storeId=
   */
  @Get()
  @ApiOperation({ summary: 'Consultar precios registrados con filtros opcionales' })
  @ApiQuery({
    name: 'productId',
    required: false,
    description: 'Filtrar precios por ID de producto',
    example: 1,
  })
  @ApiQuery({
    name: 'storeId',
    required: false,
    description: 'Filtrar precios por ID de tienda',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Listado de precios obtenido exitosamente.' })
  async findAll(@Query() query: PricesQueryDto): Promise<Price[]> {
    return this.pricesService.findAll(query.productId, query.storeId);
  }

  /**
   * GET /prices/latest?productId=
   * Declarado antes de cualquier ruta con parámetro para evitar choques.
   */
  @Get('latest')
  @ApiOperation({ summary: 'Precio más reciente de un producto en cada tienda' })
  @ApiQuery({
    name: 'productId',
    required: true,
    description: 'ID del producto',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Último precio por tienda obtenido exitosamente.' })
  @ApiResponse({ status: 400, description: 'productId ausente o inválido.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async findLatest(@Query() query: LatestPricesQueryDto): Promise<Price[]> {
    return this.pricesService.findLatestByProduct(query.productId);
  }

  @Post('bulk')
  @UseGuards(ApiKeyGuard)
  @BulkThrottle()
  @ApiSecurity('api-key')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Reportar precios en lote (todo o nada); los duplicados se ignoran' })
  @ApiResponse({ status: 201, description: 'Lote procesado: cantidad recibida, guardada y duplicada.' })
  @ApiResponse({ status: 400, description: 'Algún precio es inválido o el lote supera 1000 elementos.' })
  @ApiResponse({ status: 401, description: 'API key inválida o ausente.' })
  @ApiResponse({ status: 404, description: 'El lote referencia productos o tiendas inexistentes.' })
  @ApiResponse({ status: 429, description: 'Demasiadas peticiones: se superó el límite de ingesta masiva.' })
  async reportBulk(@Body() dto: BulkPricesDto) {
    return this.pricesService.reportBulk(dto.prices);
  }

  /**
   * POST /prices
   */
  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Reportar o registrar el precio de un producto en una tienda' })
  @ApiResponse({ status: 201, description: 'Precio nuevo guardado.' })
  @ApiResponse({ status: 200, description: 'Duplicado (mismo producto, tienda y scrapedAt): se ignora y se devuelve el existente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o precio no positivo.' })
  @ApiResponse({ status: 404, description: 'Producto o tienda no encontrados.' })
  async reportPrice(
    @Body() dto: ReportPriceDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Price> {
    const { price, created } = await this.pricesService.reportPrice(dto);
    res.status(created ? HttpStatus.CREATED : HttpStatus.OK);
    return price;
  }
}
