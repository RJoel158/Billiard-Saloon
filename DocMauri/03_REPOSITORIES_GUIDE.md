# 📦 Guía de Repositories

## ¿Qué son los Repositories?

Los **repositories** son capas de **acceso a datos**. Contienen todas las **queries SQL** y se encargan de:
- ✅ Ejecutar SELECT, INSERT, UPDATE, DELETE
- ✅ Adaptar queries según el esquema disponible
- ✅ Manejar soft deletes y is_active
- ✅ Devolver datos en formato consistente
- ✅ No incluyen lógica de negocio

```
[SERVICES]
     ↓ Llamadas para obtener datos
[REPOSITORIES] ← Aquí estamos (Acceso a BD)
     ↓ Queries SQL
[BASE DE DATOS]
```

---

## 📋 Estructura de un Repository

### Patrón General

```javascript
const db = require('../db/db');

// Obtener todos
async function findAll() {
  const rows = await db.query('SELECT ... FROM tabla');
  return rows;
}

// Obtener por ID
async function findById(id) {
  const rows = await db.query('SELECT ... FROM tabla WHERE id = ?', [id]);
  return rows[0] || null;
}

// Crear
async function create(data) {
  await db.query('INSERT INTO tabla (...) VALUES (...)', [data.field1, ...]);
  const rows = await db.query('SELECT ... FROM tabla WHERE id = LAST_INSERT_ID()');
  return rows[0] || null;
}

// Actualizar
async function update(id, data) {
  await db.query('UPDATE tabla SET ... WHERE id = ?', [data.field1, ..., id]);
  return await findById(id);
}

// Eliminar (soft delete)
async function deleteById(id) {
  const result = await db.query('UPDATE tabla SET is_active = 0 WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, deleteById };
```

---

## 🔍 Repositories Disponibles

### 1. User Repository
**Archivo:** `user.repository.js`

Gestiona datos de usuarios en la tabla `users`.

```javascript
const db = require('../db/db');
const schema = require('../db/schema');

// Utilidad: verificar si la BD tiene columna is_active
function _hasActive() {
  return schema.hasColumn('users', 'is_active');
}

// ✅ Obtener todos los usuarios (solo activos si existe is_active)
async function findAll() {
  const extra = _hasActive() ? ' WHERE is_active = 1' : '';
  const rows = await db.query(
    `SELECT id, role_id, first_name, last_name, email, phone, created_at, 
            password_changed FROM users${extra}`
  );
  return rows;
}

// ✅ Obtener usuario por ID
async function findById(id) {
  const extra = _hasActive() ? ' AND is_active = 1' : '';
  const rows = await db.query(
    `SELECT id, role_id, first_name, last_name, email, password_hash, 
            phone, created_at, password_changed, reset_code, 
            reset_code_expiry FROM users WHERE id = ?${extra}`,
    [id]
  );
  return rows[0] || null;
}

// ✅ Obtener usuario por email
async function findByEmail(email) {
  const extra = _hasActive() ? ' AND is_active = 1' : '';
  const rows = await db.query(
    `SELECT id, role_id, first_name, last_name, email, password_changed 
     FROM users WHERE email = ?${extra}`,
    [email]
  );
  return rows[0] || null;
}

// ✅ Crear usuario
async function create(user) {
  await db.query(
    `INSERT INTO users (role_id, first_name, last_name, email, 
                        password_hash, phone, password_changed) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      user.role_id || 2,           // Default: cliente
      user.first_name,
      user.last_name,
      user.email,
      user.password_hash || '',
      user.phone || null,
      user.password_changed || 0   // Default: cambio pendiente
    ]
  );
  
  // Retornar el usuario creado
  const rows = await db.query(
    `SELECT id, role_id, first_name, last_name, email, phone, 
            created_at, password_changed FROM users WHERE id = LAST_INSERT_ID()`
  );
  return rows[0] || null;
}

// ✅ Actualizar usuario
async function update(id, user) {
  const fields = [];
  const values = [];
  
  // Construir UPDATE dinámico solo con campos presentes
  if (user.role_id !== undefined) { fields.push('role_id = ?'); values.push(user.role_id); }
  if (user.first_name !== undefined) { fields.push('first_name = ?'); values.push(user.first_name); }
  if (user.last_name !== undefined) { fields.push('last_name = ?'); values.push(user.last_name); }
  if (user.email !== undefined) { fields.push('email = ?'); values.push(user.email); }
  if (user.password_hash !== undefined) { fields.push('password_hash = ?'); values.push(user.password_hash); }
  if (user.phone !== undefined) { fields.push('phone = ?'); values.push(user.phone); }
  if (user.password_changed !== undefined) { fields.push('password_changed = ?'); values.push(user.password_changed); }
  if (user.reset_code !== undefined) { fields.push('reset_code = ?'); values.push(user.reset_code); }
  if (user.reset_code_expiry !== undefined) { fields.push('reset_code_expiry = ?'); values.push(user.reset_code_expiry); }
  
  // Si no hay campos para actualizar, retornar el actual
  if (fields.length === 0) return await findById(id);
  
  // Ejecutar UPDATE
  values.push(id);
  await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  
  // Retornar actualizado
  return await findById(id);
}

// ✅ Eliminar usuario (soft delete)
async function deleteById(id) {
  if (_hasActive()) {
    // Soft delete: marcar como inactivo
    const result = await db.query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
  
  // Physical delete: eliminar fila (si no existe is_active)
  const result = await db.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findById, findByEmail, create, findAll, update, deleteById };
```

**Características Especiales:**
- ✅ **Soft Delete**: Marca `is_active = 0` en lugar de eliminar
- ✅ **Adaptabilidad**: Verifica si BD tiene `is_active` antes de usarla
- ✅ **Selección parcial de campos**: No retorna `password_hash` en findAll
- ✅ **Búsqueda por email**: Método específico para login


## 🎯 Responsabilidades de Repositories

| Lo que SI hace | Lo que NO hace |
|---|---|
| ✅ Ejecutar queries SQL | ❌ Validar datos |
| ✅ Adaptar queries al esquema | ❌ Lógica de negocio |
| ✅ Soft deletes | ❌ Enviar emails |
| ✅ Retornar datos formateados | ❌ Generar tokens |
| ✅ Manejar conexiones a BD | ❌ Responder al cliente |

