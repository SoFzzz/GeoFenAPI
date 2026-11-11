import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { StoresService } from './stores.service';

/**
 * Pruebas unitarias de StoresService con un repositorio simulado.
 */
describe('StoresService', () => {
  let service: StoresService;
  const repo = {
    findOneBy: jest.fn(),
    create: jest.fn((dto) => ({ ...dto })),
    save: jest.fn(async (store) => ({ id: 1, ...store })),
    merge: jest.fn((store, dto) => Object.assign(store, dto)),
    remove: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const dto = {
    name: 'Exito Centro',
    chain: 'Exito',
    address: 'Calle 18 #25-10',
    latitude: 1.2136,
    longitude: -77.2811,
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    repo.create.mockImplementation((value) => ({ ...value }));
    repo.save.mockImplementation(async (store) => ({ id: 1, ...store }));
    repo.merge.mockImplementation((store, value) => Object.assign(store, value));

    const module = await Test.createTestingModule({
      providers: [
        StoresService,
        { provide: getRepositoryToken(Store), useValue: repo },
      ],
    }).compile();
    service = module.get(StoresService);
  });

  describe('create', () => {
    it('crea la tienda cuando no existe una igual', async () => {
      repo.findOneBy.mockResolvedValue(null);

      const result = await service.create(dto);

      expect(repo.findOneBy).toHaveBeenCalledWith({
        chain: dto.chain,
        address: dto.address,
      });
      expect(repo.save).toHaveBeenCalled();
      expect(result).toMatchObject({ id: 1, name: dto.name });
    });

    it('lanza 409 si ya existe la cadena en esa dirección', async () => {
      repo.findOneBy.mockResolvedValue({ id: 7, ...dto });

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('lanza 404 si la tienda no existe', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('actualiza cuando no hay conflicto', async () => {
      repo.findOneBy
        .mockResolvedValueOnce({ id: 1, ...dto })
        .mockResolvedValueOnce({ id: 1, ...dto });

      const result = await service.update(1, { name: 'Nuevo nombre' });

      expect(result.name).toBe('Nuevo nombre');
      expect(repo.save).toHaveBeenCalled();
    });

    it('lanza 409 si el cambio coincide con otra tienda', async () => {
      repo.findOneBy
        .mockResolvedValueOnce({ id: 1, ...dto })
        .mockResolvedValueOnce({ id: 2, ...dto, address: 'Otra' });

      await expect(
        service.update(1, { address: 'Otra' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('lanza 404 si la tienda a actualizar no existe', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.update(5, { name: 'x' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('lanza 404 si la tienda no existe', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.remove(5)).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.remove).not.toHaveBeenCalled();
    });

    it('elimina la tienda existente', async () => {
      repo.findOneBy.mockResolvedValue({ id: 1, ...dto });

      const result = await service.remove(1);

      expect(repo.remove).toHaveBeenCalled();
      expect(result.message).toContain('eliminada');
    });
  });

  describe('findNearby', () => {
    const builder = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawAndEntities: jest.fn(),
    };

    beforeEach(() => {
      for (const fn of Object.values(builder)) {
        if (fn !== builder.getRawAndEntities) fn.mockReturnThis();
      }
      repo.createQueryBuilder.mockReturnValue(builder);
      builder.getRawAndEntities.mockResolvedValue({
        entities: [{ id: 1, ...dto }],
        raw: [{ distance: '1234.5' }],
      });
    });

    it('filtra con ST_DWithin en metros y devuelve distanceKm en kilómetros', async () => {
      const result = await service.findNearby({
        lat: 1.2,
        lng: -77.2,
        radiusKm: 5,
      });

      expect(builder.where.mock.calls[0][0]).toContain('ST_DWithin');
      expect(builder.setParameters).toHaveBeenCalledWith({
        lat: 1.2,
        lng: -77.2,
        radiusMeters: 5000,
      });
      expect(builder.andWhere).not.toHaveBeenCalled();
      expect(result[0].distanceKm).toBe(1.23);
    });

    it('aplica el filtro por cadena cuando se indica', async () => {
      await service.findNearby({ lat: 1.2, lng: -77.2, radiusKm: 5, chain: 'Exito' });

      expect(builder.andWhere).toHaveBeenCalledWith(
        'LOWER(store.chain) = LOWER(:chain)',
        { chain: 'Exito' },
      );
    });
  });

  describe('bulkUpsert', () => {
    it('distingue tiendas creadas de actualizadas', async () => {
      repo.count.mockResolvedValue(1);
      const nueva = { ...dto, chain: 'Olimpica', address: 'Carrera 27' };

      const result = await service.bulkUpsert([dto, nueva]);

      expect(repo.upsert).toHaveBeenCalledWith(
        [dto, nueva],
        ['chain', 'address'],
      );
      expect(result).toEqual({ received: 2, created: 1, updated: 1 });
    });

    it('colapsa duplicados dentro del lote por cadena y dirección', async () => {
      repo.count.mockResolvedValue(0);

      const result = await service.bulkUpsert([
        dto,
        { ...dto, name: 'Repetida' },
      ]);

      expect(repo.upsert.mock.calls[0][0]).toHaveLength(1);
      expect(result).toEqual({ received: 2, created: 1, updated: 0 });
    });
  });
});
