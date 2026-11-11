import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Esquema inicial: categories, lists, products, stores y prices con sus relaciones.
 */
export class InitialSchema1794438895587 implements MigrationInterface {
  name = 'InitialSchema1794438895587';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "lists" ("id" SERIAL NOT NULL, "name" character varying(150) NOT NULL, "items" text array NOT NULL DEFAULT '{}', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_268b525e9a6dd04d0685cb2aaaa" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "products" ("id" SERIAL NOT NULL, "name" character varying(150) NOT NULL, "brand" character varying(100), "barcode" character varying(50), "category_id" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_adfc522baf9d9b19cd7d9461b7e" UNIQUE ("barcode"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "stores" ("id" SERIAL NOT NULL, "name" character varying(150) NOT NULL, "chain" character varying(100) NOT NULL, "address" character varying(255) NOT NULL, "latitude" numeric(9,6) NOT NULL, "longitude" numeric(9,6) NOT NULL, "schedule" character varying(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "uq_stores_chain_address" UNIQUE ("chain", "address"), CONSTRAINT "PK_7aa6e7d71fa7acdd7ca43d7c9cb" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "prices" ("id" SERIAL NOT NULL, "price" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'COP', "source" character varying(50) NOT NULL DEFAULT 'scraper', "scraped_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "product_id" integer NOT NULL, "store_id" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "uq_prices_product_store_scraped_at" UNIQUE ("product_id", "store_id", "scraped_at"), CONSTRAINT "PK_2e40b9e4e631a53cd514d82ccd2" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "prices" ADD CONSTRAINT "FK_144765f6b6bef86e113b507ed12" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "prices" ADD CONSTRAINT "FK_d40677e55be7ce9975032e278e4" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prices" DROP CONSTRAINT "FK_d40677e55be7ce9975032e278e4"`);
    await queryRunner.query(`ALTER TABLE "prices" DROP CONSTRAINT "FK_144765f6b6bef86e113b507ed12"`);
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`);
    await queryRunner.query(`DROP TABLE "prices"`);
    await queryRunner.query(`DROP TABLE "stores"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "lists"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
