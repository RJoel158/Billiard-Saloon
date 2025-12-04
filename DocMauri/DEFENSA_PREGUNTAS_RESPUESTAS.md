# 🎓 Preguntas y Respuestas para tu Defensa

## 1. Conceptos Básicos

### P: ¿Qué es Express.js?
**R:** Express es un framework minimalista de Node.js que facilita crear servidores web y APIs REST. Es como un "director de orquesta" que recibe peticiones HTTP, las procesa y devuelve respuestas.

**Respuesta completa:**
Express nos permite:
- Definir rutas (endpoints)
- Procesar peticiones
- Validar datos
- Ejecutar lógica
- Devolver respuestas

```javascript
const express = require('express');
const app = express();
app.listen(3000);
```

---

### P: ¿Por qué usaste esta arquitectura (Routes → Controllers → Services → Repositories)?
**R:** Porque sigue el patrón de **separación de responsabilidades**. Cada capa tiene un propósito específico:

```
Cliente → Routes (¿A dónde va?) 
       → Controller (Recibe petición)
       → Service (Valida y procesa)
       → Repository (Accede a BD)
       → Response
```

**Ventajas:**
- Fácil de mantener
- Fácil de testear (cada capa independiente)
- Reutilizar código
- Agregar nuevas features sin romper lo existente

---

### P: ¿Cuál es la diferencia entre Controller y Service?
**R:**

| Controller | Service |
|-----------|---------|
| Recibe petición HTTP | Contiene lógica de negocio |
| Llama al service | Valida reglas |
| Devuelve respuesta | Llama al repository |
| Maneja HTTP | Independiente de HTTP |

**Ejemplo:**

```javascript
// Controller - Recibe petición
async function create(req, res, next) {
  const user = await userService.createUser(req.body);
  res.json(user);
}

// Service - Lógica
async function createUser(data) {
  // Validar email único
  if (await userRepo.findByEmail(data.email)) {
    throw new Error('Email existe');
  }
  return await userRepo.create(data);
}
```

---

### P: ¿Para qué sirve el Repository?
**R:** Para **separar la lógica de datos de la lógica de negocio**. Aquí va SOLO SQL.

```javascript
// ✅ Bien - Todo el SQL aquí
async function findByEmail(email) {
  return await db.query('SELECT * FROM users WHERE email = ?', [email]);
}

// ❌ Mal - SQL mezclado en service
async function createUser(data) {
  const rows = await db.query('SELECT * FROM users WHERE email = ?', [data.email]);
}
```

**Ventajas:**
- Cambiar BD fácilmente (de MySQL a PostgreSQL)
- Testear sin conexión a BD
- Reutilizar queries

---

## 2. Base de Datos

### P: ¿Por qué usas `?` en lugar de concatenar strings en SQL?
**R:** Para prevenir **SQL Injection** (ataque de seguridad).

```javascript
// ❌ MAL - Vulnerable
const email = "juan'; DROP TABLE users; --";
db.query(`SELECT * FROM users WHERE email = '${email}'`);
// Resultado: SELECT * FROM users WHERE email = 'juan'; DROP TABLE users; --'
// ¡Elimina la tabla!

// ✅ BIEN - Seguro
db.query('SELECT * FROM users WHERE email = ?', [email]);
// El parámetro se escapa automáticamente
```

Los `?` se reemplazan por valores escapados, haciendo imposible inyectar código SQL.

---

### P: ¿Qué es async/await?
**R:** Son palabras clave para manejar código **asincrónico** (que no bloquea).

```javascript
// Sin await (sincrónico - bloquea)
const user = userRepo.findById(1); // Espera a que termine
console.log(user); // Se ejecuta después

// Con async/await (asincrónico - no bloquea)
async function getUser() {
  const user = await userRepo.findById(1); // Espera sin bloquear
  console.log(user);
}

// Operaciones de BD son lentas, por eso usamos async/await
```

**¿Por qué?** Porque:
- La BD es lenta (milisegundos)
- Sin async/await, todo el servidor se bloquearía esperando
- Con async/await, otros usuarios pueden hacer peticiones mientras esperas

---

### P: ¿Qué pasa si la BD falla?
**R:** Se lanza un error que es capturado por el **error handler**.

```javascript
// Controller
async function create(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    res.json(user);
  } catch (err) {
    next(err); // Envía al error handler
  }
}

// Error Handler (middleware)
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({
    error: 'Database error',
    message: err.message
  });
}
```

---

## 3. HTTP y Routing

### P: ¿Cuándo usas GET, POST, PUT, DELETE?
**R:** Depende de la acción:

| Método | Acción | Ejemplo |
|--------|--------|---------|
| GET | Obtener datos | `GET /api/users/1` |
| POST | Crear datos | `POST /api/users` |
| PUT | Actualizar datos | `PUT /api/users/1` |
| DELETE | Eliminar datos | `DELETE /api/users/1` |

---

### P: ¿Qué es `req.params`, `req.query` y `req.body`?
**R:**

```javascript
// URL: POST /api/users/123?role=admin
// Body: { "name": "Juan" }

req.params    // { id: '123' } - Parámetros de URL
req.query     // { role: 'admin' } - Query string
req.body      // { name: 'Juan' } - Body JSON
```

**Ejemplo de acceso:**
```javascript
app.put('/api/users/:id', (req, res) => {
  console.log(req.params.id);   // '123'
  console.log(req.query.role);  // 'admin'
  console.log(req.body.name);   // 'Juan'
});
```

---

### P: ¿Qué son los códigos de estado HTTP?
**R:** Indican el resultado de la petición:

```
2xx - Éxito
  200 OK              (GET exitoso)
  201 Created         (POST exitoso)
  204 No Content      (DELETE exitoso)

4xx - Error del cliente
  400 Bad Request     (Datos inválidos)
  401 Unauthorized    (No autenticado)
  404 Not Found       (Recurso no existe)
  409 Conflict        (Email duplicado, etc)

5xx - Error del servidor
  500 Internal Error  (Error del servidor)
```

**En tu código:**
```javascript
res.status(201).json(user);    // POST exitoso
res.status(404).json(error);   // No encontrado
res.status(409).json(error);   // Conflicto (email existe)
```

---

## 4. Flujo de Petición

### P: Cuéntame el flujo completo de una petición

**R:** Ejemplo: `POST /api/users` con body `{ "email": "juan@example.com", "first_name": "Juan" }`

```
1. CLIENTE
   ↓ Envía petición HTTP
   POST /api/users
   Content-Type: application/json
   { "email": "juan@example.com", "first_name": "Juan" }

2. SERVIDOR RECIBE
   ↓ Express busca la ruta coincidente
   app.use('/api/users', userRoutes);

3. ROUTES
   ↓ user.routes.js busca coincidencia
   router.post('/', controller.create);
   ↓ Llama a controller.create con (req, res, next)

4. CONTROLLER
   ↓ user.controller.js
   const user = await userService.createUser(req.body);
   ↓ Extrae req.body y llama al service

5. SERVICE
   ↓ user.service.js
   Valida: ¿Email ya existe?
   const existing = await userRepo.findByEmail(data.email);
   ↓ Si no existe, llama al repository

6. REPOSITORY
   ↓ user.repository.js
   await db.query(
     'INSERT INTO users (...) VALUES (...)',
     [data.role_id, data.first_name, data.email, ...]
   );
   ↓ Ejecuta INSERT en BD

7. BASE DE DATOS
   ↓ MySQL
   INSERT INTO users (role_id, first_name, email, ...)
   VALUES (2, 'Juan', 'juan@example.com', ...)
   ↓ Devuelve ID insertado

8. REPOSITORY → SERVICE → CONTROLLER
   ↓ El objeto user sube por las capas

9. CONTROLLER RESPONDE
   res.status(201).json({ success: true, data: user });

10. CLIENTE RECIBE
    201 Created
    {
      "success": true,
      "data": {
        "id": 1,
        "first_name": "Juan",
        "email": "juan@example.com"
      }
    }
```

---

## 5. Validación y Errores

### P: ¿Cómo manejas validaciones?
**R:** En el **service**, antes de acceder a BD:

```javascript
async function createUser(data) {
  // Validación 1: Email existe
  const existing = await userRepo.findByEmail(data.email);
  if (existing) {
    throw new ApiError(409, 'EMAIL_EXISTS', 'Email ya registrado');
  }

  // Validación 2: Email válido
  if (!data.email.includes('@')) {
    throw new ApiError(400, 'INVALID_EMAIL', 'Email inválido');
  }

  // Validación 3: Nombre no vacío
  if (!data.first_name || data.first_name.trim() === '') {
    throw new ApiError(400, 'INVALID_NAME', 'Nombre requerido');
  }

  return await userRepo.create(data);
}
```

**¿Por qué en Service?**
- No depende de HTTP (reutilizable)
- Encapsula la lógica
- El controller solo recibe/devuelve

---

### P: ¿Cómo lanzas errores?
**R:** Usando la clase `ApiError`:

```javascript
// middlewares/apiError.js
class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Uso
throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');

// El error handler lo captura
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.code,
      message: err.message
    });
  }
}
```

---

## 6. Middlewares

### P: ¿Qué es un middleware?
**R:** Código que se ejecuta antes de llegar a las rutas. Procesa peticiones globalmente.

```javascript
// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next(); // Continúa al siguiente middleware/ruta
});

// Middleware de JSON
app.use(express.json()); // Convierte body a JSON

// Middleware de errores (siempre último)
app.use(errorHandler);
```

**Orden es importante:**
```javascript
app.use(express.json());      // 1. Parse JSON
app.use(authMiddleware);      // 2. Autenticar
app.use('/api/users', userRoutes); // 3. Rutas
app.use(errorHandler);        // 4. Errores (SIEMPRE ÚLTIMO)
```

---

### P: ¿Por qué el error handler va al final?
**R:** Porque debe capturar todos los errores. Si va antes de las rutas, no capturaría nada.

```javascript
// ✅ Correcto
app.use('/api/users', userRoutes);
app.use(errorHandler);

// ❌ Incorrecto - No capturaría errores de las rutas
app.use(errorHandler);
app.use('/api/users', userRoutes);
```

---

## 7. Seguridad

### P: ¿Cómo proteges contra SQL Injection?
**R:** Usando **parámetros** en lugar de concatenación:

```javascript
// ❌ Vulnerable
const email = "'; DROP TABLE users; --";
db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ Seguro
db.query('SELECT * FROM users WHERE email = ?', [email]);
```

---

### P: ¿Cómo encriptas contraseñas?
**R:** Usando bcrypt (en tu package.json):

```javascript
const bcrypt = require('bcrypt');

// Crear hash
const password = "123456";
const hashedPassword = await bcrypt.hash(password, 10);
// Guardar hashedPassword en BD

// Verificar al login
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

---

## 8. Testing Mental

### P: ¿Qué pasa si el usuario no existe?
**R:**
```javascript
async function getUser(id) {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  }
  return user;
}

// Respuesta al cliente
// 404 Not Found
// { "success": false, "error": "USER_NOT_FOUND", "message": "Usuario no encontrado" }
```

---

### P: ¿Qué pasa si el email ya existe?
**R:**
```javascript
const existing = await userRepo.findByEmail(data.email);
if (existing) {
  throw new ApiError(409, 'EMAIL_EXISTS', 'Email ya registrado');
}

// Respuesta al cliente
// 409 Conflict
// { "success": false, "error": "EMAIL_EXISTS", "message": "Email ya registrado" }
```

---

### P: ¿Qué pasa si hay error en BD?
**R:**
```javascript
try {
  const user = await userRepo.create(data);
  res.json(user);
} catch (err) {
  next(err); // → errorHandler
}

// errorHandler:
// 500 Internal Server Error
// { "success": false, "error": "INTERNAL_SERVER_ERROR" }
```

---

## 9. Performance y Optimización

### P: ¿Cómo optimizarías el getAll cuando hay muchos usuarios?
**R:** Con **paginación**:

```javascript
// GET /api/users?page=1&limit=10
async function getAllUsersPaginated(page, limit) {
  const offset = (page - 1) * limit;
  const users = await userRepo.findAllPaginated(offset, limit);
  const total = await userRepo.count();
  
  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

// SQL
SELECT * FROM users LIMIT 10 OFFSET 0;
```

---

### P: ¿Qué son los índices en la BD?
**R:** Optimization para búsquedas rápidas:

```sql
-- Sin índice: busca fila por fila (lento)
SELECT * FROM users WHERE email = 'juan@example.com';

-- Con índice: búsqueda directa (rápido)
CREATE INDEX idx_email ON users(email);
```

En tu base.sql ya tienes:
```sql
ALTER TABLE users
  ADD UNIQUE KEY `email` (`email`);
```

---

## 10. Preguntas "Trick"

### P: ¿Puede un controller llamar directo a la BD sin pasar por repository?
**R:** Técnicamente sí, pero **NO DEBERÍAS**. Rompe la separación de responsabilidades.

```javascript
// ❌ Mal
async function getUser(req, res) {
  const user = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
  res.json(user);
}

// ✅ Bien
async function getUser(req, res) {
  const user = await userService.getUser(req.params.id);
  res.json(user);
}
```

---

### P: ¿Puede una ruta ejecutar lógica?
**R:** Técnicamente sí, pero **NO DEBERÍAS**. Las rutas solo deben mapear URLs a controllers.

```javascript
// ❌ Mal
router.post('/', async (req, res) => {
  const existing = await userRepo.findByEmail(req.body.email);
  if (existing) throw new Error('Email exists');
  const user = await userRepo.create(req.body);
  res.json(user);
});

// ✅ Bien
router.post('/', controller.create);
```

---

### P: ¿Por qué usar `next(err)` en lugar de `res.status(500).json(error)`?
**R:** Porque `next(err)` lleva el error al **error handler centralizado**.

```javascript
// ❌ Sin consistencia
async function create(req, res) {
  try {
    const user = await service.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message }); // Formato diferente
  }
}

// ✅ Consistente
async function create(req, res, next) {
  try {
    const user = await service.create(req.body);
    res.json(user);
  } catch (err) {
    next(err); // Error handler maneja todo igual
  }
}
```

---

## Preguntas potenciales en defensa

1. ¿Cómo empezarías un nuevo endpoint (ej: obtener mesas de una categoría)?
2. ¿Qué pasaría si alguien intenta eliminar una categoría que tiene mesas?
3. ¿Cómo implementarías autenticación con tokens?
4. ¿Por qué CORS es importante? (para que el cliente pueda acceder)
5. ¿Cómo testarías tu API?
6. ¿Qué es una transacción en BD?
7. ¿Cómo manejarías concurrencia (dos usuarios reservando la misma mesa)?

---

## Frases clave para responder

- "La separación de responsabilidades permite..."
- "Por seguridad usamos..."
- "El flujo es: Request → Routes → Controller → Service → Repository → BD"
- "Async/await para no bloquear el servidor"
- "Validamos en el service antes de acceder a BD"
- "Centralizamos errores en el error handler"
- "Usamos parámetros (`?`) para prevenir SQL Injection"

¡Éxito! 🚀
