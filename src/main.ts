import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { requestLogger } from './common/middleware/request-logger.middleware';

/**
 * Punto de entrada principal de GeoFen API.
 * Configura los pipes globales de validación y la documentación interactiva Swagger/OpenAPI.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Registra cada petición (método, ruta, estado y duración) y unifica el
   * formato de los errores con el filtro global.
   */
  app.use(requestLogger);
  app.useGlobalFilters(new AllExceptionsFilter());

  /**
   * VALIDATIONPIPE GLOBAL:
   * Intercepta todas las peticiones entrantes antes de llegar a los controladores.
   * - whitelist: true -> Filtra y descarta automáticamente cualquier propiedad
   *   enviada en el JSON que no esté explícitamente declarada en los DTOs,
   *   evitando vulnerabilidades de asignación masiva (Mass Assignment).
   * - forbidNonWhitelisted: true -> En lugar de descartarlas, responde 400 si llega
   *   alguna propiedad no declarada (en el cuerpo o en la query).
   * - transform: true -> Transforma los payloads a instancias reales de las clases DTO.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  /**
   * CONFIGURACIÓN DE SWAGGER (OpenAPI):
   * Expone una interfaz gráfica interactiva en la ruta '/api' para probar
   * los endpoints directamente desde el navegador web.
   */
  const config = new DocumentBuilder()
    .setTitle('GeoFen API REST')
    .setDescription(
      'API RESTful didáctica para la gestión de listas de compras y consulta de tiendas cercanas. ' +
      'Construida con NestJS para la sustentación de arquitectura de software.',
    )
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .addTag('lists', 'Operaciones CRUD para listas de compras')
    .addTag('stores', 'Gestión de tiendas comerciales')
    .addTag('categories', 'Gestión de categorías de productos')
    .addTag('products', 'Catálogo de productos con marca y categoría')
    .addTag('prices', 'Reporte y consulta de precios de productos por tienda')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`GeoFen API iniciada en http://localhost:${port}`);
  logger.log(`Swagger OpenAPI en http://localhost:${port}/api`);
}

bootstrap();
