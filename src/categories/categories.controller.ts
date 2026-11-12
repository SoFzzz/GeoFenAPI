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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

/**
 * CategoriesController: controlador HTTP para el recurso '/categories'.
 */
@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /** GET /categories */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  @ApiResponse({ status: 200, description: 'Lista de categorías.' })
  async findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  /** GET /categories/:id */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiParam({ name: 'id', description: 'ID de la categoría', example: 1 })
  @ApiResponse({ status: 200, description: 'Categoría encontrada.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  /** POST /categories */
  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una categoría' })
  @ApiResponse({ status: 201, description: 'Categoría creada.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 401, description: 'API key inválida o ausente.' })
  @ApiResponse({ status: 409, description: 'Categoría duplicada.' })
  async create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(dto);
  }

  /** PATCH /categories/:id */
  @Patch(':id')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Actualizar parcialmente una categoría' })
  @ApiParam({ name: 'id', description: 'ID de la categoría', example: 1 })
  @ApiResponse({ status: 200, description: 'Categoría actualizada.' })
  @ApiResponse({ status: 401, description: 'API key inválida o ausente.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  @ApiResponse({ status: 409, description: 'Nombre duplicado.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, dto);
  }

  /** DELETE /categories/:id */
  @Delete(':id')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Eliminar una categoría' })
  @ApiParam({ name: 'id', description: 'ID de la categoría', example: 1 })
  @ApiResponse({ status: 200, description: 'Categoría eliminada.' })
  @ApiResponse({ status: 401, description: 'API key inválida o ausente.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.categoriesService.remove(id);
  }
}
