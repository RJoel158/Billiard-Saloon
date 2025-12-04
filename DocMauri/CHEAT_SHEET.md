# 📚 Cheat Sheet Express.js + tu Backend

## Instalación y Setup

```bash
# Instalar Express
npm install express

# Instalar dependencias principales
npm install express mysql2 bcrypt cors dotenv

# Instalar dev dependencies
npm install --save-dev nodemon

# Iniciar en desarrollo (con auto-reload)
npm run dev

# Iniciar en producción
npm start
```

---

## Estructura Básica de Express

```javascript
// Importar
const express = require('express');

// Crear aplicación
const app = express();

// Middleware
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'Hola' });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// Iniciar
app.listen(3000, () => {
  console.log('Servidor en puerto 3000');
});
```

---

## Métodos HTTP

```javascript
app.get('/path', (req, res) => {});      // Obtener
app.post('/path', (req, res) => {});     // Crear
app.put('/path', (req, res) => {});      // Actualizar
app.delete('/path', (req, res) => {});   // Eliminar
app.patch('/path', (req, res) => {});    // Actualizar parcial
```

---

## Parámetros de Petición

```javascript
// URL: POST /api/users/5?role=admin
// Body: { "name": "Juan" }

app.post('/api/users/:id', (req, res) => {
  req.params.id;      // "5"
  req.query.role;     // "admin"
  req.body.name;      // "Juan"
  req.method;         // "POST"
  req.path;           // "/api/users/5"
  req.url;            // "/api/users/5?role=admin"
  req.headers;        // { "content-type": "application/json" }
});
```

---

## Respuestas

```javascript
// JSON
res.json({ data: 'value' });

// Con código HTTP
res.status(200).json({ data: 'value' });
res.status(201).json({ data: 'value' });
res.status(400).json({ error: 'Invalid' });
res.status(404).json({ error: 'Not found' });
res.status(500).json({ error: 'Server error' });

// Text
res.send('Texto plano');

// HTML
res.send('<h1>HTML</h1>');

// Archivo
res.download('file.pdf');

// Redirigir
res.redirect('/other-path');

// Sin contenido
res.status(204).send();

// Headers personalizados
res.set('X-Custom-Header', 'value');
```

---

## Códigos de Estado

```
2XX - ÉXITO
200 OK                  Solicitud exitosa
201 Created             Recurso creado
202 Accepted            Aceptado pero sin procesar
204 No Content          Éxito sin devolver datos

3XX - REDIRECCIÓN
301 Moved Permanently   Redirigir permanentemente
302 Found               Redirigir temporalmente

4XX - ERROR DEL CLIENTE
400 Bad Request         Solicitud inválida
401 Unauthorized        No autenticado
403 Forbidden           No tiene permiso
404 Not Found           Recurso no existe
409 Conflict            Conflicto (duplicado, etc)
422 Unprocessable       Datos no procesables

5XX - ERROR DEL SERVIDOR
500 Internal Error      Error interno
502 Bad Gateway         Gateway error
503 Service Unavailable Servicio no disponible
```

---

## Routing

```javascript
// Básico
app.get('/users', (req, res) => {});

// Con parámetro
app.get('/users/:id', (req, res) => {
  const id = req.params.id;
});

// Con múltiples parámetros
app.get('/users/:userId/posts/:postId', (req, res) => {
  const userId = req.params.userId;
  const postId = req.params.postId;
});

// Con query
app.get('/users', (req, res) => {
  const page = req.query.page;
  const limit = req.query.limit;
});

// Con parámetro opcional
app.get('/users/:id?', (req, res) => {});

// Con expresión regular
app.get(/^\/api\/.*/, (req, res) => {});

// Router separado
const router = express.Router();
router.get('/', (req, res) => {});
app.use('/api/users', router);
```

---

## Middleware

```javascript
// Middleware global
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next(); // Importante: continuar
});

// Middleware en ruta específica
app.get('/admin', (req, res, next) => {
  if (req.headers['x-api-key'] === 'secret') {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}, (req, res) => {
  res.send('Admin');
});

// Middleware de error (4 parámetros!)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// Orden es importante
app.use(middleware1);
app.use(middleware2);
app.get('/', handler);
app.use(errorHandler); // SIEMPRE AL FINAL
```

---

## Async/Await

```javascript
// Función asincrónica
async function getData() {
  return 'data';
}

// En ruta
app.get('/data', async (req, res, next) => {
  try {
    const data = await getData();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Con await
const data = await getData();
const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);

// Sin await (problema - no espera)
const data = getData(); // Promise sin resolver
```

---

## Base de Datos (MySQL2)

```javascript
const mysql = require('mysql2/promise');

// Crear conexión
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'billiard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Query simple
const [rows] = await pool.query('SELECT * FROM users');

// Query con parámetros (importante!)
const [rows] = await pool.query(
  'SELECT * FROM users WHERE id = ? AND status = ?',
  [5, 1]
);

// Insert
const [result] = await pool.query(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['Juan', 'juan@example.com']
);
const insertId = result.insertId;

// Update
const [result] = await pool.query(
  'UPDATE users SET name = ? WHERE id = ?',
  ['Carlos', 5]
);
const affectedRows = result.affectedRows;

// Delete
const [result] = await pool.query(
  'DELETE FROM users WHERE id = ?',
  [5]
);
```

---

## Patrón Repository

```javascript
// repository.js
const db = require('./db');

async function findById(id) {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function create(user) {
  const [result] = await db.query(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [user.name, user.email]
  );
  return await findById(result.insertId);
}

module.exports = { findById, create };
```

---

## Patrón Service

```javascript
// service.js
const repo = require('./repository');
const ApiError = require('./apiError');

async function getUser(id) {
  const user = await repo.findById(id);
  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  }
  return user;
}

async function createUser(data) {
  if (!data.email) {
    throw new ApiError(400, 'EMAIL_REQUIRED', 'Email requerido');
  }
  return await repo.create(data);
}

module.exports = { getUser, createUser };
```

---

## Patrón Controller

```javascript
// controller.js
const service = require('./service');

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const user = await service.getUser(id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const user = await service.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getById, create };
```

---

## Error Personalizado

```javascript
// apiError.js
class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

module.exports = ApiError;

// Uso
throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
throw new ApiError(409, 'EMAIL_EXISTS', 'Email ya registrado');
```

---

## Error Handler

```javascript
// errorHandler.js
function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.code,
      message: err.message
    });
  }

  res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: 'Error interno del servidor'
  });
}

module.exports = { errorHandler };
```

---

## Validación

```javascript
// Email válido
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Número positivo
function isPositive(num) {
  return Number(num) > 0;
}

// No vacío
function isNotEmpty(str) {
  return str && str.trim().length > 0;
}

// Uso en service
if (!isValidEmail(data.email)) {
  throw new ApiError(400, 'INVALID_EMAIL', 'Email inválido');
}
```

---

## Encriptación (Bcrypt)

```javascript
const bcrypt = require('bcrypt');

// Hash (crear)
const hashed = await bcrypt.hash('password123', 10);
// Guardar hashed en BD

// Verificar
const isValid = await bcrypt.compare('password123', hashedFromDB);
if (isValid) {
  console.log('Contraseña correcta');
}
```

---

## Variables de Entorno

```javascript
// .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=billiard
PORT=3000

// Cargar
require('dotenv').config();

// Usar
const host = process.env.DB_HOST;
const port = process.env.PORT || 3000;
```

---

## CORS

```javascript
const cors = require('cors');

// Permitir todos
app.use(cors());

// Permitir específico
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
```

---

## Peticiones con cURL

```bash
# GET
curl http://localhost:3000/api/users

# GET con params
curl "http://localhost:3000/api/users/5?role=admin"

# POST
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan","email":"juan@example.com"}'

# PUT
curl -X PUT http://localhost:3000/api/users/5 \
  -H "Content-Type: application/json" \
  -d '{"name":"Carlos"}'

# DELETE
curl -X DELETE http://localhost:3000/api/users/5

# Con headers
curl -H "X-API-Key: secret" http://localhost:3000/api/data

# Ver headers de respuesta
curl -i http://localhost:3000/api/users
```

---

## Prueba Rápida en JS

```javascript
// Llamar API desde Node.js
const http = require('http');

http.get('http://localhost:3000/api/users', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.parse(data)));
});

// O con fetch (Node 18+)
const response = await fetch('http://localhost:3000/api/users');
const data = await response.json();
console.log(data);
```

---

## Debugging

```javascript
// Logs
console.log('Información:', data);
console.error('Error:', err);

// Debugger
debugger;

// Para ejecutar con debug
// node --inspect index.js

// Ver en chrome://inspect
```

---

## Rápido Checklist

- [ ] `npm install express`
- [ ] `const app = express()`
- [ ] `app.use(express.json())`
- [ ] Definir rutas
- [ ] Manejar errores
- [ ] `app.listen(3000)`
- [ ] Probar con cURL o cliente HTTP

---

## Estructura típica de carpetas

```
Server/
├── index.js                 # Punto de entrada
├── package.json
├── .env                     # Variables de entorno
└── src/
    ├── config/              # Configuración
    │   └── index.js
    ├── db/                  # Base de datos
    │   ├── db.js
    │   └── schema.js
    ├── repositories/        # Acceso a datos
    │   ├── user.repository.js
    │   └── ...
    ├── services/            # Lógica
    │   ├── user.service.js
    │   └── ...
    ├── controllers/         # Handlers
    │   ├── user.controller.js
    │   └── ...
    ├── routes/              # Rutas
    │   ├── user.routes.js
    │   └── ...
    ├── middlewares/         # Middleware
    │   ├── errorHandler.js
    │   └── apiError.js
    └── utils/               # Helpers
        ├── response.js
        └── validators.js
```

---

## Respuesta Estándar

```javascript
// Éxito
{
  "success": true,
  "data": { /* datos */ }
}

// Éxito con paginación
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}

// Error
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Descripción del error"
}
```

---

¡Ahora tienes todo a mano! 🚀
