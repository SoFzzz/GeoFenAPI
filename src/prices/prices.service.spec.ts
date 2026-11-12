import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Product } from '../products/entities/product.entity';
import { ProductsService } from '../products/products.service';
import { Store } from '../stores/entities/store.entity';
import { StoresService } from '../stores/stores.service';
import { BulkPricesDto } from './dto/bulk-prices.dto';
import { ReportPriceDto } from './dto/report-price.dto';
import { Price } from './entities/price.entity';
import { PricesService } from './prices.service';

/**
 * Valida un objeto plano con las reglas reales del DTO y devuelve los mensajes de error.
 */
async function errorsOf(plain: object): Promise<string[]> {
  const errors = await validate(plainToInstance(ReportPriceDto, plain));
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

/**
 * Pruebas de la ingesta de precios: validación del DTO y servicio con repositorios simulados.
 */
describe('Ingesta de precios', () => {
  const valid = { productId: 1, storeId: 1, price: 4500 };

  describe('ReportPriceDto', () => {
    it('acepta un reporte válido', async () => {
      expect(await errorsOf(valid)).toEqual([]);
    });

    it('rechaza un precio negativo o cero', async () => {
      expect(await errorsOf({ ...valid, price: -5 })).toContain(
        'El precio debe ser mayor a 0',
      );
      expect(await errorsOf({ ...valid, price: 0 })).not.toEqual([]);
    });

    it('rechaza una moneda inválida', async () => {
      expect(await errorsOf({ ...valid, currency: 'ZZZ' })).not.toEqual([]);
      expect(await errorsOf({ ...valid, currency: 'PESOS' })).not.toEqual([]);
    });

    it('normaliza la moneda en minúscula a mayúsculas', async () => {
      const dto = plainToInstance(ReportPriceDto, { ...valid, currency: 'usd' });

      expect(dto.currency).toBe('USD');
      expect(await validate(dto)).toHaveLength(0);
    });

    it('rechaza scrapedAt que no sea fecha ISO', async () => {
      expect(await errorsOf({ ...valid, scrapedAt: 'hola' })).not.toEqual([]);
    });

    it('valida cada elemento del lote', async () => {
      const bulk = plainToInstance(BulkPricesDto, {
        prices: [valid, { ...valid, price: -1 }],
      });

      expect(await validate(bulk)).not.toHaveLength(0);
    });
  });

  describe('PricesService', () => {
    let service: PricesService;
    const execute = jest.fn();
    const insertBuilder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      execute,
    };
    const priceRepo = {
      createQueryBuilder: jest.fn(() => insertBuilder),
      findOneOrFail: jest.fn(),
    };
    const productRepo = { findBy: jest.fn() };
    const storeRepo = { findBy: jest.fn() };
    const productsService = { findOne: jest.fn() };
    const storesService = { findOne: jest.fn() };

    beforeEach(async () => {
      jest.clearAllMocks();
      productsService.findOne.mockResolvedValue({ id: 1 });
      storesService.findOne.mockResolvedValue({ id: 1 });

      const module = await Test.createTestingModule({
        providers: [
          PricesService,
          { provide: getRepositoryToken(Price), useValue: priceRepo },
          { provide: getRepositoryToken(Product), useValue: productRepo },
          { provide: getRepositoryToken(Store), useValue: storeRepo },
          { provide: ProductsService, useValue: productsService },
          { provide: StoresService, useValue: storesService },
        ],
      }).compile();
      service = module.get(PricesService);
    });

    describe('reportPrice', () => {
      it('guarda el precio nuevo con valores por defecto (created = true)', async () => {
        execute.mockResolvedValue({ raw: [{ id: 10 }] });
        priceRepo.findOneOrFail.mockResolvedValue({ id: 10, ...valid });

        const result = await service.reportPrice(valid as ReportPriceDto);

        const [rows] = insertBuilder.values.mock.calls[0];
        expect(rows[0]).toMatchObject({
          currency: 'COP',
          source: 'scraper',
          price: 4500,
        });
        expect(rows[0].scrapedAt).toBeInstanceOf(Date);
        expect(result.created).toBe(true);
      });

      it('ignora el duplicado y devuelve el existente (created = false)', async () => {
        execute.mockResolvedValue({ raw: [] });
        priceRepo.findOneOrFail.mockResolvedValue({ id: 3, ...valid });

        const result = await service.reportPrice({
          ...valid,
          scrapedAt: '2026-11-10T10:00:00Z',
        } as ReportPriceDto);

        expect(result.created).toBe(false);
        expect(result.price.id).toBe(3);
        expect(priceRepo.findOneOrFail).toHaveBeenCalledWith({
          where: {
            productId: 1,
            storeId: 1,
            scrapedAt: new Date('2026-11-10T10:00:00Z'),
          },
        });
      });

      it('lanza 404 si el producto no existe', async () => {
        productsService.findOne.mockRejectedValue(new NotFoundException());

        await expect(
          service.reportPrice(valid as ReportPriceDto),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(execute).not.toHaveBeenCalled();
      });

      it('lanza 404 si la tienda no existe', async () => {
        storesService.findOne.mockRejectedValue(new NotFoundException());

        await expect(
          service.reportPrice(valid as ReportPriceDto),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(execute).not.toHaveBeenCalled();
      });
    });

    describe('reportBulk', () => {
      it('lanza 404 con los ids faltantes y no inserta nada', async () => {
        productRepo.findBy.mockResolvedValue([{ id: 1 }]);
        storeRepo.findBy.mockResolvedValue([{ id: 1 }]);

        await expect(
          service.reportBulk([
            valid,
            { ...valid, productId: 99, storeId: 77 },
          ] as ReportPriceDto[]),
        ).rejects.toMatchObject({
          response: { missingProductIds: [99], missingStoreIds: [77] },
        });
        expect(execute).not.toHaveBeenCalled();
      });

      it('informa guardados y duplicados ignorados', async () => {
        productRepo.findBy.mockResolvedValue([{ id: 1 }]);
        storeRepo.findBy.mockResolvedValue([{ id: 1 }]);
        execute.mockResolvedValue({ raw: [{ id: 1 }] });

        const result = await service.reportBulk([
          valid,
          valid,
          { ...valid, scrapedAt: '2026-11-10T10:00:00Z' },
        ] as ReportPriceDto[]);

        expect(insertBuilder.orIgnore).toHaveBeenCalled();
        expect(result).toEqual({ received: 3, saved: 1, duplicates: 2 });
      });
    });
  });
});
