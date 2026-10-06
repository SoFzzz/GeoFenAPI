import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { List } from './interfaces/list.interface';

/**
 * ListsController: Capa de transporte y enrutamiento HTTP para el recurso '/lists'.
 *
 * @ApiTags('lists'): Agrupa estos endpoints bajo la sección 'lists' en la documentación interactiva Swagger.
 * @Controller('lists'): Prefijo base en plural siguiendo buenas prácticas RESTful.
 */
@ApiTags('lists')
@Controller('lists')
export class ListsController {
  /**
   * Inyección de Dependencias (DI):
   * NestJS resuelve la instancia Singleton de ListsService en tiempo de inicio.
   */
  constructor(private readonly listsService: ListsService) {}

  /**
   * GET /lists
   * Retorna todas las listas de compras.
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las listas de compras registradas' })
  @ApiResponse({ status: 200, description: 'Listado recuperado exitosamente.' })
  findAll(): List[] {
    return this.listsService.findAll();
  }

  /**
   * GET /lists/:id
   * Busca una lista por su identificador numérico.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una lista específica por su ID' })
  @ApiParam({ name: 'id', description: 'ID numérico de la lista', example: 1 })
  @ApiResponse({ status: 200, description: 'Lista encontrada.' })
  @ApiResponse({ status: 400, description: 'ID no numérico (error de ParseIntPipe).' })
  @ApiResponse({ status: 404, description: 'Lista no encontrada en el sistema.' })
  findOne(@Param('id', ParseIntPipe) id: number): List {
    return this.listsService.findOne(id);
  }

  /**
   * POST /lists
   * Crea una nueva lista validando el cuerpo con CreateListDto.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva lista de compras' })
  @ApiResponse({ status: 201, description: 'Lista creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos en el cuerpo (class-validator).' })
  create(@Body() createListDto: CreateListDto): List {
    return this.listsService.create(createListDto);
  }

  /**
   * PUT /lists/:id
   * Reemplazo total de una lista existente.
   */
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar completamente una lista existente' })
  @ApiParam({ name: 'id', description: 'ID numérico de la lista a actualizar', example: 1 })
  @ApiResponse({ status: 200, description: 'Lista actualizada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos o ID inválidos.' })
  @ApiResponse({ status: 404, description: 'Lista no encontrada para actualizar.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateListDto: UpdateListDto,
  ): List {
    return this.listsService.update(id, updateListDto);
  }

  /**
   * DELETE /lists/:id
   * Elimina una lista de compras.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una lista de compras por su ID' })
  @ApiParam({ name: 'id', description: 'ID numérico de la lista a eliminar', example: 1 })
  @ApiResponse({ status: 200, description: 'Lista eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Lista no encontrada para eliminar.' })
  remove(@Param('id', ParseIntPipe) id: number): { message: string } {
    return this.listsService.remove(id);
  }
}
