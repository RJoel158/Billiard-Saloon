# 🔧 Ejemplos Avanzados de tu Backend

## 1. Estructura completa: Crear una mesa de billar

### Rutas (routes/billiard-table.routes.js)
```javascript
const express = require('express');
const controller = require('../controllers/billiard-table.controller');

const router = express.Router();

router.get('/', controller.getAll);           // GET /api/tables
router.get('/:id', controller.getById);       // GET /api/tables/5
router.post('/', controller.create);          // POST /api/tables
router.put('/:id', controller.update);        // PUT /api/tables/5
router.delete('/:id', controller.delete);     // DELETE /api/tables/5

module.exports = router;
```

### Controller (controllers/billiard-table.controller.js)
```javascript
const tableService = require('../services/billiard-table.service');

async function create(req, res, next) {
  try {
    // req.body contiene: { category_id, code, description, status }
    const table = await tableService.createTable(req.body);
    res.status(201).json({ success: true, data: table });
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const tables = await tableService.getAllTables();
    res.json({ success: true, data: tables });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const table = await tableService.getTable(id);
    res.json({ success: true, data: table });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const table = await tableService.updateTable(id, req.body);
    res.json({ success: true, data: table });
  } catch (err) {
    next(err);
  }
}

async function deleteTable(req, res, next) {
  try {
    const id = Number(req.params.id);
    await tableService.deleteTable(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getAll, getById, update, deleteTable };
```

### Service (services/billiard-table.service.js)
```javascript
const tableRepo = require('../repositories/billiard-table.repository');
const categoryRepo = require('../repositories/table-category.repository');
const ApiError = require('../middlewares/apiError');

async function createTable(data) {
  // Validar que categoria exista
  const category = await categoryRepo.findById(data.category_id);
  if (!category) {
    throw new ApiError(404, 'CATEGORY_NOT_FOUND', 'Categoría no encontrada');
  }

  // Validar que codigo sea único
  const existing = await tableRepo.findByCode(data.code);
  if (existing) {
    throw new ApiError(409, 'CODE_EXISTS', 'Código ya existe');
  }

  // Crear tabla
  return await tableRepo.create(data);
}

async function getTable(id) {
  const table = await tableRepo.findById(id);
  if (!table) {
    throw new ApiError(404, 'TABLE_NOT_FOUND', 'Mesa no encontrada');
  }
  return table;
}

async function getAllTables() {
  return await tableRepo.findAll();
}

async function updateTable(id, data) {
  // Verificar que exista
  const existing = await tableRepo.findById(id);
  if (!existing) {
    throw new ApiError(404, 'TABLE_NOT_FOUND', 'Mesa no encontrada');
  }

  // Si cambió la categoría, verificar que exista
  if (data.category_id && data.category_id !== existing.category_id) {
    const category = await categoryRepo.findById(data.category_id);
    if (!category) {
      throw new ApiError(404, 'CATEGORY_NOT_FOUND', 'Categoría no encontrada');
    }
  }

  return await tableRepo.update(id, data);
}

async function deleteTable(id) {
  const existing = await tableRepo.findById(id);
  if (!existing) {
    throw new ApiError(404, 'TABLE_NOT_FOUND', 'Mesa no encontrada');
  }
  return await tableRepo.deleteById(id);
}

module.exports = {
  createTable,
  getTable,
  getAllTables,
  updateTable,
  deleteTable
};
```

### Repository (repositories/billiard-table.repository.js)
```javascript
const db = require('../db/db');

async function findById(id) {
  const rows = await db.query(
    `SELECT bt.id, bt.category_id, bt.code, bt.description, bt.status, 
            tc.name as category_name, tc.base_price
     FROM billiard_tables bt
     JOIN table_categories tc ON bt.category_id = tc.id
     WHERE bt.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findByCode(code) {
  const rows = await db.query(
    'SELECT id FROM billiard_tables WHERE code = ?',
    [code]
  );
  return rows[0] || null;
}

async function create(table) {
  await db.query(
    'INSERT INTO billiard_tables (category_id, code, description, status) VALUES (?, ?, ?, ?)',
    [table.category_id, table.code, table.description || null, table.status || 1]
  );

  // Devolver la mesa creada
  const result = await db.query('SELECT * FROM billiard_tables WHERE code = ?', [table.code]);
  return result[0];
}

async function findAll() {
  return await db.query(
    `SELECT bt.id, bt.category_id, bt.code, bt.description, bt.status,
            tc.name as category_name, tc.base_price
     FROM billiard_tables bt
     JOIN table_categories tc ON bt.category_id = tc.id
     ORDER BY bt.id DESC`
  );
}

async function update(id, table) {
  await db.query(
    `UPDATE billiard_tables 
     SET category_id = ?, code = ?, description = ?, status = ?
     WHERE id = ?`,
    [table.category_id, table.code, table.description, table.status, id]
  );
  return await findById(id);
}

async function deleteById(id) {
  const result = await db.query('DELETE FROM billiard_tables WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findById, findByCode, create, findAll, update, deleteById };
```

---

## 2. Ejemplo: Reservación con validaciones complejas

### Service con lógica compleja (services/reservation.service.js)
```javascript
const reservationRepo = require('../repositories/reservation.repository');
const tableRepo = require('../repositories/billiard-table.repository');
const userRepo = require('../repositories/user.repository');
const ApiError = require('../middlewares/apiError');

async function createReservation(data) {
  // 1. Validar que usuario exista
  const user = await userRepo.findById(data.user_id);
  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  }

  // 2. Validar que tabla exista y esté disponible
  const table = await tableRepo.findById(data.table_id);
  if (!table) {
    throw new ApiError(404, 'TABLE_NOT_FOUND', 'Mesa no encontrada');
  }

  if (table.status !== 1) { // 1 = available
    throw new ApiError(409, 'TABLE_NOT_AVAILABLE', 'Mesa no disponible');
  }

  // 3. Validar que la fecha sea válida (no en el pasado)
  const reservation_date = new Date(data.reservation_date);
  if (reservation_date < new Date()) {
    throw new ApiError(400, 'INVALID_DATE', 'Fecha no puede ser en el pasado');
  }

  // 4. Validar que no haya conflicto de horario
  const conflicts = await reservationRepo.findConflicts(
    data.table_id,
    data.reservation_date,
    data.start_time,
    data.end_time
  );

  if (conflicts.length > 0) {
    throw new ApiError(409, 'TIME_CONFLICT', 'Horario no disponible');
  }

  // 5. Si todo está bien, crear
  return await reservationRepo.create(data);
}

module.exports = { createReservation };
```

---

## 3. Ejemplo: Endpoint con Query Parameters (Paginación)

### Route
```javascript
router.get('/', controller.getAll); // GET /api/users?page=1&limit=10
```

### Controller
```javascript
async function getAll(req, res, next) {
  try {
    // req.query extrae parámetros de la URL
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await userService.getAllUsersPaginated(page, limit);
    res.json({
      success: true,
      data: result.users,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}
```

### Service
```javascript
async function getAllUsersPaginated(page, limit) {
  const offset = (page - 1) * limit;
  const users = await userRepo.findAllPaginated(offset, limit);
  const total = await userRepo.count();

  return { users, total };
}
```

### Repository
```javascript
async function findAllPaginated(offset, limit) {
  return await db.query(
    'SELECT id, first_name, last_name, email FROM users LIMIT ? OFFSET ?',
    [limit, offset]
  );
}

async function count() {
  const result = await db.query('SELECT COUNT(*) as total FROM users');
  return result[0].total;
}
```

---

## 4. Ejemplo: Cálculo dinámico (Dynamic Pricing)

### Service (services/dynamic-pricing.service.js)
```javascript
const dynamicPricingRepo = require('../repositories/dynamic-pricing.repository');
const categoryRepo = require('../repositories/table-category.repository');

async function calculatePrice(category_id, start_time) {
  // 1. Obtener precio base
  const category = await categoryRepo.findById(category_id);
  if (!category) {
    throw new ApiError(404, 'CATEGORY_NOT_FOUND', 'Categoría no encontrada');
  }

  let basePrice = category.base_price;

  // 2. Obtener precios dinámicos activos
  const pricings = await dynamicPricingRepo.findActiveByCategory(category_id);

  let finalPrice = basePrice;

  // 3. Aplicar descuentos/aumentos según reglas
  for (const pricing of pricings) {
    if (pricing.type === 1) { // peak_hour
      // Si está en rango de horas
      const hour = new Date(start_time).getHours();
      if (hour >= pricing.time_start && hour <= pricing.time_end) {
        finalPrice *= (1 + pricing.percentage / 100);
      }
    }

    if (pricing.type === 2) { // weekend
      const day = new Date(start_time).getDay();
      if (day === 0 || day === 6) { // Domingo o sábado
        finalPrice *= (1 + pricing.percentage / 100);
      }
    }
  }

  return {
    base_price: basePrice,
    final_price: finalPrice.toFixed(2),
    applied_rules: pricings.map(p => p.type)
  };
}

module.exports = { calculatePrice };
```

---

## 5. Ejemplo: Sesión con cálculo de costo

### Controller (controllers/session.controller.js)
```javascript
async function closeSession(req, res, next) {
  try {
    const sessionId = Number(req.params.id);
    const session = await sessionService.closeSession(sessionId);
    
    res.json({
      success: true,
      data: {
        id: session.id,
        duration_minutes: session.duration_minutes,
        base_cost: session.base_cost,
        final_cost: session.final_cost,
        status: 'closed'
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { closeSession };
```

### Service (services/session.service.js)
```javascript
async function closeSession(id) {
  // 1. Obtener sesión
  const session = await sessionRepo.findById(id);
  if (!session) {
    throw new ApiError(404, 'SESSION_NOT_FOUND', 'Sesión no encontrada');
  }

  if (session.status === 2) {
    throw new ApiError(409, 'SESSION_CLOSED', 'Sesión ya está cerrada');
  }

  // 2. Calcular duración
  const endTime = new Date();
  const startTime = new Date(session.start_time);
  const durationMinutes = (endTime - startTime) / 60000; // convertir ms a minutos
  const durationHours = durationMinutes / 60;

  // 3. Obtener precio de la categoría
  const table = await tableRepo.findById(session.table_id);
  const category = await categoryRepo.findById(table.category_id);

  // 4. Calcular costo
  const baseCost = category.base_price * durationHours;
  const dynamicPrice = await dynamicPricingService.calculatePrice(
    table.category_id,
    session.start_time
  );
  const finalCost = baseCost * (1 + dynamicPrice.discount / 100);

  // 5. Actualizar sesión
  return await sessionRepo.update(id, {
    end_time: endTime,
    status: 2,
    final_cost: finalCost
  });
}

module.exports = { closeSession };
```

---

## 6. Error Handling Completo

### Middleware (middlewares/errorHandler.js)
```javascript
const ApiError = require('./apiError');

function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);

  // Es nuestro ApiError personalizado
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.code,
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Error de validación de datos
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: err.message
    });
  }

  // Error de la BD
  if (err.code && err.code.startsWith('ER_')) {
    return res.status(409).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Error en la base de datos'
    });
  }

  // Error desconocido
  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
}

module.exports = { errorHandler };
```

---

## 7. Peticiones cURL para probar

### Crear usuario
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "role_id": 2,
    "phone": "1234567890"
  }'
```

### Obtener con paginación
```bash
curl http://localhost:3000/api/users?page=1&limit=5
```

### Crear mesa
```bash
curl -X POST http://localhost:3000/api/tables \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": 1,
    "code": "MESA-001",
    "description": "Mesa de pool estándar",
    "status": 1
  }'
```

### Actualizar mesa
```bash
curl -X PUT http://localhost:3000/api/tables/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": 2
  }'
```

### Eliminar mesa
```bash
curl -X DELETE http://localhost:3000/api/tables/1
```

---

## 8. Respuestas esperadas

### Éxito
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

### Error
```json
{
  "success": false,
  "error": "EMAIL_EXISTS",
  "message": "Email ya registrado",
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```

---

## Conceptos para memorizar

| Concepto | Qué es | Ejemplo |
|----------|--------|---------|
| req.body | Datos enviados en POST/PUT | `{ "email": "juan@example.com" }` |
| req.params | Parámetros de URL | `/:id` → `req.params.id` |
| req.query | Parámetros de query string | `?page=1` → `req.query.page` |
| res.json() | Devuelve JSON | `res.json({ data })` |
| res.status() | Código HTTP | `res.status(201)` |
| await | Espera operación async | `const user = await userRepo.find()` |
| throw | Lanza error | `throw new ApiError(404, ...)` |
| try/catch | Captura errores | `try { } catch(err) { next(err) }` |

¡Ahora estás listo para la defensa! 🚀
