# GeoFen Scraper

Programa aparte de la API que obtiene precios de productos en supermercados de Pasto y los envía a la API de GeoFen con `POST /prices/bulk`. La API no hace scraping: solo recibe datos.

---

## 1. Qué hace

En cada ejecución:

- Sincroniza el catálogo de productos (`data/catalog.json`) y las tiendas de la ciudad (`data/stores.json`) con la API.
- Consulta las fuentes de precios configuradas (`file` y `olimpica`).
- Asigna el precio de cada cadena a todas sus tiendas registradas.
- Envía los precios a la API en lotes.

---

## 2. Requisitos y configuración

- **Node.js 22** o superior (`engines` en `package.json`).
- La **API corriendo** en `API_URL`. Incluso en dry run el scraper lee categorías, productos y tiendas de la API.
- La API con su `SCRAPER_API_KEY` definida (ver la sección de autenticación del README principal).

```bash
cd scraper
npm install
cp .env.example .env
```

En `.env`, pon en `SCRAPER_API_KEY` la **misma clave** que `SCRAPER_API_KEY` del `.env` de la API. No subas el `.env` al repositorio.

| Variable | Valor por defecto | Descripción |
| :--- | :--- | :--- |
| `API_URL` | `http://localhost:3000` | URL base de la API de GeoFen |
| `SCRAPER_API_KEY` | (ninguno) | Clave que se envía en el header `x-api-key`. Es obligatoria solo cuando `DRY_RUN=false` |
| `CITY` | `Pasto` | Ciudad a sincronizar. Debe coincidir con el campo `city` de `data/stores.json` |
| `DRY_RUN` | `true` | Si es `true`, no escribe nada en la API; solo muestra lo que enviaría |
| `REQUEST_DELAY_MS` | `1500` | Pausa, en milisegundos, entre peticiones a sitios web (fuente `olimpica`) |
| `SOURCES` | `file` | Fuentes separadas por coma. Valores válidos: `file`, `olimpica` |

Si `DRY_RUN` no está en el `.env`, el valor por defecto es `true`: el scraper no envía nada hasta que lo pongas en `false`.

---

## 3. Cómo ejecutarlo

### Scripts

| Comando | Qué hace |
| :--- | :--- |
| `npm run scrape` | Ejecuta con la configuración del `.env` (`npm start` es equivalente) |
| `npm run scrape:dry` | Dry run con las fuentes `file,olimpica`. No envía nada a la API, pero **sí consulta olimpica.com** |
| `npm run scrape:file` | Ejecuta solo la fuente `file`, con la configuración del `.env` |
| `npm test` | Pruebas unitarias (configuración, conversión de precios, normalización y parser de Olímpica). No necesitan API ni internet |
| `npm run typecheck` | Revisa los tipos de TypeScript sin generar archivos |
| `npm run build` | Compila el proyecto con `tsc` |

### Flags

Los flags se pasan después de `--` cuando se usa `npm run`:

| Flag | Descripción |
| :--- | :--- |
| `--dry-run` | Fuerza el dry run para esa ejecución. No puede desactivarlo: para enviar datos reales usa `DRY_RUN=false` en el `.env` |
| `--source=file,olimpica` | Fuentes a consultar. Reemplaza `SOURCES` del `.env` (también acepta `--sources=`) |
| `--limit=N` | Consulta solo los primeros `N` productos del catálogo, en las fuentes web (`olimpica`). Entero mayor o igual a `1` |

Cualquier otro argumento hace que el scraper termine con error.

```bash
npm run scrape -- --dry-run --source=olimpica --limit=3
```

### Recomendación: empezar con dry run

1. Levanta la API (`npm run start:dev` en la raíz del proyecto).
2. Ejecuta `npm test`.
3. Prueba sin enviar nada: `npm run scrape:file` (con `DRY_RUN=true` en el `.env`).
4. Prueba la fuente web con pocos productos: `npm run scrape -- --dry-run --source=olimpica --limit=3`.
5. Revisa el resumen y la muestra de precios que imprime.
6. Solo entonces pon `DRY_RUN=false` y ejecuta `npm run scrape`.

---

## 4. Flujo de una ejecución

1. **Catálogo:** lee `data/catalog.json`. Crea en la API las categorías que falten y los productos cuyo `barcode` no exista (`GET` y `POST` de `/categories` y `/products`).
2. **Tiendas:** lee `data/stores.json` y las envía con `POST /stores/bulk` (upsert por cadena y dirección). Luego lee las tiendas de la API para conocer sus IDs. Si una tienda no aparece, queda en el resumen como "sin registrar".
3. **Fuentes:** cada fuente recibe la lista de productos y devuelve precios por cadena y código de barras. El límite `--limit` solo aplica a las fuentes web.
4. **Asignación:** cada precio se copia a todas las tiendas de su cadena. Se omiten los productos sin ID en la API y las cadenas sin tiendas registradas; ambos casos aparecen en el resumen. Todos los precios de una ejecución comparten el mismo `scrapedAt` (la hora de inicio).
5. **Envío:** los precios se mandan a `POST /prices/bulk` en lotes de máximo **1000**. Entre lotes espera **6,5 s**, porque la API limita las cargas masivas a 10 peticiones por minuto. Si la API responde `429`, el cliente reintenta hasta 2 veces esperando lo que indique el servidor. Cada petición tiene un tiempo máximo de 15 s.

Al final se imprime un resumen con las categorías, productos y tiendas creados, los precios por fuente y los lotes enviados con `received`, `saved` y `duplicates`.

---

## 5. Fuentes

### `olimpica`

Consulta la API pública de catálogo (VTEX) de [olimpica.com](https://www.olimpica.com) buscando cada producto por su código de barras (EAN):

```
https://www.olimpica.com/api/catalog_system/pub/products/search?fq=alternateIds_Ean:<EAN>
```

- Hace **una petición por producto**, con una pausa de `REQUEST_DELAY_MS` entre ellas. Con 12 productos y la pausa por defecto, tarda unos 18 segundos.
- Se identifica con el header `User-Agent: GeoFenScraper/0.1 (proyecto academico)`.
- Según el equipo, el `robots.txt` de olimpica.com permite este acceso.
- Solo toma el producto cuyo EAN coincide exactamente, usa el precio del primer vendedor y descarta las ofertas sin stock o con precio no positivo.
- Si una petición falla, registra el error y sigue con el siguiente producto.

### `file`

Lee `data/sample-prices.json`.

> **Atención:** estos precios son de **EJEMPLO**, cargados a mano para la demo. **No son precios reales.** Cubren las cadenas Éxito, Alkosto y Amorel, con la fuente `manual`. Los códigos que no estén en el catálogo se omiten con una advertencia.

---

## 6. Limitaciones

- **Precio de Olímpica:** es el precio de la tienda en línea por defecto que devuelve la búsqueda pública. No es un precio verificado para Pasto.
- **Olímpica en Pasto:** no hay una sucursal verificada en Pasto. Por eso se registra como `Olímpica (tienda virtual)`, con dirección "Tienda virtual - olimpica.com" y coordenadas de **Barranquilla**. Por esa razón esta tienda **no aparece** en `GET /stores/nearby` con coordenadas de Pasto.
- **Éxito, Alkosto y Amorel no se consultan en línea:** Éxito tiene protección anti-bots, Alkosto no vende mercado en línea y Amorel no tiene tienda online. Sus precios vienen solo del archivo de ejemplo `file`.
- **Historial, no reemplazo:** cada ejecución genera un `scrapedAt` nuevo. Repetir el scraper **agrega historial** (nuevos registros de precio); no reemplaza los anteriores. Los duplicados solo se ignoran si se reenvía el mismo lote con el mismo `scrapedAt`.
- **Coordenadas aproximadas:** las coordenadas de `data/stores.json` son aproximadas.

---

## 7. Cómo extender el scraper

### Agregar un producto

Agrega un objeto en `data/catalog.json`, dentro de `products`:

```json
{ "name": "Arroz Diana 1 Kg", "brand": "Diana", "barcode": "7702511000021", "category": "Granos y arroz" }
```

- `barcode` debe ser el código de barras real (EAN). La fuente `olimpica` lo usa para buscar el producto.
- `category` es el nombre de la categoría. Si no existe en la API, se crea.

### Agregar una tienda

Agrega un objeto en `data/stores.json`, dentro de `stores`:

```json
{
  "name": "Éxito Panamericana",
  "chain": "Éxito",
  "address": "Av. Panamericana # 22-10, Pasto, Nariño",
  "latitude": 1.2136,
  "longitude": -77.2811,
  "schedule": "Lunes a domingo 8:00 - 21:00"
}
```

- `chain` debe coincidir con el nombre de la cadena que usan las fuentes. La comparación ignora tildes y mayúsculas, así que `Éxito` y `exito` son iguales.
- La tienda debe estar en la misma ciudad que `CITY`.
- Si ya existe una tienda con la misma cadena y dirección, la API la actualiza.

### Agregar una fuente

1. Crea `src/sources/<nombre>.ts` con una función que devuelva un `PriceSource` (ver `src/sources/source.ts`):

   ```ts
   export function createMiFuente(): PriceSource {
     return {
       name: 'mi-fuente',
       async fetchPrices(products: CatalogProduct[]): Promise<ScrapedPrice[]> {
         // devuelve { chain, barcode, price, currency, source, url? } por cada precio
       },
     };
   }
   ```

2. Regístrala en el objeto `SOURCES` de `src/index.ts`, con el nombre que se usará en `SOURCES` o `--source=`.
3. Si consulta un sitio web, usa `sleep(config.requestDelayMs)` entre peticiones, como hace `olimpica.ts`.
4. Agrega pruebas en `src/sources/<nombre>.parser.test.ts` (o similar) y ejecuta `npm test`.
