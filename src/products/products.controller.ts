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
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

/**
 * ProductsController: Controlador HTTP para el recurso '/products'.
 * Expone operaciones CRUD con filtro opcional por categoría.
 */
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * GET /products?categoryId=1
   */
  @Get()
  @ApiOperation({ summary: 'Obtener catálogo de productos (filtro opcional por categoría)' })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'ID de categoría para filtrar productos',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Listado de productos obtenido exitosamente.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada (si se filtra).' })
  async findAll(@Query('categoryId') categoryId?: string): Promise<Product[]> {
    const parsedCategoryId = categoryId ? parseInt(categoryId, 10) : undefined;
    return this.productsService.findAll(parsedCategoryId);
  }

  /**
   * GET /products/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({ name: 'id', description: 'ID numérico del producto', example: 1 })
  @ApiResponse({ status: 200, description: 'Producto encontrado.' })
  @ApiResponse({ status: 400, description: 'ID no numérico.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  /**
   * POST /products
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo producto' })
  @ApiResponse({ status: 201, description: 'Producto registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de validación inválidos.' })
  @ApiResponse({ status: 404, description: 'Categoría especificada no encontrada.' })
  @ApiResponse({ status: 409, description: 'Código de barras duplicado.' })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  /**
   * PATCH /products/:id
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente un producto' })
  @ApiParam({ name: 'id', description: 'ID numérico del producto a actualizar', example: 1 })
  @ApiResponse({ status: 200, description: 'Producto actualizado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de validación o ID inválidos.' })
  @ApiResponse({ status: 404, description: 'Producto o categoría no encontrados.' })
  @ApiResponse({ status: 409, description: 'Código de barras en conflicto con otro producto.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * DELETE /products/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto por ID' })
  @ApiParam({ name: 'id', description: 'ID numérico del producto a eliminar', example: 1 })
  @ApiResponse({ status: 200, description: 'Producto eliminado exitosamente.' })
  @ApiResponse({ status: 400, description: 'ID no numérico.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.productsService.remove(id);
  }
}
