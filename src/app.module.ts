import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsModule } from './lists/lists.module';
import { StoresModule } from './stores/stores.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { PricesModule } from './prices/prices.module';

/**
 * AppModule: Módulo raíz de la aplicación GeoFen API.
 * Importa los submódulos funcionales de Listas y Tiendas, además de la
 * configuración global y la conexión a PostgreSQL.
 *
 * ConfigModule.forRoot({ isGlobal: true }): Carga el archivo .env y expone
 * ConfigService en toda la aplicación sin tener que importar el módulo
 * en cada submódulo.
 *
 * TypeOrmModule.forRootAsync(): Configura la conexión de forma asíncrona para
 * poder inyectar ConfigService y leer las variables de entorno ya cargadas
 * (con forRoot estático el .env aún podría no estar disponible).
 *
 * autoLoadEntities: Registra automáticamente las entidades declaradas con
 * TypeOrmModule.forFeature() en cada módulo, evitando listarlas a mano aquí.
 *
 * synchronize: Crea/actualiza las tablas según las entidades. Es cómodo en
 * desarrollo, pero en producción DEBE ser false: un cambio en una entidad
 * podría alterar o borrar columnas y perder datos. Allí se usan migraciones.
 *
 * migrations / migrationsRun: Registra las migraciones de src/database/migrations
 * y, con DB_MIGRATIONS_RUN=true, las ejecuta al arrancar la aplicación.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
        migrations: [join(__dirname, 'database', 'migrations', '*.{ts,js}')],
        migrationsRun: config.get<string>('DB_MIGRATIONS_RUN') === 'true',
      }),
    }),
    ListsModule,
    StoresModule,
    CategoriesModule,
    ProductsModule,
    PricesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
