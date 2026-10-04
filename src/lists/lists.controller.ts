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
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { List } from './interfaces/list.interface';

/**
 * ListsController: Capa de transporte y enrutamiento HTTP para el recurso '/lists'.
 *
 * @Controller('lists'): Prefijo de ruta base. Por convención RESTful, los recursos
 * se nombran en plural y nunca contienen verbos en la URL.
 *
 * Principio de Responsabilidad Única (SRP):
 * Este controlador ÚNICAMENTE recibe peticiones, aplica pipes de transformación/validación
 * y delega la ejecución al servicio. No contiene lógica de negocio ni persistencia.
 */
@Controller('lists')
export class ListsController {
  /**
   * Inyección de Dependencias (DI):
   * Al declarar 'private readonly listsService: ListsService' en los parámetros del constructor,
   * el contenedor de inversión de control (IoC) de NestJS resuelve e inyecta la instancia Singleton.
   */
  constructor(private readonly listsService: ListsService) {}

  /**
   * GET /lists
   * Retorna el listado completo de listas registradas.
   * Código HTTP por defecto: 200 OK.
   */
  @Get()
  findAll(): List[] {
    return this.listsService.findAll();
  }

  /**
   * GET /lists/:id
   * Obtiene el detalle de una lista específica.
   * ParseIntPipe: Transforma el parámetro de ruta 'id' (string) a número entero (number)
   * antes de pasarlo al método. Si el cliente envía 'abc', responde automáticamente con 400 Bad Request.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): List {
    return this.listsService.findOne(id);
  }

  /**
   * POST /lists
   * Crea una nueva lista de compras a partir de los datos validados del Body.
   * @HttpCode(HttpStatus.CREATED): Establece explícitamente el código HTTP 201 Created.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createListDto: CreateListDto): List {
    return this.listsService.create(createListDto);
  }

  /**
   * PUT /lists/:id
   * Reemplazo completo de una lista existente.
   * Código HTTP por defecto: 200 OK.
   */
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateListDto: UpdateListDto,
  ): List {
    return this.listsService.update(id, updateListDto);
  }

  /**
   * DELETE /lists/:id
   * Elimina una lista por su identificador único.
   * Código HTTP por defecto: 200 OK.
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): { message: string } {
    return this.listsService.remove(id);
  }
}
