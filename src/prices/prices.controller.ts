import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PricesService } from './prices.service';
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
  async findAll(
    @Query('productId') productId?: string,
    @Query('storeId') storeId?: string,
  ): Promise<Price[]> {
    const parsedProductId = productId ? parseInt(productId, 10) : undefined;
    const parsedStoreId = storeId ? parseInt(storeId, 10) : undefined;
    return this.pricesService.findAll(parsedProductId, parsedStoreId);
  }

  /**
   * POST /prices
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Reportar o registrar el precio de un producto en una tienda' })
  @ApiResponse({ status: 201, description: 'Precio reportado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o precio no positivo.' })
  @ApiResponse({ status: 404, description: 'Producto o tienda no encontrados.' })
  async reportPrice(@Body() dto: ReportPriceDto): Promise<Price> {
    return this.pricesService.reportPrice(dto);
  }
}
