import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Agrega la columna generada stores.location (geography Point 4326) calculada
 * desde latitude y longitude, con su índice GIST. Requiere la extensión PostGIS.
 */
export class AddStoreLocation1794439066886 implements MigrationInterface {
  name = 'AddStoreLocation1794439066886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS postgis');
    await queryRunner.addColumn(
      'stores',
      new TableColumn({
        name: 'location',
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
        generatedType: 'STORED',
        asExpression:
          'ST_SetSRID(ST_MakePoint(longitude::double precision, latitude::double precision), 4326)::geography',
      }),
    );
    await queryRunner.query(
      'CREATE INDEX "idx_stores_location" ON "stores" USING gist ("location")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."idx_stores_location"');
    await queryRunner.dropColumn('stores', 'location');
  }
}
