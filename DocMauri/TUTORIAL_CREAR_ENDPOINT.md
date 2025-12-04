# 🎯 Tutorial Práctico: Agregar un Nuevo Endpoint

Este documento te enseña cómo crear un nuevo endpoint desde cero, aplicando todo lo que aprendiste.

## Objetivo: Crear endpoint para obtener sesiones activas

```
GET /api/sessions/active  →  Devuelve todas las sesiones activas
```

---

## Paso 1: Crear el Repository

**Archivo:** `Server/src/repositories/session.repository.js`

```javascript
const db = require('../db/db');

// Obtener TODAS las sesiones activas
async function findAllActive() {
  const rows = await db.query(
    `SELECT s.id, s.user_id, s.table_id, s.start_time, s.session_type,
            s.final_cost, s.status,
            u.first_name, u.email,
            bt.code as table_code, tc.name as category_name, tc.base_price
     FROM sessions s
     LEFT JOIN users u ON s.user_id = u.id
     JOIN billiard_tables bt ON s.table_id = bt.id
     JOIN table_categories tc ON bt.category_id = tc.id
     WHERE s.status = 1
     ORDER BY s.start_time DESC`,
    []
  );
  return rows;
}

// Obtener sesiones activas por usuario
async function findActiveByUserId(userId) {
  const rows = await db.query(
    `SELECT s.id, s.user_id, s.table_id, s.start_time,
            bt.code as table_code, tc.name as category_name
     FROM sessions s
     JOIN billiard_tables bt ON s.table_id = bt.id
     JOIN table_categories tc ON bt.category_id = tc.id
     WHERE s.status = 1 AND s.user_id = ?
     ORDER BY s.start_time DESC`,
    [userId]
  );
  return rows;
}

module.exports = {
  findAllActive,
  findActiveByUserId
};
```

**¿Qué hace?**
- `findAllActive()`: Obtiene TODAS las sesiones con estado = 1 (activo)
- Usa JOIN para traer información del usuario, mesa y categoría
- Devuelve un array de objetos

---

## Paso 2: Crear el Service

**Archivo:** `Server/src/services/session.service.js`

```javascript
const sessionRepo = require('../repositories/session.repository');
const userRepo = require('../repositories/user.repository');
const ApiError = require('../middlewares/apiError');

// Obtener todas las sesiones activas
async function getActiveSessions() {
  const sessions = await sessionRepo.findAllActive();
  
  // Calcular duración de cada sesión
  const sessionsWithDuration = sessions.map(session => {
    const startTime = new Date(session.start_time);
    const now = new Date();
    const durationMinutes = Math.floor((now - startTime) / 60000);
    
    return {
      ...session,
      duration_minutes: durationMinutes,
      duration_hours: (durationMinutes / 60).toFixed(2)
    };
  });
  
  return sessionsWithDuration;
}

// Obtener sesiones activas de un usuario específico
async function getActiveSessionsByUser(userId) {
  // Validar que usuario exista
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  }
  
  const sessions = await sessionRepo.findActiveByUserId(userId);
  
  // Calcular duración
  return sessions.map(session => {
    const startTime = new Date(session.start_time);
    const now = new Date();
    const durationMinutes = Math.floor((now - startTime) / 60000);
    
    return {
      ...session,
      duration_minutes: durationMinutes,
      duration_hours: (durationMinutes / 60).toFixed(2)
    };
  });
}

module.exports = {
  getActiveSessions,
  getActiveSessionsByUser
};
```

**¿Qué hace?**
- `getActiveSessions()`: Obtiene todas las sesiones y calcula duración
- `getActiveSessionsByUser()`: Obtiene sesiones de un usuario, valida que exista
- Agrega información calculada (duración) a cada sesión

---

## Paso 3: Crear el Controller

**Archivo:** `Server/src/controllers/session.controller.js`

```javascript
const sessionService = require('../services/session.service');

// Obtener todas las sesiones activas
async function getActiveSessions(req, res, next) {
  try {
    const sessions = await sessionService.getActiveSessions();
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (err) {
    next(err);
  }
}

// Obtener sesiones activas de un usuario
async function getActiveSessionsByUser(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const sessions = await sessionService.getActiveSessionsByUser(userId);
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getActiveSessions,
  getActiveSessionsByUser
};
```

**¿Qué hace?**
- `getActiveSessions()`: Recibe petición GET, llama service, devuelve sesiones
- `getActiveSessionsByUser()`: Recibe GET con :userId en params
- Devuelve respuesta con `res.json()`
- Usa `try/catch` para capturar errores y enviar a `next(err)`

---

## Paso 4: Crear las Rutas

**Archivo:** `Server/src/routes/session.routes.js`

Agregar estas líneas:

```javascript
const express = require('express');
const controller = require('../controllers/session.controller');

const router = express.Router();

// Rutas existentes (si las hay)
router.get('/', controller.getAll);           // GET /api/sessions
router.get('/:id', controller.getById);       // GET /api/sessions/1
router.post('/', controller.create);          // POST /api/sessions
router.put('/:id', controller.update);        // PUT /api/sessions/1
router.delete('/:id', controller.delete);     // DELETE /api/sessions/1

// NUEVAS RUTAS
router.get('/active', controller.getActiveSessions);              // GET /api/sessions/active
router.get('/user/:userId/active', controller.getActiveSessionsByUser); // GET /api/sessions/user/5/active

module.exports = router;
```

**¡IMPORTANTE!** Las rutas específicas deben ir **ANTES** de las dinámicas:
```javascript
router.get('/active', ...);        // ✅ PRIMERO (específica)
router.get('/:id', ...);           // ✅ SEGUNDO (dinámica)
```

De lo contrario, `/api/sessions/active` sería interpretado como `/:id` con id="active".

---

## Paso 5: Verificar en index.js

Asegúrate que las rutas estén montadas en `Server/index.js`:

```javascript
const sessionRoutes = require("./src/routes/session.routes");

// ...

app.use('/api/sessions', sessionRoutes);
```

Si ya está, ¡perfecto! Si no, agrégalo.

---

## Paso 6: Testear con cURL

### Obtener todas las sesiones activas

```bash
curl http://localhost:3000/api/sessions/active
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "table_id": 3,
      "start_time": "2025-12-02T10:30:00Z",
      "first_name": "Juan",
      "email": "juan@example.com",
      "table_code": "MESA-001",
      "category_name": "Pool - Standard",
      "base_price": 12.50,
      "status": 1,
      "duration_minutes": 45,
      "duration_hours": "0.75"
    }
  ],
  "count": 1
}
```

### Obtener sesiones de un usuario específico

```bash
curl http://localhost:3000/api/sessions/user/5/active
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "table_id": 3,
      "start_time": "2025-12-02T10:30:00Z",
      "table_code": "MESA-001",
      "category_name": "Pool - Standard",
      "duration_minutes": 45,
      "duration_hours": "0.75"
    }
  ],
  "count": 1
}
```

---

## Paso 7: Manejar Errores

Si el usuario no existe (GET /api/sessions/user/999/active):

```json
{
  "success": false,
  "error": "USER_NOT_FOUND",
  "message": "Usuario no encontrado",
  "timestamp": "2025-12-02T10:35:00Z"
}
```

Código HTTP: 404 Not Found

---

## Resumen: Qué Acabas de Hacer

```
1. Repository   → Escribiste la query SQL para obtener sesiones activas
2. Service      → Agregaste validación y lógica (calcular duración)
3. Controller   → Recibiste la petición y devolviste respuesta
4. Routes       → Mapeaste las URLs a los controllers
5. index.js     → Montaste las rutas en la aplicación

Flujo:
GET /api/sessions/active
  ↓
session.routes.js busca coincidencia → /active
  ↓
llama a controller.getActiveSessions
  ↓
llama a sessionService.getActiveSessions
  ↓
llama a sessionRepo.findAllActive (SQL query)
  ↓
calcula duración en service
  ↓
devuelve respuesta JSON
```

---

## Variación: Filtrar por Fecha

Si quisieras agregar filtro de fecha:

```javascript
// GET /api/sessions/active?from=2025-12-01&to=2025-12-02

async function getActiveSessionsFiltered(req, res, next) {
  try {
    const { from, to } = req.query;
    const sessions = await sessionService.getActiveSessionsFiltered(from, to);
    res.json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
}
```

```javascript
// En service
async function getActiveSessionsFiltered(fromDate, toDate) {
  if (!fromDate || !toDate) {
    throw new ApiError(400, 'DATES_REQUIRED', 'Fechas requeridas');
  }
  
  const sessions = await sessionRepo.findActiveFiltered(fromDate, toDate);
  return sessions.map(session => ({
    ...session,
    duration_minutes: calculateDuration(session.start_time)
  }));
}
```

```javascript
// En repository
async function findActiveFiltered(fromDate, toDate) {
  return await db.query(
    `SELECT * FROM sessions
     WHERE status = 1
     AND start_time >= ?
     AND start_time <= ?
     ORDER BY start_time DESC`,
    [fromDate, toDate]
  );
}
```

```
Uso:
curl "http://localhost:3000/api/sessions/active?from=2025-12-01&to=2025-12-02"
```

---

## Variación: Agregar Búsqueda

```javascript
// GET /api/sessions/search?user_id=5&table_id=3

async function searchSessions(req, res, next) {
  try {
    const { user_id, table_id, status } = req.query;
    const sessions = await sessionService.searchSessions({
      user_id: user_id ? Number(user_id) : null,
      table_id: table_id ? Number(table_id) : null,
      status: status ? Number(status) : null
    });
    res.json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
}
```

---

## Checklist: Paso a Paso

- [ ] Escribí queries en repository (con parámetros `?`)
- [ ] Escribí lógica y validaciones en service
- [ ] Escribí funciones en controller que usan `req`, `res`, `next`
- [ ] Agregué rutas en routes (y antes las dinámicas)
- [ ] Verifiqué que las rutas estén montadas en index.js
- [ ] Probé con cURL
- [ ] Manejé errores (ApiError)
- [ ] Respuestas tienen formato consistente
- [ ] Todo funciona con try/catch

---

## Errores Comunes

### ❌ Error 1: Ruta dinámica antes de específica

```javascript
// MAL
router.get('/:id', ...);          // Esto capturaría /active
router.get('/active', ...);       // Nunca se ejecutaría

// BIEN
router.get('/active', ...);       // PRIMERO específica
router.get('/:id', ...);          // SEGUNDO dinámica
```

### ❌ Error 2: Olvidar convertir parámetros

```javascript
// MAL
const userId = req.params.userId; // Es string "5"

// BIEN
const userId = Number(req.params.userId); // Es número 5
```

### ❌ Error 3: No validar en service

```javascript
// MAL - Validar en controller
async function getSessions(req, res) {
  if (!req.params.userId) {
    res.status(400).json({ error: 'Required' });
  }
}

// BIEN - Validar en service
async function getSessions(userId) {
  if (!userId) throw new ApiError(400, '...', '...');
}
```

### ❌ Error 4: Olvidar `next(err)`

```javascript
// MAL - Error no se maneja
async function getAll(req, res) {
  try {
    const data = await service.getAll();
  } catch (err) {
    // Error no se envía a errorHandler
  }
}

// BIEN
async function getAll(req, res, next) {
  try {
    const data = await service.getAll();
  } catch (err) {
    next(err); // Envía al errorHandler
  }
}
```

---

## Ejercicios Adicionales

1. **Crear endpoint para obtener mesas ocupadas:**
   - GET /api/tables/occupied
   - Devuelve mesas con status = 2

2. **Crear endpoint para obtener reservaciones próximas:**
   - GET /api/reservations/upcoming
   - Devuelve reservaciones con fecha > hoy

3. **Crear endpoint de estadísticas:**
   - GET /api/stats/revenue?from=2025-12-01&to=2025-12-02
   - Suma pagos en rango de fechas

4. **Crear endpoint de búsqueda avanzada:**
   - GET /api/users/search?email=juan&role=admin
   - Filtra por múltiples criterios

---

¡Ya sabes cómo crear nuevos endpoints! 🚀
