# GeoFen API REST

API RESTful construida con **NestJS** y **TypeScript** para la gestión de listas de compras y consulta de establecimientos comerciales de referencia. Diseñada bajo un enfoque arquitectónico modular, limpio y didáctico (KISS) para comprender en profundidad los conceptos esenciales de backend: **Módulos**, **Controladores**, **Servicios**, **DTOs**, **Inyección de Dependencias (DI)** y **persistencia con TypeORM**.

---

## 1. ¿Qué es GeoFen?

**GeoFen** es una plataforma orientada a la optimización de compras cotidianas. Permite a los usuarios crear sus listas de compras y, con base en su ubicación geográfica, descubrir tiendas cercanas y comparar precios de productos.

> **Alcance de esta entrega:**  
> Implementación del **núcleo backend base (MVP)**: una API RESTful con persistencia en **PostgreSQL** mediante **TypeORM**, documentada con **Swagger** y colecciones de **Postman**.

---

## 2. Arquitectura y Flujo de Datos

La aplicación sigue el patrón estándar de NestJS con separación estricta de responsabilidades (Single Responsibility Principle):

![Diagrama de Arquitectura GeoFen](docs/diagrama-geofen.png)

### Diagrama de Flujo en Texto
```
[ Cliente HTTP ] (Postman / Swagger)
       │
       ▼  HTTP Request (JSON + Verbo)
┌────────────────────────────────────────────────────────┐
│  ValidationPipe Global (main.ts)                       │
│  - Rechaza propiedades no declaradas con 400           │
│  - Valida reglas de tipo con class-validator           │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼  DTO Validado
┌────────────────────────────────────────────────────────┐
│  Controller (ListsController / StoresController)       │
│  - Define rutas y verbos HTTP (@Get, @Post, etc.)      │
│  - Transforma parámetros (@Param con ParseIntPipe)     │
│  - No tiene lógica de negocio                          │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼  Invocación de Método
┌────────────────────────────────────────────────────────┐
│  Service (@Injectable() - Singleton)                   │
│  - Contiene las reglas del negocio                     │
│  - Aplica Retorno Temprano (Early Return)              │
│  - Lanza excepciones nativas (NotFoundException, etc.) │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼  Lectura / Escritura (TypeORM)
┌────────────────────────────────────────────────────────┐
│  Persistencia en PostgreSQL (Docker Compose)           │
│  - Entidad List  -> tabla lists                        │
│  - Entidad Store -> tabla stores (único chain+address) │
│  - Entidad Category -> tabla categories                │
│  - Entidad Product -> tabla products (barcode)         │
│  - Entidad Price -> tabla prices (sin duplicados)      │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼  HTTP Response (200, 201, 400, 401, 404, 409, 429)
[ Cliente HTTP ] (Postman / Swagger)
```

---

## 3. Estructura del Proyecto

```text
geofen-api/
├── docs/
│   └── diagrama-geofen.png         # Diagrama de arquitectura del sistema
├── postman/
│   └── README.md                   # Guía de ejecución en Postman
├── src/
│   ├── lists/                      # Módulo de Listas de Compras (CRUD)
│   │   ├── dto/
│   │   │   ├── create-list.dto.ts  # Validaciones para creación
│   │   │   └── update-list.dto.ts  # Validaciones para actualización
│   │   ├── entities/
│   │   │   └── list.entity.ts      # Entidad TypeORM (tabla lists)
│   │   ├── lists.controller.ts     # Enrutamiento HTTP
│   │   ├── lists.module.ts         # Encapsulamiento del módulo
│   │   └── lists.service.ts        # Lógica de negocio y acceso a PostgreSQL
│   ├── stores/                     # Módulo de Tiendas (CRUD)
│   │   ├── dto/
│   │   │   ├── create-store.dto.ts # Validaciones para creación
│   │   │   ├── update-store.dto.ts # Actualización parcial (PartialType)
│   │   │   ├── bulk-stores.dto.ts  # Lote de tiendas del scraper (máx. 500)
│   │   │   └── nearby-stores-query.dto.ts # Parámetros de /stores/nearby
│   │   ├── entities/
│   │   │   └── store.entity.ts     # Entidad TypeORM (tabla stores)
│   │   ├── stores.controller.ts    # Enrutamiento HTTP
│   │   ├── stores.module.ts        # Encapsulamiento del módulo
│   │   ├── stores.service.ts       # Lógica de negocio y acceso a PostgreSQL
│   │   └── stores.service.spec.ts  # Pruebas unitarias del servicio
│   ├── categories/                 # Módulo de Categorías (CRUD)
│   │   ├── dto/
│   │   │   ├── create-category.dto.ts
│   │   │   └── update-category.dto.ts
│   │   ├── entities/
│   │   │   └── category.entity.ts  # Entidad TypeORM (tabla categories, name único)
│   │   ├── categories.controller.ts
│   │   ├── categories.module.ts
│   │   └── categories.service.ts
│   ├── products/                   # Módulo de Productos (CRUD y relación con Category)
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   ├── update-product.dto.ts
│   │   │   └── products-query.dto.ts # Paginación y filtro por categoría
│   │   ├── entities/
│   │   │   └── product.entity.ts   # Entidad TypeORM (tabla products, ManyToOne Category)
│   │   ├── products.controller.ts
│   │   ├── products.module.ts
│   │   └── products.service.ts
│   ├── prices/                     # Módulo de Precios (reporte y consulta)
│   │   ├── dto/
│   │   │   ├── report-price.dto.ts # Validación de reporte de precio (scrapedAt opcional)
│   │   │   ├── bulk-prices.dto.ts  # Lote de precios del scraper (máx. 1000)
│   │   │   ├── prices-query.dto.ts # Filtros opcionales productId y storeId de GET /prices
│   │   │   └── latest-prices-query.dto.ts # productId obligatorio de GET /prices/latest
│   │   ├── entities/
│   │   │   └── price.entity.ts     # Entidad TypeORM (tabla prices, ManyToOne Product y Store)
│   │   ├── prices.controller.ts
│   │   ├── prices.module.ts
│   │   ├── prices.service.ts
│   │   └── prices.service.spec.ts  # Pruebas unitarias del servicio
│   ├── auth/
│   │   └── api-key.guard.ts        # Valida el header x-api-key en los endpoints de escritura
│   ├── common/
│   │   ├── filters/
│   │   │   ├── all-exceptions.filter.ts      # Formato unificado de errores y traducción de PostgreSQL
│   │   │   └── all-exceptions.filter.spec.ts # Pruebas del filtro de errores
│   │   ├── middleware/
│   │   │   └── request-logger.middleware.ts  # Log de método, ruta, estado y duración
│   │   ├── pagination.ts           # DTO page/limit y respuesta paginada
│   │   ├── throttle/
│   │   │   └── bulk-throttle.ts    # Decorador @BulkThrottle (límite de carga masiva)
│   │   └── transformers/
│   │       └── decimal.transformer.ts # Convierte decimales de PostgreSQL a number
│   ├── database/
│   │   ├── data-source.ts          # DataSource para la CLI de migraciones
│   │   └── migrations/             # Migraciones TypeORM (esquema inicial y columna location)
│   ├── app.module.ts               # Módulo raíz: submódulos, TypeORM y límite de peticiones
│   └── main.ts                     # Bootstrap, ValidationPipe, filtro de errores y Swagger en /api
├── test/
│   ├── config-shim.ts              # Sustituto de @nestjs/config para las pruebas e2e
│   ├── typeorm-shim.ts             # Sustituto de @nestjs/typeorm para Jest (CommonJS)
│   ├── jest-e2e.json               # Configuración de Jest para npm run test:e2e
│   └── prices.e2e-spec.ts          # Pruebas HTTP de /prices (sin base de datos)
├── scraper/                        # Programa aparte que envía precios a la API (ver scraper/README.md)
│   ├── data/                       # Catálogo, tiendas y precios de ejemplo
│   ├── src/                        # Fuentes de precios, sincronización y envío en lotes
│   ├── .env.example                # Variables del scraper (SCRAPER_API_KEY, API_URL, DRY_RUN...)
│   └── README.md                   # Guía del scraper
├── geofen-collection.json          # Colección de Postman (local, no se versiona)
├── .env.example                    # Variables de entorno de ejemplo
├── docker-compose.yml              # PostgreSQL (PostGIS) y pgAdmin
├── jest.config.ts                  # Configuración de Jest para npm test
├── package.json                    # Dependencias y scripts
├── tsconfig.json                   # Configuración del compilador TypeScript
└── README.md                       # Documentación principal
```

---

## 4. Comandos Utilizados y Cómo Correr el Proyecto

### Dependencias Instaladas
El proyecto utiliza únicamente las librerías necesarias para cumplir el alcance:
```bash
# Dependencias principales del framework
npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs

# Validación de entradas y DTOs
npm install class-validator class-transformer

# Documentación interactiva OpenAPI / Swagger
npm install @nestjs/swagger

# Conexión a PostgreSQL con TypeORM y variables de entorno
npm install @nestjs/typeorm typeorm pg @nestjs/config
```

### Ejecución en Entorno Local

0. **Levantar la base de datos con Docker (requiere Docker Desktop):**
   ```bash
   cp .env.example .env
   docker compose up -d
   ```
   - PostgreSQL (imagen `postgis/postgis:15-3.4-alpine`) queda en `localhost:5433` (puerto configurable con `DB_PORT` en `.env`).
   - pgAdmin queda en `http://localhost:5050` con las credenciales `PGADMIN_EMAIL` y `PGADMIN_PASSWORD` del `.env`. Para registrar el servidor usar host `postgres`, puerto `5432`, usuario `DB_USERNAME` y contraseña `DB_PASSWORD` (por defecto `geofen_user` / `geofen_password`).
   - `docker compose down` detiene los contenedores; `docker compose down -v` además **borra todos los datos** de la base.

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Compilar el proyecto (TypeScript a JavaScript en `/dist`):**
   ```bash
   npm run build
   ```

3. **Iniciar en modo desarrollo con recarga en vivo (Watch mode):**
   ```bash
   npm run start:dev
   ```
   - Con `DB_SYNCHRONIZE=true` en `.env`, TypeORM crea las tablas (`categories`, `products`, `prices`, `lists` y `stores`) al arrancar la API.
   - La base arranca vacía. No hay tiendas precargadas, así que hay que crearlas con `POST /stores`.

4. **Acceder a los servicios:**
   - **API Base:** `http://localhost:3000`
   - **Documentación Swagger UI:** `http://localhost:3000/api`

### Variables de entorno

Se definen en `.env` (copia de `.env.example`). Los valores son los de `.env.example`:

| Variable | Valor de ejemplo | Descripción |
| :--- | :--- | :--- |
| `PORT` | `3000` | Puerto HTTP de la API |
| `DB_HOST` | `localhost` | Host de PostgreSQL |
| `DB_PORT` | `5433` | Puerto de PostgreSQL en el host (el contenedor escucha en 5432) |
| `DB_USERNAME` | `geofen_user` | Usuario de PostgreSQL |
| `DB_PASSWORD` | `geofen_password` | Contraseña de PostgreSQL |
| `DB_NAME` | `geofen_db` | Nombre de la base de datos |
| `DB_SYNCHRONIZE` | `true` | Sincroniza las tablas con las entidades al arrancar. En producción `false` |
| `DB_MIGRATIONS_RUN` | `false` | Ejecuta las migraciones pendientes al arrancar. En producción `true` |
| `PGADMIN_EMAIL` | `admin@geofen.com` | Usuario de pgAdmin |
| `PGADMIN_PASSWORD` | `admin_password` | Contraseña de pgAdmin |
| `PGADMIN_PORT` | `5050` | Puerto de pgAdmin en el host |
| `SCRAPER_API_KEY` | `cambia-esta-clave` | Clave que se envía en el header `x-api-key` |
| `THROTTLE_TTL_MS` | `60000` | Ventana del límite de peticiones, en milisegundos |
| `THROTTLE_LIMIT` | `100` | Peticiones máximas por IP y por ruta en cada ventana |
| `THROTTLE_BULK_LIMIT` | `10` | Peticiones máximas por IP y por ruta en cada ventana para `/stores/bulk` y `/prices/bulk` |

### Pruebas automatizadas

| Comando | Qué ejecuta |
| :--- | :--- |
| `npm test` | Pruebas unitarias de `src/**/*.spec.ts` (servicios con repositorios simulados y el filtro de errores) |
| `npm run test:watch` | Las mismas pruebas unitarias, repetidas al guardar cambios |
| `npm run test:cov` | Pruebas unitarias con reporte de cobertura en `coverage/` |
| `npm run test:e2e` | Pruebas HTTP de `/prices` (`test/prices.e2e-spec.ts`) con el `ValidationPipe` real y el servicio simulado |

Ninguna de las pruebas necesita PostgreSQL ni Docker.

### Migraciones de base de datos

En desarrollo, `DB_SYNCHRONIZE=true` hace que TypeORM sincronice las tablas con las entidades al arrancar. En producción se usa `DB_SYNCHRONIZE=false`, porque la sincronización puede alterar o borrar columnas; el esquema se cambia solo con migraciones.

| Comando | Qué hace |
| :--- | :--- |
| `npm run migration:generate -- src/database/migrations/Nombre` | Genera una migración con las diferencias entre las entidades y la base |
| `npm run migration:run` | Ejecuta las migraciones pendientes |
| `npm run migration:revert` | Revierte la última migración aplicada |

Las migraciones están en `src/database/migrations/` (esquema inicial y columna `location` de `stores`). En producción: `DB_SYNCHRONIZE=false` y `DB_MIGRATIONS_RUN=true`.

- **Base creada antes de esta versión:** basta con `docker compose up -d`. Con `DB_SYNCHRONIZE=true`, TypeORM crea la extensión PostGIS y la columna `location`.
- **Empezar desde cero con migraciones:**
  ```bash
  docker compose down -v   # borra todos los datos de la base
  docker compose up -d
  # en .env: DB_SYNCHRONIZE=false
  npm run migration:run
  ```

---

## 5. Tabla de Endpoints de la API

Todos los endpoints usan nombres en plural, sin verbos en las URLs, respetando las convenciones RESTful:

| Módulo | Método HTTP | Ruta | Método del Service | Código HTTP | Descripción |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Lists** | `GET` | `/lists` | `findAll(query)` | `200 OK` / `400` | Listas de compras paginadas (`page`, `limit`) |
| **Lists** | `GET` | `/lists/:id` | `findOne(id)` | `200 OK` / `404` | Detalle de una lista por ID numérico |
| **Lists** | `POST` | `/lists` | `create(dto)` | `201 Created` | Crea una lista validando el body |
| **Lists** | `PUT` | `/lists/:id` | `update(id, dto)` | `200 OK` / `404` | Reemplazo completo de nombre e items |
| **Lists** | `DELETE` | `/lists/:id` | `remove(id)` | `200 OK` / `404` | Elimina una lista por ID |
| **Stores** | `GET` | `/stores` | `findAll(query)` | `200 OK` / `400` | Tiendas paginadas (`page`, `limit`) |
| **Stores** | `GET` | `/stores/nearby` | `findNearby(query)` | `200 OK` / `400` | Tiendas dentro de un radio, de la más cercana a la más lejana |
| **Stores** | `GET` | `/stores/:id` | `findOne(id)` | `200 OK` / `404` | Detalle de una tienda por ID |
| **Stores** | `POST` | `/stores` | `create(dto)` | `201 Created` / `400` / `401` / `409` | Crea una tienda. `409` si ya existe la misma cadena y dirección. Requiere `x-api-key` |
| **Stores** | `POST` | `/stores/bulk` | `bulkUpsert(dtos)` | `200 OK` / `400` / `401` / `429` | Carga masiva (hasta 500) con upsert por cadena y dirección. Requiere `x-api-key` |
| **Stores** | `PATCH` | `/stores/:id` | `update(id, dto)` | `200 OK` / `400` / `401` / `404` / `409` | Actualización parcial de una tienda. Requiere `x-api-key` |
| **Stores** | `DELETE` | `/stores/:id` | `remove(id)` | `200 OK` / `401` / `404` | Elimina una tienda por ID. Requiere `x-api-key` |
| **Categories** | `GET` | `/categories` | `findAll()` | `200 OK` | Retorna todas las categorías |
| **Categories** | `GET` | `/categories/:id` | `findOne(id)` | `200 OK` / `404` | Detalle de una categoría por ID |
| **Categories** | `POST` | `/categories` | `create(dto)` | `201 Created` / `400` / `409` | Crea una categoría (nombre único) |
| **Categories** | `PATCH` | `/categories/:id` | `update(id, dto)` | `200 OK` / `400` / `404` / `409` | Actualización parcial de categoría |
| **Categories** | `DELETE` | `/categories/:id` | `remove(id)` | `200 OK` / `404` | Elimina una categoría por ID |
| **Products** | `GET` | `/products` | `findAll(query)` | `200 OK` / `400` / `404` | Catálogo paginado (`page`, `limit`) con filtro opcional por `categoryId` |
| **Products** | `GET` | `/products/:id` | `findOne(id)` | `200 OK` / `404` | Detalle de un producto por ID |
| **Products** | `POST` | `/products` | `create(dto)` | `201 Created` / `400` / `404` / `409` | Registra un producto (barcode único, categoría opcional) |
| **Products** | `PATCH` | `/products/:id` | `update(id, dto)` | `200 OK` / `400` / `404` / `409` | Actualización parcial de un producto |
| **Products** | `DELETE` | `/products/:id` | `remove(id)` | `200 OK` / `404` | Elimina un producto por ID |
| **Prices** | `GET` | `/prices` | `findAll(productId?, storeId?)` | `200 OK` / `400` | Consulta precios con filtros opcionales por producto y tienda (enteros positivos) |
| **Prices** | `GET` | `/prices/latest` | `findLatestByProduct(productId)` | `200 OK` / `400` / `404` | Precio más reciente del producto en cada tienda (`productId` obligatorio) |
| **Prices** | `POST` | `/prices` | `reportPrice(dto)` | `201 Created` / `200 OK` / `400` / `401` / `404` | Reporta el precio de un producto en una tienda. `200` si ya existe el mismo producto, tienda y `scrapedAt`. Requiere `x-api-key` |
| **Prices** | `POST` | `/prices/bulk` | `reportBulk(dtos)` | `201 Created` / `400` / `401` / `404` / `429` | Reporta precios en lote (hasta 1000), todo o nada ante IDs inexistentes. Responde `{ received, saved, duplicates }`. Requiere `x-api-key` |

### Ejemplo de body para `POST /stores`

```json
{
  "name": "Éxito Panamericana",
  "chain": "Éxito",
  "address": "Av. Panamericana # 22-10, Pasto, Nariño",
  "latitude": 1.2136,
  "longitude": -77.2811,
  "schedule": "Lun-Dom 8:00-21:00"
}
```

- `latitude` debe estar entre `-90` y `90`, y `longitude` entre `-180` y `180`.
- `schedule` es opcional.
- No se pueden repetir una `chain` y una `address` juntas. Si se intenta, la API responde `409 Conflict`.
- La columna `location` (punto geográfico) la calcula PostgreSQL a partir de `latitude` y `longitude`; no se envía ni aparece en las respuestas.

### Autenticación del scraper (`x-api-key`)

Los endpoints que escriben datos de tiendas y precios (`POST`, `PATCH` y `DELETE` de `/stores`, `POST /stores/bulk`, `POST /prices` y `POST /prices/bulk`) exigen el header `x-api-key`. Las lecturas (`GET`) son públicas.

- La clave se define en `.env` con `SCRAPER_API_KEY` (el valor de `.env.example` es solo de ejemplo; cámbialo).
- Sin header o con una clave distinta, la API responde `401 Unauthorized`. Si `SCRAPER_API_KEY` no está definida, ningún endpoint protegido acepta peticiones.
- En Swagger (`/api`), el botón **Authorize** permite escribir la clave una vez para todas las peticiones.

### Carga masiva del scraper

`POST /stores/bulk` recibe hasta 500 tiendas y hace upsert por `(chain, address)`: crea las nuevas y actualiza las existentes. Si el mismo par aparece dos veces en el lote, gana la última aparición.

```bash
curl -X POST http://localhost:3000/stores/bulk \
  -H "x-api-key: cambia-esta-clave" -H "Content-Type: application/json" \
  -d '{"stores":[{"name":"Alkosto Centro","chain":"Alkosto","address":"Cra 27 # 18-30","latitude":1.2136,"longitude":-77.279}]}'
# {"received":1,"created":1,"updated":0}
```

`POST /prices/bulk` recibe hasta 1000 precios con la forma de `POST /prices`. Es todo o nada: si algún `productId` o `storeId` no existe, responde `404` con los IDs en `missingProductIds` y `missingStoreIds`, y no guarda ninguno. Si todo existe, responde `201` con `{ received, saved, duplicates }`, donde `duplicates` son los reportes que ya existían (o que se repiten dentro del mismo lote) y no se guardaron.

```bash
curl -X POST http://localhost:3000/prices/bulk \
  -H "x-api-key: cambia-esta-clave" -H "Content-Type: application/json" \
  -d '{"prices":[{"productId":1,"storeId":1,"price":4500,"scrapedAt":"2026-11-10T15:30:00Z"}]}'
# {"received":1,"saved":1,"duplicates":0}
```

### Precios

`POST /prices` reporta el precio de un producto en una tienda:

```json
{
  "productId": 1,
  "storeId": 1,
  "price": 4500,
  "currency": "cop",
  "source": "scraper",
  "scrapedAt": "2026-11-10T15:30:00Z"
}
```

- `price` debe ser mayor a `0`.
- `currency` es opcional (por defecto `COP`). Se normaliza a mayúsculas (`cop` se guarda como `COP`) y debe ser un código ISO 4217 válido.
- `scrapedAt` es opcional y debe ser una fecha ISO 8601: la fecha en que se extrajo el precio. Si se omite, se usa la fecha actual.
- Si ya existe un reporte con el mismo `productId`, `storeId` y `scrapedAt`, no se duplica: la API responde `200 OK` con el precio existente. Si es nuevo, responde `201 Created`. El mismo precio con otra fecha se guarda como historial.

> **Recomendación para el scraper:** enviar siempre `scrapedAt` con la fecha real de extracción. Sin ese campo, cada reporte se guarda como nuevo aunque el precio no haya cambiado.

- `GET /prices?productId=&storeId=` filtra por producto y/o tienda. Si alguno no es un entero positivo, responde `400`.
- `GET /prices/latest?productId=` devuelve el precio más reciente del producto en cada tienda, con los datos de la tienda. Responde `400` si falta `productId` o no es válido, y `404` si el producto no existe.

### Tiendas cercanas

`GET /stores/nearby?lat=&lng=&radiusKm=&chain=` usa la columna `location` (tipo `geography` con índice GIST) de PostGIS: `ST_DWithin` filtra las tiendas dentro del radio y `ST_Distance` calcula la distancia.

| Parámetro | Obligatorio | Descripción |
| :--- | :--- | :--- |
| `lat` | Sí | Latitud entre `-90` y `90` |
| `lng` | Sí | Longitud entre `-180` y `180` |
| `radiusKm` | No | Radio en kilómetros, entre `0.1` y `100` (por defecto `5`) |
| `chain` | No | Filtra por cadena, sin distinguir mayúsculas |

Devuelve las tiendas con el campo extra `distanceKm`, ordenadas de la más cercana a la más lejana.

### Paginación

`GET /stores`, `GET /lists` y `GET /products` aceptan `page` (por defecto `1`) y `limit` (por defecto `20`, máximo `100`) y responden:

```json
{ "data": [], "total": 0, "page": 1, "limit": 20 }
```

### Propiedades desconocidas

Con `forbidNonWhitelisted: true`, enviar una propiedad que el DTO no declara (en el cuerpo o en la query) devuelve `400 Bad Request` con el mensaje `property <nombre> should not exist`.

### Límite de peticiones (429)

Cada ruta permite `THROTTLE_LIMIT` peticiones por IP en cada ventana de `THROTTLE_TTL_MS` (por defecto 100 por minuto). Los endpoints de carga masiva (`POST /stores/bulk` y `POST /prices/bulk`) tienen además un límite más estricto, `THROTTLE_BULK_LIMIT` (por defecto 10 por minuto), con su propio contador por ruta. Al superarlo, la API responde:

```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Demasiadas peticiones, intenta de nuevo más tarde",
  "path": "/stores/bulk",
  "timestamp": "2026-11-10T15:30:00.000Z"
}
```

- Las peticiones sin `x-api-key` también cuentan, porque el límite se evalúa antes de validar la clave.
- El contador se guarda en memoria, así que se reinicia al reiniciar la API.

### Formato de errores y logs

Todos los errores responden con el mismo formato:

```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Ya existe una tienda de la cadena Alkosto en la dirección Cra 27 # 18-30",
  "path": "/stores",
  "timestamp": "2026-11-10T15:30:00.000Z"
}
```

- Los errores de validación (`400`) devuelven `message` como arreglo de textos.
- Los errores de PostgreSQL se traducen: `23505` y `23503` responden `409`; `22P02`, `22003` y `23502` responden `400`. Cualquier otro error responde `500` con el mensaje genérico `Error interno del servidor`; el detalle queda en el log.
- Cada petición deja una línea en el log con el contexto `[HTTP]`: método, ruta, código de estado y duración, por ejemplo `GET /stores 200 12ms`. Las respuestas `4xx` se registran como advertencia y las `5xx` como error.

---

## 6. Conceptos Clave Explicados

1. **Módulo (`@Module`):**  
   Organiza la aplicación en bloques funcionales cohesivos. Cada módulo declara qué controladores expone (`controllers`) y qué servicios provee (`providers`).
2. **Controlador (`@Controller`):**  
   Responsable únicamente del protocolo HTTP: escuchar peticiones en una URL, extraer parámetros (`@Param`, `@Body`) y delegar el trabajo al servicio.
3. **Servicio (`@Injectable`):**  
   Aloja la lógica de negocio y las operaciones sobre los datos. Nunca sabe de HTTP ni de peticiones web directas; solo procesa datos y retorna resultados o lanza excepciones.
4. **Inyección de Dependencias (DI) & Singleton:**  
   NestJS instancia los servicios una sola vez al arrancar y los inyecta en el constructor de los controladores. Esto evita crear múltiples instancias (`new ListsService()`) y hace que todos los controladores usen el mismo servicio y, por tanto, la misma conexión a la base de datos.
5. **DTO y `class-validator`:**  
   Define el contrato estricto de entrada. Si un cliente envía campos no válidos o tipos incorrectos, el `ValidationPipe` rechaza la petición con `400 Bad Request` antes de que toque la lógica del servicio.
6. **Retorno Temprano (Early Return):**  
   Patrón de programación limpia donde los casos de error o condiciones no cumplidas se evalúan al inicio de la función para cortar la ejecución (`throw new NotFoundException(...)`), eliminando la necesidad de bloques `else` anidados.
7. **Entidad (TypeORM):**  
   Clase decorada con `@Entity` que representa una tabla de PostgreSQL. Sus columnas (`@Column`) definen la estructura de los datos guardados. La restricción única de `stores` (`chain` + `address`) evita tiendas duplicadas a nivel de base de datos, y la de `prices` (`productId` + `storeId` + `scrapedAt`) evita reportes de precio repetidos.

---

## 7. Scraper de Precios

La carpeta `scraper/` contiene un programa aparte que obtiene precios de supermercados de Pasto y los envía a la API con `POST /prices/bulk`. Tiene su propio `package.json` y su `.env`, y no forma parte de la aplicación NestJS.

Hoy consulta la fuente `olimpica` (catálogo público en línea) y la fuente `file`, que usa precios de **ejemplo** cargados a mano. Para instalarlo, configurarlo y ejecutarlo, revisa [`scraper/README.md`](scraper/README.md).
