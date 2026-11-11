import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

config({ quiet: true });

/**
 * DataSource para la CLI de TypeORM (migration:generate, migration:run, migration:revert).
 * Lee las mismas variables DB_* del .env que usa la aplicación. Las rutas
 * funcionan tanto en TypeScript (src) como compiladas (dist).
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
});
