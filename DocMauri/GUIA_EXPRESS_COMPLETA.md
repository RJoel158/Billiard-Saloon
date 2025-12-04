# 🚀 Guía Completa: Express.js y tu Servidor Billiard-Saloon

## 📋 Índice
1. [¿Qué es Express?](#qué-es-express)
2. [Arquitectura de tu proyecto](#arquitectura-de-tu-proyecto)
3. [Flujo de una petición](#flujo-de-una-petición)
4. [Componentes principales](#componentes-principales)
5. [Cómo funciona cada archivo](#cómo-funciona-cada-archivo)
6. [Ejemplos prácticos](#ejemplos-prácticos)

---

## ¿Qué es Express?

**Express.js** es un framework minimalista de Node.js para crear servidores web (APIs). Es como el "director de orquesta" que recibe peticiones HTTP, las procesa y devuelve respuestas.

### Conceptos básicos:

```javascript
const express = require('express');
const app = express();

// Middleware: procesa antes de llegar a la ruta
app.use(express.json()); // Convierte JSON en objetos JavaScript

// Ruta: responde a peticiones
app.get('/api/users', (req, res) => {
  res.json({ mensaje: 'Hola' });
});

// Puerto: donde escucha el servidor
app.listen(3000, () => {
  console.log('Servidor en puerto 3000');
});
```

### Métodos HTTP (CRUD):
- **GET** → Obtener datos
- **POST** → Crear datos
- **PUT** → Actualizar datos
- **DELETE** → Eliminar datos

---

## Arquitectura de tu proyecto

Tu proyecto sigue el patrón **MVC mejorado con Repositories**:

```
Petición HTTP
    ↓
Rutas (routes/) - Define endpoints
    ↓
Controladores (controllers/) - Recibe la petición
    ↓
Servicios (services/) - Lógica de negocio
    ↓
Repositorios (repositories/) - Acceso a datos (SQL)
    ↓
Base de Datos
```

Cada capa tiene una **responsabilidad específica**:

| Capa | Responsabilidad | Ejemplo |
|------|-----------------|---------|
| **Routes** | Define URLs | `/api/users` |
| **Controllers** | Recibe petición, llama service | `getAll()` |
| **Services** | Valida y procesa lógica | Verificar email único |
| **Repositories** | Ejecuta SQL directo | `SELECT * FROM users` |
| **DB** | Conexión a MySQL | Ejecuta queries |

---

## Flujo de una petición

### Ejemplo: Crear un usuario

```
Cliente hace:  POST http://localhost:3000/api/users
               Body: { first_name: "Juan", email: "juan@email.com", ... }

           ↓

1. ROUTES (user.routes.js)
   router.post('/', controller.create)
   → Detecta que es POST en / y llama a controller.create

           ↓

2. CONTROLLERS (user.controller.js)
   async function create(req, res, next) {
     const payload = req.body;  // { first_name: "Juan", ... }
     const user = await userService.createUser(payload);
     res.status(201).json({ success: true, data: user });
   }
   → Recibe datos, llama al service

           ↓

3. SERVICES (user.service.js)
   async function createUser(data) {
     const existing = await userRepo.findByEmail(data.email);
     if (existing) throw new ApiError(409, 'EMAIL_EXISTS', ...);
     const user = await userRepo.create(data);
     return user;
   }
   → Valida que email no exista, luego llama al repositorio

           ↓

4. REPOSITORIES (user.repository.js)
   async function create(user) {
     await db.query(
       'INSERT INTO users (role_id, first_name, last_name, email, ...) VALUES (?, ?, ?, ?, ...)',
       [user.role_id, user.first_name, user.last_name, user.email, ...]
     );
     return rows[0];
   }
   → Ejecuta INSERT en base de datos

           ↓

5. BASE DE DATOS
   INSERT INTO users (role_id, first_name, last_name, email, ...)
   VALUES (2, "Juan", "Pérez", "juan@email.com", ...)

           ↓

Respuesta al cliente:
{
  "success": true,
  "data": {
    "id": 1,
    "role_id": 2,
    "first_name": "Juan",
    "email": "juan@email.com",
    ...
  }
}
```

---

## Componentes principales

### 1. **index.js** - Punto de entrada

```javascript
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Convierte body en objeto JSON

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/tables", tableRoutes);

// Error handler (siempre al final)
app.use(errorHandler);

// Iniciar
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
```

**¿Qué hace?**
- Crea la aplicación Express
- Carga middlewares
- Monta rutas
- Inicia el servidor en puerto 3000

---

### 2. **Routes** - Definen los endpoints

```javascript
// user.routes.js
const express = require('express');
const controller = require('../controllers/user.controller');

const router = express.Router();

router.get('/', controller.getAll);           // GET /api/users
router.get('/:id', controller.getById);       // GET /api/users/1
router.post('/', controller.create);          // POST /api/users
router.put('/:id', controller.update);        // PUT /api/users/1
router.delete('/:id', controller.deleteUser); // DELETE /api/users/1

module.exports = router;
```

**¿Qué hace?**
- Define las URLs disponibles
- Mapea cada URL a una función en el controller
- `:id` es un parámetro dinámico

**Ejemplo de petición:**
```
GET /api/users/5
↓ req.params = { id: '5' }
```

---

### 3. **Controllers** - Reciben peticiones

```javascript
// user.controller.js
async function getAll(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err); // Envía al error handler
  }
}

async function create(req, res, next) {
  try {
    const payload = req.body; // Datos enviados por cliente
    const user = await userService.createUser(payload);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
```

**¿Qué hace?**
- Recibe `req` (request), `res` (response), `next` (siguiente middleware)
- Llama al service (lógica)
- Devuelve respuesta al cliente con `res.json()` o `res.status(201).json()`
- Si hay error, llama a `next(err)` para que lo maneje el error handler

**Objetos importantes:**
- `req.body` → Datos enviados en el body (JSON)
- `req.params` → Parámetros de URL (`:id`)
- `req.query` → Parámetros de query (`?page=2`)
- `res.json()` → Devuelve JSON
- `res.status(201)` → Código HTTP (201 = creado)

---

### 4. **Services** - Lógica de negocio

```javascript
// user.service.js
async function createUser(data) {
  // Validación: ¿Email ya existe?
  const existing = await userRepo.findByEmail(data.email);
  if (existing) {
    throw new ApiError(409, 'EMAIL_EXISTS', 'Email ya registrado');
  }
  
  // Si todo está bien, crea el usuario
  const user = await userRepo.create(data);
  return user;
}
```

**¿Qué hace?**
- Valida datos
- Aplica reglas de negocio
- Llama al repositorio para acceder a datos
- Lanza errores si algo está mal

---

### 5. **Repositories** - Acceso a datos

```javascript
// user.repository.js
async function findByEmail(email) {
  const rows = await db.query(
    `SELECT id, email, first_name FROM users WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
}

async function create(user) {
  await db.query(
    `INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user.role_id || 2, user.first_name, user.last_name, user.email, user.password_hash, user.phone]
  );
  return await findByEmail(user.email);
}
```

**¿Qué hace?**
- Ejecuta queries SQL
- Devuelve datos de la BD
- Solo aquí va el SQL

**Puntos importantes:**
- Usa `?` para parámetros (previene SQL Injection)
- `db.query()` es asincrónico (usa `await`)

---

### 6. **Middlewares** - Procesan peticiones

```javascript
// errorHandler.js
function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);
  
  // Si es nuestro ApiError personalizado
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.code,
      message: err.message
    });
  }
  
  // Error desconocido
  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Error interno del servidor'
  });
}
```

**¿Qué hace?**
- Procesa peticiones antes de llegar a rutas
- En este caso, maneja errores globalmente
- Importante: va siempre al final

---

### 7. **ApiError** - Error personalizado

```javascript
// middlewares/apiError.js
class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

module.exports = ApiError;
```

**Uso:**
```javascript
throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
// → Devuelve: { success: false, error: 'USER_NOT_FOUND', message: '...' }
```

---

## Cómo funciona cada archivo

### **index.js** (El maestro)
```javascript
const express = require("express");
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/tables", tableRoutes);

// Error handler (siempre último)
app.use(errorHandler);

// Puerto
app.listen(3000);
```

### **routes/user.routes.js** (Las URLs)
```javascript
router.get('/', getAll);        // GET /api/users
router.post('/', create);       // POST /api/users
router.put('/:id', update);     // PUT /api/users/1
router.delete('/:id', deleteUser); // DELETE /api/users/1
```

### **controllers/user.controller.js** (El receptor)
```javascript
async function create(req, res, next) {
  // req = petición entrante
  // res = respuesta a devolver
  // next = siguiente paso
  const user = await userService.createUser(req.body);
  res.json(user);
}
```

### **services/user.service.js** (La lógica)
```javascript
async function createUser(data) {
  // Validar
  if (await userRepo.findByEmail(data.email)) {
    throw new ApiError(409, 'EMAIL_EXISTS', 'Email duplicado');
  }
  // Crear
  return await userRepo.create(data);
}
```

### **repositories/user.repository.js** (La BD)
```javascript
async function create(user) {
  const result = await db.query(
    'INSERT INTO users (...) VALUES (...)',
    [user.role_id, user.first_name, ...]
  );
  return result;
}
```

---

## Ejemplos prácticos

### Ejemplo 1: Crear un usuario

**Petición:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "role_id": 2
  }'
```

**Flujo:**
1. Routes recibe POST /api/users → llama a `controller.create`
2. Controller recibe `req.body` → llama a `userService.createUser(req.body)`
3. Service valida email → llama a `userRepo.create(data)`
4. Repository ejecuta INSERT en BD
5. Controller devuelve `res.status(201).json({ success: true, data: user })`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "role_id": 2,
    "created_at": "2025-12-02T10:30:00Z"
  }
}
```

---

### Ejemplo 2: Obtener un usuario por ID

**Petición:**
```bash
GET http://localhost:3000/api/users/1
```

**Flujo:**
1. Routes recibe GET /api/users/:id → `req.params.id = '1'` → llama a `controller.getById`
2. Controller convierte a número → llama a `userService.getUser(1)`
3. Service llama a `userRepo.findById(1)`
4. Repository ejecuta `SELECT * FROM users WHERE id = 1`
5. Devuelve el usuario (o error 404 si no existe)

**Respuesta:**
```json
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

### Ejemplo 3: Actualizar un usuario

**Petición:**
```bash
PUT http://localhost:3000/api/users/1
Body: { "first_name": "Carlos", "email": "carlos@example.com" }
```

**Flujo:**
1. Routes recibe PUT → llama a `controller.update`
2. Controller obtiene `id` de `req.params` y datos de `req.body`
3. Service valida que el usuario exista
4. Repository ejecuta UPDATE con los nuevos datos
5. Devuelve usuario actualizado

---

### Ejemplo 4: Error - Email duplicado

**Petición:**
```bash
POST /api/users
Body: { "email": "juan@example.com", ... } // Email ya existe
```

**Flujo:**
1. Service llama `userRepo.findByEmail("juan@example.com")`
2. Encuentra que ya existe → `throw new ApiError(409, 'EMAIL_EXISTS', '...')`
3. Error sube hasta el errorHandler (middleware)
4. ErrorHandler lo captura y devuelve:

**Respuesta (409 Conflict):**
```json
{
  "success": false,
  "error": "EMAIL_EXISTS",
  "message": "Email ya registrado"
}
```

---

## Conceptos clave para la defensa

### 1. **Request-Response Cycle**
- Cliente envía petición HTTP
- Express la recibe en la ruta correcta
- Controller → Service → Repository
- Devuelve respuesta al cliente

### 2. **Separación de responsabilidades**
- Routes: Mapeo de URLs
- Controllers: Recepción de peticiones
- Services: Lógica
- Repositories: BD
- Middlewares: Procesamiento global

### 3. **Async/Await**
- Las operaciones de BD son lentas (asincrónicas)
- `async function` indica que tiene `await` dentro
- `await` espera a que termine antes de continuar
- Si falla, lanza error que se captura con `try/catch`

### 4. **Parámetros SQL (Prepared Statements)**
```javascript
// ❌ MAL - SQL Injection
db.query(`SELECT * FROM users WHERE email = '${email}'`)

// ✅ BIEN - Parámetros seguros
db.query(`SELECT * FROM users WHERE email = ?`, [email])
```

### 5. **Códigos HTTP**
- 200: OK (GET, PUT exitoso)
- 201: Created (POST exitoso)
- 204: No Content (DELETE exitoso)
- 400: Bad Request (datos inválidos)
- 401: Unauthorized (no autenticado)
- 404: Not Found (recurso no existe)
- 409: Conflict (email duplicado, etc)
- 500: Server Error

---

## Próximas preguntas para la defensa

Prepárate para responder:

1. **¿Qué es Express?**
   → Framework de Node.js para crear APIs/servidores web

2. **¿Por qué separar en Routes, Controllers, Services, Repositories?**
   → Cada capa tiene una responsabilidad específica. Facilita testing y mantenimiento.

3. **¿Cómo llega una petición desde el cliente al controller?**
   → Cliente → HTTP → Express Routes → Controller

4. **¿Qué diferencia hay entre Controller y Service?**
   → Controller recibe petición, Service contiene lógica de negocio

5. **¿Para qué sirve el Repository?**
   → Acceder a la BD con SQL, separado de la lógica

6. **¿Qué es un Middleware?**
   → Código que se ejecuta antes de llegar a las rutas (ej: error handler)

7. **¿Por qué usar `?` en las queries?**
   → Prevenir SQL Injection (ataques de seguridad)

8. **¿Qué significa async/await?**
   → `async`: función que contiene operaciones asincrónicas. `await`: espera a que termine.

---

## 📝 Tareas para estudiar

1. Agregar un nuevo endpoint: `GET /api/users/:id/sessions` (sesiones del usuario)
2. Modificar el error handler para registrar errores en un archivo
3. Agregar validación de email antes de crear usuario
4. Implementar paginación en `GET /api/users?page=1&limit=10`
5. Agregar middleware de autenticación

¡Éxito en tu defensa! 🎓
