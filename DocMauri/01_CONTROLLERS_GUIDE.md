# 🎮 Guía de Controllers

## ¿Qué son los Controllers?

Los **controllers** son funciones que **manejan las solicitudes HTTP** del cliente y **devuelven respuestas**. Son el intermediario entre las **rutas** y la **lógica de negocio** (services).

```
Cliente (Frontend)
       ↓ Request HTTP
   [ROUTES]
       ↓
 [CONTROLLERS] ← Aquí estamos
       ↓ Llamadas al service
   [SERVICES]
       ↓
 [REPOSITORIES]
       ↓
   [BASE DE DATOS]
```

---

## 📋 Estructura de un Controller

### Patrón General

```javascript
// Importar el servicio correspondiente
const service = require('../services/nombre.service');

// Cada función controller maneja UN endpoint
async function getAll(req, res, next) {
  try {
    // 1. Extraer datos del request
    const data = req.body; // o req.params, req.query
    
    // 2. Llamar al service
    const result = await service.getAll();
    
    // 3. Responder al cliente
    res.json({ success: true, data: result });
  } catch (err) {
    // 4. Pasar errores al middleware errorHandler
    next(err);
  }
}

module.exports = { getAll };
```

---

## 🔍 Controllers Disponibles

### 1. User Controller
**Archivo:** `user.controller.js`

Maneja operaciones CRUD de usuarios.

```javascript
// ✅ GET - Obtener todos los usuarios
async function getAll(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}
// Uso: GET /api/users

// ✅ GET - Obtener usuario por ID
async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const user = await userService.getUser(id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
// Uso: GET /api/users/5

// ✅ POST - Crear nuevo usuario
async function create(req, res, next) {
  try {
    const payload = req.body;
    const user = await userService.createUser(payload);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
// Uso: POST /api/users
// Body: { first_name, last_name, email, ... }

// ✅ PUT - Actualizar usuario
async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const payload = req.body;
    const user = await userService.updateUser(id, payload);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
// Uso: PUT /api/users/5
// Body: { first_name, phone, ... }

// ✅ DELETE - Eliminar usuario
async function deleteUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    await userService.deleteUser(id);
    res.status(204).send();  // Sin contenido
  } catch (err) {
    next(err);
  }
}
// Uso: DELETE /api/users/5
```

---

### 2. Auth Controller
**Archivo:** `auth.controller.js`

Maneja registro, login, cambio de contraseña y recuperación.

```javascript
// ✅ POST - Registrar nuevo usuario
async function register(req, res, next) {
  try {
    const { first_name, last_name, email } = req.body;
    // ... validaciones ...
    const newUser = await userService.createUser(userData);
    await emailService.sendWelcomeEmail(email, first_name, tempPassword);
    res.status(201).json({ success: true, data: newUser });
  } catch (err) {
    next(err);
  }
}
// Uso: POST /api/auth/register
// Body: { first_name, last_name, email }

// ✅ POST - Cambiar contraseña temporal
async function changeTemporaryPassword(req, res, next) {
  try {
    const { email, temporaryPassword, newPassword, confirmPassword } = req.body;
    // ... validaciones ...
    const updatedUser = await userService.updateUser(user.id, { password_hash, password_changed: 1 });
    res.json({ success: true, data: updatedUser });
  } catch (err) {
    next(err);
  }
}
// Uso: POST /api/auth/change-temporary-password
// Body: { email, temporaryPassword, newPassword, confirmPassword }

// ✅ POST - Cambiar contraseña (autenticado)
async function changePassword(req, res, next) {
  try {
    const { user_id } = req.user;  // Del middleware authMiddleware
    const { currentPassword, newPassword, confirmPassword } = req.body;
    // ... validaciones ...
    const updatedUser = await userService.updateUser(user_id, { password_hash });
    res.json({ success: true, data: updatedUser });
  } catch (err) {
    next(err);
  }
}
// Uso: POST /api/auth/change-password
// Authorization: Bearer <token>
// Body: { currentPassword, newPassword, confirmPassword }

// ✅ POST - Solicitar reset de contraseña
async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;
    const user = await userService.getUserByEmail(email);
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    await userService.updateUser(user.id, { reset_code: resetCode, reset_code_expiry });
    await emailService.sendPasswordResetEmail(email, resetCode);
    res.json({ success: true, message: 'Si el email existe...' });
  } catch (err) {
    next(err);
  }
}
// Uso: POST /api/auth/request-password-reset
// Body: { email }

// ✅ POST - Verificar código reset
async function verifyResetCode(req, res, next) {
  try {
    const { email, code } = req.body;
    // ... validaciones del código ...
    res.json({ success: true, data: { verified: true } });
  } catch (err) {
    next(err);
  }
}
// Uso: POST /api/auth/verify-reset-code
// Body: { email, code }

// ✅ POST - Restablecer contraseña
async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;
    // ... validaciones ...
    await userService.updateUser(user.id, { password_hash, reset_code: null });
    res.json({ success: true, data: updatedUser });
  } catch (err) {
    next(err);
  }
}
// Uso: POST /api/auth/reset-password
// Body: { email, code, newPassword, confirmPassword }

// ✅ POST - Login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    // ... validaciones ...
    const isPasswordValid = await bcrypt.compare(password, userWithPassword.password_hash);
    const token = authService.generateToken(user.id, user.role_id, user.email);
    const refreshToken = authService.generateRefreshToken(user.id);
    res.json({ success: true, data: { user, token, refreshToken, requiresPasswordChange } });
  } catch (err) {
    next(err);
  }
}
// Uso: POST /api/auth/login
// Body: { email, password }

// ✅ POST - Renovar token
async function refreshTokenEndpoint(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const decoded = authService.verifyToken(refreshToken);
    const user = await userService.getUser(decoded.user_id);
    const newToken = authService.generateToken(user.id, user.role_id, user.email);
    res.json({ success: true, data: { token: newToken, refreshToken: authService.generateRefreshToken(user.id) } });
  } catch (err) {
    next(err);
  }
}
// Uso: POST /api/auth/refresh-token
// Body: { refreshToken }

// ✅ POST - Logout
async function logout(req, res, next) {
  try {
    res.json({ success: true, message: 'Sesión cerrada' });
  } catch (err) {
    next(err);
  }
}


### 1. Usar try-catch siempre

```javascript
async function create(req, res, next) {
  try {
    // Tu código aquí
  } catch (err) {
    next(err);  // ✅ Pasar al errorHandler
  }
}
```

### 2. Convertir parámetros a números si es necesario

```javascript
async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);  // ✅ Convertir string a número
    const user = await service.getUser(id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
```

### 3. Usar status codes correctos

```javascript
res.status(201).json(data);      // ✅ POST - Created
res.status(200).json(data);      // ✅ GET/PUT - OK (default)
res.status(204).send();          // ✅ DELETE - No Content
res.status(400).json(error);     // ❌ Bad Request
res.status(401).json(error);     // ❌ Unauthorized
res.status(404).json(error);     // ❌ Not Found
res.status(500).json(error);     // ❌ Internal Server Error
```

### 4. No capturar errores específicos

```javascript
// ❌ MALO - Captura ApiError pero sigue la ejecución
catch (err) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(err);  // Envía respuesta
    return;  // Se necesita return
  }
  next(err);
}

// ✅ BUENO - Deja que errorHandler maneje todo
catch (err) {
  next(err);  // errorHandler se encarga
}
```

### 5. Respuestas consistentes

```javascript
// ✅ BUENO - Formato consistente
{
  "success": true,
  "data": { /* datos */ }
}

{
  "success": false,
  "message": "Error description",
  "error": { code: "ERROR_CODE" }
}
```

---

## 🎯 Resumen

| Responsabilidad | Descripción |
|----------------|-------------|
| **Recibir datos** | De `req.body`, `req.params`, `req.query` |
| **Validar básicamente** | Campos presentes (la mayoría en service) |
| **Llamar servicio** | `await service.metodo(datos)` |
| **Responder** | `res.json()`, `res.status().json()` |
| **Manejo de errores** | `next(err)` → errorHandler |

Los controllers son **delgados** y **simples**. Toda la lógica compleja va en **services**.

---

**Documento creado:** Diciembre 7, 2025  
**Enfoque:** Explicación detallada de Controllers
