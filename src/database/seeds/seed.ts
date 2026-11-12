import dataSource from '../data-source';
import { List } from '../../lists/entities/list.entity';
import { Store } from '../../stores/entities/store.entity';

/** Tiendas de ejemplo de Pasto. */
const STORES: Partial<Store>[] = [
  {
    name: 'Éxito Panamericana',
    chain: 'Éxito',
    address: 'Av. Panamericana # 22-10, Pasto, Nariño',
    latitude: 1.2136,
    longitude: -77.2811,
    schedule: 'Lunes a domingo 8:00 - 21:00',
  },
  {
    name: 'Alkosto Centro',
    chain: 'Alkosto',
    address: 'Calle 19 # 20-56, Centro, Pasto, Nariño',
    latitude: 1.2142,
    longitude: -77.2795,
    schedule: 'Lunes a domingo 8:00 - 21:00',
  },
  {
    name: 'Supermercado Amorel',
    chain: 'Amorel',
    address: 'Carrera 27 # 16-45, San Andrés, Pasto, Nariño',
    latitude: 1.2108,
    longitude: -77.2771,
    schedule: 'Lunes a sábado 7:00 - 20:00',
  },
];

/** Listas de compras de ejemplo. */
const LISTS: Partial<List>[] = [
  {
    name: 'Compras semanales del hogar',
    items: ['Leche', 'Huevos', 'Pan artesanal', 'Café de Nariño'],
  },
  {
    name: 'Artículos de despensa',
    items: ['Arroz', 'Aceite vegetal', 'Sal marina', 'Lentejas'],
  },
];

/**
 * Carga datos de ejemplo de Pasto solo si no existen (se puede ejecutar varias veces).
 * Las tiendas se buscan por cadena y dirección; las listas, por nombre.
 */
async function seed(): Promise<void> {
  await dataSource.initialize();
  const stores = dataSource.getRepository(Store);
  const lists = dataSource.getRepository(List);
  let created = 0;
  let existing = 0;

  try {
    for (const data of STORES) {
      const found = await stores.findOneBy({
        chain: data.chain,
        address: data.address,
      });
      if (found) {
        existing++;
      } else {
        await stores.save(stores.create(data));
        created++;
      }
    }

    for (const data of LISTS) {
      const found = await lists.findOneBy({ name: data.name });
      if (found) {
        existing++;
      } else {
        await lists.save(lists.create(data));
        created++;
      }
    }

    console.log(`Seed completado: ${created} creados, ${existing} ya existían.`);
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Error al ejecutar el seed:', error);
  process.exit(1);
});
