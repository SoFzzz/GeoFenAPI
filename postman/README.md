# Guía de Pruebas y Estado del Proyecto - GeoFen API 🚀

Este directorio contiene los ejemplos de peticiones y la colección exportable de **Postman** para interactuar con **GeoFen API REST**.

---

## 🔍 1. Estado Actual del Proyecto (Cómo funciona hasta el momento)

El proyecto se encuentra en su fase base arquitectónica (MVP didáctico), completamente funcional bajo el patrón de **Inyección de Dependencias** de NestJS:

1. **Módulo Lists (`/lists`):**
   - Implementa un CRUD completo en memoria.
   - Las peticiones de creación (`POST`) y actualización (`PUT`) pasan por el `ValidationPipe` global, que valida que el nombre no sea vacío (`@IsNotEmpty`) y que los items sean un arreglo de strings (`@IsArray`, `@IsString({ each: true })`).
   - Las búsquedas (`GET /lists/:id`), actualizaciones (`PUT /lists/:id`) y eliminaciones (`DELETE /lists/:id`) utilizan la técnica de **Retorno Temprano (Early Return)**. Si el registro no se encuentra, detienen la ejecución lanzando `NotFoundException` (HTTP 404) de forma inmediata.
   - En la actualización (`PUT`), se aplica el operador spread (`{ ...this.lists[index], ...dto }`) para mantener inmutable el ID autoincrementable y actualizar únicamente los atributos enviados.

2. **Módulo Stores (`/stores`):**
   - Implementa un flujo de solo lectura (`GET /stores` y `GET /stores/:id`).
   - Lee las tiendas desde PostgreSQL (TypeORM). Si la tabla está vacía al iniciar, inserta 3 tiendas de ejemplo de la ciudad de Pasto (Éxito Panamericana, Alkosto Centro y Supermercado Amorel). Requiere la base de datos levantada con `docker compose up -d` (ver el README principal).
   - No tiene operaciones de mutación (POST/PUT/DELETE) en esta etapa, manteniendo el principio de mínima superficie de ataque y menor complejidad (KISS).

3. **Documentación Swagger interactiva:**
   - Accesible en tiempo real en `http://localhost:3000/api`.

---

## 📥 2. Cómo importar y ejecutar la colección en Postman

1. Abre **Postman**.
2. Haz clic en el botón **Import** (esquina superior izquierda).
3. Selecciona o arrastra el archivo [geofen-collection.json](file:///c:/Users/dino2/Desktop/GeoFen/postman/geofen-collection.json).
4. Asegúrate de tener el servidor corriendo con:
   ```bash
   npm run start:dev
   ```
5. En Postman, encontrarás la carpeta **GeoFen API REST - Pruebas y Ejemplos** con todas las peticiones organizadas.

---

## 🧪 3. Casos de Prueba Incluidos

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
- **GET Todas:** `GET http://localhost:3000/stores` -> Espera `200 OK` con las 3 tiendas de Pasto.
- **GET por ID:** `GET http://localhost:3000/stores/1` -> Espera `200 OK` con la tienda seleccionada.
- **GET Error 404:** `GET http://localhost:3000/stores/888` -> Espera `404 Not Found`.
