import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { PricesController } from '../src/prices/prices.controller';
import { PricesService } from '../src/prices/prices.service';

/**
 * Prueba HTTP de /prices con el ValidationPipe real y el servicio simulado (sin base de datos).
 */
describe('PricesController (e2e)', () => {
  let app: INestApplication;
  const service = {
    reportPrice: jest.fn(),
    reportBulk: jest.fn(),
    findAll: jest.fn(),
    findLatestByProduct: jest.fn(),
  };
  const headers = { 'x-api-key': 'clave-de-prueba' };
  const valid = { productId: 1, storeId: 1, price: 4500 };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [PricesController],
      providers: [
        { provide: PricesService, useValue: service },
        {
          provide: ConfigService,
          useValue: { get: () => 'clave-de-prueba' },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  it('POST /prices rechaza un precio negativo con 400', async () => {
    await request(app.getHttpServer())
      .post('/prices')
      .set(headers)
      .send({ ...valid, price: -10 })
      .expect(400);
    expect(service.reportPrice).not.toHaveBeenCalled();
  });

  it('POST /prices rechaza una moneda inválida con 400', async () => {
    await request(app.getHttpServer())
      .post('/prices')
      .set(headers)
      .send({ ...valid, currency: 'ZZZ' })
      .expect(400);
  });

  it('POST /prices normaliza la moneda y responde 201 si es nuevo', async () => {
    service.reportPrice.mockResolvedValue({ price: { id: 1 }, created: true });

    await request(app.getHttpServer())
      .post('/prices')
      .set(headers)
      .send({ ...valid, currency: 'usd' })
      .expect(201);
    expect(service.reportPrice.mock.calls[0][0].currency).toBe('USD');
  });

  it('POST /prices responde 200 si el precio ya existía', async () => {
    service.reportPrice.mockResolvedValue({ price: { id: 1 }, created: false });

    await request(app.getHttpServer())
      .post('/prices')
      .set(headers)
      .send(valid)
      .expect(200);
  });

  it('POST /prices/bulk rechaza un lote con un precio inválido', async () => {
    await request(app.getHttpServer())
      .post('/prices/bulk')
      .set(headers)
      .send({ prices: [valid, { ...valid, price: 0 }] })
      .expect(400);
  });

  it('POST /prices exige la API key', async () => {
    await request(app.getHttpServer()).post('/prices').send(valid).expect(401);
  });

  it('GET /prices/latest exige productId válido', async () => {
    await request(app.getHttpServer()).get('/prices/latest').expect(400);
    await request(app.getHttpServer())
      .get('/prices/latest?productId=abc')
      .expect(400);
  });
});
