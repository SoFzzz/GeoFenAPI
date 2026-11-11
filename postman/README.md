# Guía de Pruebas y Estado del Proyecto - GeoFen API

Este directorio contiene los ejemplos de peticiones y la colección exportable de **Postman** para interactuar con **GeoFen API REST**.

---

## 1. Estado Actual del Proyecto (Cómo funciona hasta el momento)

El proyecto se encuentra en su fase base arquitectónica (MVP didáctico), completamente funcional bajo el patrón de **Inyección de Dependencias** de NestJS. Los datos se guardan en **PostgreSQL** mediante **TypeORM**, así que se mantienen aunque se reinicie la API:

1. **Módulo Lists (`/lists`):**
   - Implementa un CRUD completo persistido en la tabla `lists` de PostgreSQL.
   - Las peticiones de creación (`POST`) y actualización (`PUT`) pasan por el `ValidationPipe` global, que valida que el nombre no sea vacío (`@IsNotEmpty`) y que los items sean un arreglo de strings (`@IsArray`, `@IsString({ each: true })`).
   - Las búsquedas (`GET /lists/:id`), actualizaciones (`PUT /lists/:id`) y eliminaciones (`DELETE /lists/:id`) utilizan la técnica de **Retorno Temprano (Early Return)**. Si el registro no se encuentra, detienen la ejecución lanzando `NotFoundException` (HTTP 404) de forma inmediata.
   - En la actualización (`PUT`) el ID autoincrementable no cambia y solo se actualizan los atributos enviados.

2. **Módulo Stores (`/stores`):**
   - Implementa un CRUD completo persistido en la tabla `stores` de PostgreSQL.
   - La base arranca **vacía**: ya no hay tiendas precargadas. Antes de probar `GET /stores/:id` o `PATCH`/`DELETE`, hay que crear una tienda con `POST /stores`.
   - `latitude` debe estar entre `-90` y `90`, y `longitude` entre `-180` y `180`. `schedule` es opcional.
   - La combinación de `chain` y `address` es única. Si se intenta crear una tienda repetida, la API responde `409 Conflict`.
   - `PATCH /stores/:id` actualiza solo los campos enviados. Si no existe la tienda responde `404`, y si el cambio duplica una combinación `chain` + `address` responde `409`.

3. **Ingesta del scraper y seguridad:**
   - Los endpoints de escritura de tiendas y precios (`POST`, `PATCH` y `DELETE` de `/stores`, `POST /stores/bulk`, `POST /prices` y `POST /prices/bulk`) exigen el header `x-api-key`, que debe coincidir con `SCRAPER_API_KEY` del `.env`. Sin él responden `401`.
   - `POST /stores/bulk` carga hasta 500 tiendas con upsert por `chain` + `address` y responde `{ received, created, updated }`.
   - `POST /prices/bulk` carga hasta 1000 precios, todo o nada: si algún producto o tienda no existe responde `404` y no guarda nada.
   - `GET /stores/nearby` devuelve las tiendas dentro de un radio, ordenadas por distancia (`distanceKm`), con filtro opcional por cadena.
   - `GET /stores`, `/lists` y `/products` están paginados (`page`, `limit`) y responden `{ data, total, page, limit }`.
   - Enviar una propiedad no declarada en el DTO (cuerpo o query) responde `400`.

4. **Documentación Swagger interactiva:**
   - Accesible en tiempo real en `http://localhost:3000/api`. El botón **Authorize** permite escribir la API key.

---

## 2. Cómo importar y ejecutar la colección en Postman

1. Antes de empezar, levanta la base de datos con Docker y arranca el servidor. Los pasos están en el README principal del proyecto.
2. Abre **Postman**.
3. Haz clic en el botón **Import** (esquina superior izquierda).
4. Selecciona o arrastra el archivo `geofen-collection.json` de esta carpeta.
5. Asegúrate de tener el servidor corriendo con:
   ```bash
   npm run start:dev
   ```
6. En Postman, encontrarás la carpeta **GeoFen API REST - Pruebas y Ejemplos** con todas las peticiones organizadas.
7. La colección define la variable `apiKey` (por defecto `cambia-esta-clave`). Si cambiaste `SCRAPER_API_KEY` en tu `.env`, actualiza el valor en la pestaña **Variables** de la colección.

---

## 3. Casos de Prueba Incluidos

> **Nota sobre los IDs:** los ejemplos usan IDs fijos (`1`, `2`, `888`, etc.) como referencia. Como la base de datos crea los IDs automáticamente, ajústalos según lo que devuelva el `POST`. Los IDs no se reinician al eliminar registros, así que al repetir la colección el ID de la nueva tienda será distinto.

### A. Listas (`/lists`)
- **GET Todas:** `GET http://localhost:3000/lists` -> Espera `200 OK` con el listado JSON.
- **GET por ID:** `GET http://localhost:3000/lists/1` -> Espera `200 OK` con la lista 1.
- **GET Error 404:** `GET http://localhost:3000/lists/999` -> Espera `404 Not Found` con mensaje claro.
- **GET Error 400 (Pipe):** `GET http://localhost:3000/lists/texto` -> Espera `400 Bad Request` generado por `ParseIntPipe`.
- **POST Éxito:** `POST http://localhost:3000/lists` con body JSON -> Espera `201 Created` y la nueva lista con ID asignado.
- **POST Error 400 (Validation):** Envío de nombre vacío o items como string simple -> Espera `400 Bad Request` detallando las reglas rotas.
- **PUT Actualizar:** `PUT http://localhost:3000/lists/1` con nuevo nombre e items -> Espera `200 OK` con los datos reemplazados.
- **DELETE Eliminar:** `DELETE http://localhost:3000/lists/2` -> Espera `200 OK` confirmando la eliminación.

### B. Tiendas (`/stores`)

Orden sugerido: primero las pruebas de lectura (la base estará vacía), luego crear, después actualizar y al final eliminar.

- **GET Todas:** `GET http://localhost:3000/stores` -> Espera `200 OK` con `{ data, total, page, limit }`. Si la base está vacía, `data` es un arreglo vacío.
- **GET por ID:** `GET http://localhost:3000/stores/1` -> Espera `200 OK` con la tienda 1. Requiere haber creado una tienda antes.
- **GET Error 404:** `GET http://localhost:3000/stores/888` -> Espera `404 Not Found`.
- **POST Éxito:** `POST http://localhost:3000/stores` con el body de ejemplo -> Espera `201 Created` con el ID asignado.
- **POST Error 409 (Duplicado):** Repetir el mismo `POST` con la misma `chain` y `address` -> Espera `409 Conflict`. Debe ejecutarse después del POST de éxito.
- **POST Error 400 (Validation):** Nombre vacío y latitud fuera de rango (`95`) -> Espera `400 Bad Request` detallando las reglas rotas.
- **PATCH Actualizar:** `PATCH http://localhost:3000/stores/1` con `schedule` nuevo -> Espera `200 OK` con la tienda actualizada.
- **DELETE Eliminar:** `DELETE http://localhost:3000/stores/1` -> Espera `200 OK` confirmando la eliminación.

Las peticiones de escritura de esta carpeta envían `x-api-key: {{apiKey}}`. Las siguientes cubren la ingesta del scraper (ejecutarlas en orden, la carga masiva primero):

- **POST Carga masiva:** `POST http://localhost:3000/stores/bulk` con `{"stores": [...]}` -> Espera `200 OK` con `{ received, created, updated }`. Repetirla devuelve `created: 0`.
- **POST Error 401:** la misma ruta sin `x-api-key` -> Espera `401 Unauthorized`.
- **POST Error 400 (propiedad desconocida):** un item con un campo que el DTO no declara -> Espera `400 Bad Request`.
- **GET Cercanas:** `GET http://localhost:3000/stores/nearby?lat=1.2136&lng=-77.2811&radiusKm=5` -> Espera `200 OK` con las tiendas y `distanceKm`, de la más cercana a la más lejana.
- **GET Cercanas por cadena:** agregar `&chain=alkosto` -> Espera `200 OK` solo con esa cadena (sin distinguir mayúsculas).
- **GET Error 400 (coordenadas):** `?lat=200&lng=0` -> Espera `400 Bad Request`.
- **GET Paginación:** `GET http://localhost:3000/stores?page=2&limit=2` -> Espera `200 OK` con la segunda página.
- **GET Error 400 (limit):** `?limit=101` -> Espera `400 Bad Request` (el máximo es 100).

### C. Categorías (`/categories`)

- **GET Todas:** `GET http://localhost:3000/categories` -> Espera `200 OK`.
- **POST Éxito:** `POST http://localhost:3000/categories` con `{"name": "Granos y cereales"}` -> Espera `201 Created`.
- **POST Error 409 (Duplicado):** Enviar misma categoría -> Espera `409 Conflict`.
- **GET por ID:** `GET http://localhost:3000/categories/1` -> Espera `200 OK`.
- **PATCH Actualizar:** `PATCH http://localhost:3000/categories/1` con `{"name": "Despensa y granos"}` -> Espera `200 OK`.
- **DELETE Eliminar:** `DELETE http://localhost:3000/categories/1` -> Espera `200 OK`.

### D. Productos (`/products`)

- **GET Todos:** `GET http://localhost:3000/products` -> Espera `200 OK`.
- **POST Éxito:** `POST http://localhost:3000/products` con `{"name": "Arroz Diana 1kg", "brand": "Diana", "barcode": "7702354012345", "categoryId": 1}` -> Espera `201 Created`.
- **GET Filtrado por Categoría:** `GET http://localhost:3000/products?categoryId=1` -> Espera `200 OK` con productos de esa categoría.
- **GET por ID:** `GET http://localhost:3000/products/1` -> Espera `200 OK`.
- **PATCH Actualizar:** `PATCH http://localhost:3000/products/1` -> Espera `200 OK`.
- **DELETE Eliminar:** `DELETE http://localhost:3000/products/1` -> Espera `200 OK`.

### E. Precios (`/prices`)

- **POST Reportar Precio:** `POST http://localhost:3000/prices` con `{"productId": 1, "storeId": 1, "price": 4500, "currency": "COP", "source": "scraper"}` -> Espera `201 Created`.
- **GET Todos los Precios:** `GET http://localhost:3000/prices` -> Espera `200 OK` ordenados por fecha descendente.
- **GET Precios por Producto:** `GET http://localhost:3000/prices?productId=1` -> Espera `200 OK` con el historial de precios del producto.
- **GET Precios por Tienda:** `GET http://localhost:3000/prices?storeId=1` -> Espera `200 OK`.
- **POST Carga masiva:** `POST http://localhost:3000/prices/bulk` con `{"prices": [...]}` y `x-api-key` -> Espera `201 Created` con `{ received, saved }`. Ajusta los IDs de producto y tienda a los que existan en tu base.
- **POST Error 404 (lote):** un precio con producto o tienda inexistente -> Espera `404 Not Found` con los IDs faltantes; no se guarda ningún precio del lote.
- **POST Error 401:** `POST http://localhost:3000/prices` sin `x-api-key` -> Espera `401 Unauthorized`.
