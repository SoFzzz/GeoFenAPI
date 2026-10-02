import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Punto de entrada principal (Entry Point) del backend NestJS.
 * Crea la instancia del servidor HTTP Express a partir de AppModule.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`[GeoFen API] Servidor iniciado en http://localhost:${port}`);
}

bootstrap();
