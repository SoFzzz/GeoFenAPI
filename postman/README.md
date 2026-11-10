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

3. **Documentación Swagger interactiva:**
   - Accesible en tiempo real en `http://localhost:3000/api`.

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

- **GET Todas:** `GET http://localhost:3000/stores` -> Espera `200 OK` con las tiendas guardadas. Si la base está vacía, devuelve un arreglo vacío.
- **GET por ID:** `GET http://localhost:3000/stores/1` -> Espera `200 OK` con la tienda 1. Requiere haber creado una tienda antes.
- **GET Error 404:** `GET http://localhost:3000/stores/888` -> Espera `404 Not Found`.
- **POST Éxito:** `POST http://localhost:3000/stores` con el body de ejemplo -> Espera `201 Created` con el ID asignado.
- **POST Error 409 (Duplicado):** Repetir el mismo `POST` con la misma `chain` y `address` -> Espera `409 Conflict`. Debe ejecutarse después del POST de éxito.
- **POST Error 400 (Validation):** Nombre vacío y latitud fuera de rango (`95`) -> Espera `400 Bad Request` detallando las reglas rotas.
- **PATCH Actualizar:** `PATCH http://localhost:3000/stores/1` con `schedule` nuevo -> Espera `200 OK` con la tienda actualizada.
- **DELETE Eliminar:** `DELETE http://localhost:3000/stores/1` -> Espera `200 OK` confirmando la eliminación.
