# 🛡️ Guía de Middlewares

## ¿Qué son los Middlewares?

Los **middlewares** son funciones que se ejecutan **antes o después** de que un request llegue a los controllers. Son guardianes que:
- ✅ Verifican autenticación (JWT)
- ✅ Validan autorización (permisos)
- ✅ Manejan errores globales
- ✅ Procesan datos comunes
- ✅ Registran logs

```
Client Request
     ↓
[Middleware 1] → CORS, JSON parsing
     ↓
[Middleware 2] → Autenticación JWT
     ↓
[Middleware 3] → Autorización (admin check)
     ↓
[CONTROLLER] → Lógica específica
     ↓
[Middleware Error] → Manejo global de errores
     ↓
Response al Cliente
```

---

## 🔌 Middlewares en Express

### Cómo registrar middlewares

**En index.js:**

```javascript
const express = require('express');
const cors = require('cors');
const { authMiddleware, adminMiddleware } = require('./src/middlewares/auth.middleware');
const { errorHandler } = require('./src/middlewares/errorHandler');

const app = express();

// Middlewares globales (se ejecutan en TODOS los requests)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);          // Sin autenticación
app.use('/api/users', authMiddleware, userRoutes);  // Requiere token

// Middleware de error (siempre al final)
app.use(errorHandler);
```

### Orden de ejecución

```
1. app.use(cors(...)) - PRIMERO
2. app.use(express.json())
3. Routes
4. Middlewares en ruta específica
5. Controller
6. app.use(errorHandler) - ÚLTIMO
```

---

## 🔍 Middlewares Implementados

### 1. ApiError (Clase de Errores)
**Archivo:** `apiError.js`

Define la estructura estándar de errores en la API.

```javascript
class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;  // HTTP status: 400, 401, 404, etc
    this.code = code;              // Código específico: INVALID_EMAIL, EMAIL_EXISTS
    this.isApiError = true;        // Bandera para identificar errores de API
  }
}

module.exports = ApiError;
```

**Uso en Services:**

```javascript
if (!data.email) {
  throw new ApiError(400, 'MISSING_EMAIL', 'El email es requerido');
}

if (existing) {
  throw new ApiError(409, 'EMAIL_EXISTS', 'El email ya está registrado');
}

if (!user) {
  throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
}

if (!isPasswordValid) {
  throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
}
```

**Status codes comunes:**

| Código | Significado | Ejemplo |
|--------|------------|---------|
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | Sin autenticación |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Email duplicado |
| 500 | Internal Server Error | Error del servidor |

---

### 2. Auth Middleware
**Archivo:** `auth.middleware.js`

Verifica JWT tokens y autorización de usuarios.

```javascript
const authService = require('../services/auth.service');
const ApiError = require('./apiError');

/**
 * Middleware de autenticación con JWT
 * Extrae el token del header Authorization y lo verifica
 */
async function authMiddleware(req, res, next) {
  try {
    // 1. Obtener header Authorization
    const authHeader = req.headers.authorization;
    
    // 2. Validar que exista y tenga formato correcto
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(
        401,
        'MISSING_TOKEN',
        'Token no proporcionado. Use: Authorization: Bearer <token>'
      );
    }

    // 3. Extraer token (remover "Bearer " del inicio)
    const token = authHeader.substring(7);

    // 4. Verificar y decodificar token
    const decoded = authService.verifyToken(token);
    
    // 5. Agregar información decodificada a req.user
    req.user = decoded;
    // req.user = { user_id: 5, role_id: 2, email: "...", iat: ..., exp: ... }

    // 6. Continuar al siguiente middleware o controller
    next();

  } catch (err) {
    // Pasar error al errorHandler
    next(new ApiError(401, 'INVALID_TOKEN', err.message || 'Token inválido'));
  }
}

/**
 * Middleware de autorización para administradores
 * Verifica que el usuario sea admin (role_id = 1)
 */
async function adminMiddleware(req, res, next) {
  try {
    // 1. Verificar que exista req.user (authMiddleware debió ejecutarse)
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Usuario no autenticado');
    }

    // 2. Verificar que sea admin (role_id = 1)
    if (req.user.role_id !== 1) {
      throw new ApiError(
        403,
        'FORBIDDEN',
        'Acceso denegado. Se requieren permisos de administrador'
      );
    }

    // 3. Continuar
    next();

  } catch (err) {
    next(err);
  }
}

module.exports = { authMiddleware, adminMiddleware };
```

**Cómo usar en rutas:**

```javascript
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

// Ruta pública (sin middleware)
router.post('/login', authController.login);

// Ruta protegida (requiere token válido)
router.post('/change-password', authMiddleware, authController.changePassword);

// Ruta solo para admins (requiere token + rol admin)
router.delete('/:id', authMiddleware, adminMiddleware, userController.deleteUser);

module.exports = router;
```

---

#### Flujo de Autenticación

```
┌─────────────────────────────────────────────┐
│ Cliente envía request con token:            │
│ Authorization: Bearer eyJhbGc...            │
└────────────┬─────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│ authMiddleware ejecuta:                     │
│ 1. Obtiene header Authorization             │
│ 2. Valida formato "Bearer <token>"          │
│ 3. Extrae token                             │
│ 4. Llama authService.verifyToken(token)     │
└────────────┬─────────────────────────────────┘
             ↓
    ¿Token válido?
    ├─ NO → Lanza ApiError 401 INVALID_TOKEN
    │        └─ next(error) → errorHandler
    └─ SÍ → Decodifica payload
             │
             ├─ user_id: 5
             ├─ role_id: 2
             ├─ email: "user@example.com"
             ├─ iat: 1702000000 (creación)
             └─ exp: 1702086400 (expiración)
                     ↓
             Agrega: req.user = { user_id, role_id, ... }
                     ↓
                  next() → Controller
```

---

#### Casos de Error en Auth

```javascript
// ❌ Token faltante
No Authorization header
→ ApiError 401 MISSING_TOKEN

// ❌ Formato incorrecto
Authorization: NotBearer token
→ ApiError 401 MISSING_TOKEN

// ❌ Token expirado
Token tiene exp anterior a ahora
→ ApiError 401 INVALID_TOKEN (de jwt.verify)

// ❌ Token modificado/corrupto
Signature no coincide
→ ApiError 401 INVALID_TOKEN
```

---

### 3. Error Handler Middleware
**Archivo:** `errorHandler.js`

Maneja TODOS los errores de la aplicación.

```javascript
/**
 * Middleware de manejo global de errores
 * Se ejecuta cuando next(err) es llamado desde controller/service
 */
function errorHandler(err, req, res, next) {
  // 1. Si es un ApiError, usar sus propiedades
  if (err && err.isApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
        message: err.message
      }
    });
  }

  // 2. Si es un error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: {
        code: 'INVALID_TOKEN',
        message: err.message
      }
    });
  }

  // 3. Si es error de expiración de JWT
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Tu token ha expirado. Por favor, inicia sesión nuevamente.'
      }
    });
  }

  // 4. Error genérico/desconocido
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    }
  });
}

module.exports = { errorHandler };
```


## 🔐 Middewares de Express Nativos

### CORS Middleware

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',     // Frontend URL
  credentials: true,                    // Permite cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**¿Qué hace?**
- ✅ Permite requests desde frontend en http://localhost:5173
- ✅ Autoriza headers Content-Type y Authorization
- ✅ Autoriza métodos HTTP específicos

---

### JSON Parser Middleware

```javascript
app.use(express.json());
```

**¿Qué hace?**
- ✅ Parsa `req.body` como JSON
- ✅ Valida que sea JSON válido
- ✅ Sin esto, req.body sería undefined

**Ejemplo:**
```javascript
// Client envía:
POST /api/users
Content-Type: application/json
{ "name": "Juan", "email": "juan@example.com" }

// En controller:
req.body = { name: "Juan", email: "juan@example.com" }
```

---

## 📊 Orden de Middlewares (Importante!)

```javascript
// index.js

// 1. CORS (tiene que estar primero)
app.use(cors(...));

// 2. Body parser (necesario para req.body)
app.use(express.json());

// 3. Rutas PÚBLICAS (sin autenticación)
app.use('/api/auth', authRoutes);  // login, register, etc

// 4. Rutas PRIVADAS (con autenticación)
app.use('/api/users', authMiddleware, userRoutes);

// 5. Middleware de error (tiene que estar ÚLTIMO)
app.use(errorHandler);
```

**¿Por qué este orden?**
- CORS primero: Permite requests cross-origin desde el inicio
- JSON parser antes de rutas: Para que req.body esté listo
- Rutas antes de error handler: Así se capturan todos los errores
- Error handler último: Captura errores de todas las rutas

---

## 🎯 Creando Middlewares Personalizados

### Middleware de Logging

```javascript
function loggingMiddleware(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
}

app.use(loggingMiddleware);
```

### Middleware de Validación

```javascript
function validateUserData(req, res, next) {
  const { first_name, last_name, email } = req.body;
  
  if (!first_name || !last_name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Campos requeridos: first_name, last_name, email'
    });
  }
  
  next();
}

router.post('/users', validateUserData, userController.create);
```

### Middleware de Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100                    // Máximo 100 requests
});

app.use(limiter);  // Aplicar a toda la app
```

---

## 🔄 Flujo Completo: Request → Response

```
┌─ Client (Frontend) ──────────────────────────────────┐
│ const response = await fetch('/api/users/5', {       │
│   method: 'DELETE',                                  │
│   headers: { 'Authorization': 'Bearer token...' }   │
│ })                                                   │
└────────────┬────────────────────────────────────────┘
             ↓
┌─ Express Server ─────────────────────────────────────┐
│ 1. CORS middleware                                   │
│    ├─ Verifica origin (http://localhost:5173)       │
│    └─ Agrega headers CORS a la response             │
│                                                      │
│ 2. JSON parser middleware                            │
│    └─ Parsa body (none en este caso)                │
│                                                      │
│ 3. Route matching                                    │
│    DELETE /api/users/:id                            │
│    ├─ authMiddleware (configurado en ruta)          │
│    ├─ adminMiddleware (configurado en ruta)         │
│    └─ userController.deleteUser                     │
│                                                      │
│ 4. authMiddleware ejecuta                           │
│    ├─ Extrae token del header                       │
│    ├─ Verifica con jwt.verify                       │
│    ├─ Agrega req.user = { user_id, role_id, ... }  │
│    └─ next()                                        │
│                                                      │
│ 5. adminMiddleware ejecuta                          │
│    ├─ Verifica req.user.role_id === 1              │
│    ├─ Si no es admin: next(new ApiError(403, ...)) │
│    └─ Si es admin: next()                           │
│                                                      │
│ 6. Controller ejecuta                               │
│    userController.deleteUser(req, res, next)        │
│    ├─ const id = req.params.id = "5"                │
│    ├─ const deleted = await service.deleteUser(5)   │
│    └─ res.status(204).send()  // No content         │
└────────────┬────────────────────────────────────────┘
             ↓
┌─ Response al Cliente ────────────────────────────────┐
│ HTTP/1.1 204 No Content                              │
│ Access-Control-Allow-Origin: http://localhost:5173  │
│ Content-Type: application/json                       │
│                                                      │
│ (sin body)                                           │
└──────────────────────────────────────────────────────┘
```

---

## ⚠️ Errores Comunes

### ❌ Error 1: Error handler no al final

```javascript
// MALO
app.use(errorHandler);
app.use('/api/users', userRoutes);  // Errores aquí no se capturan

// BUENO
app.use('/api/users', userRoutes);
app.use(errorHandler);  // Último
```

### ❌ Error 2: Olvidar next()

```javascript
// MALO
function myMiddleware(req, res, next) {
  console.log('Logging');
  // No llama next() → se queda el request pendiente
}

// BUENO
function myMiddleware(req, res, next) {
  console.log('Logging');
  next();  // ← Importante
}
```

### ❌ Error 3: Middleware en orden incorrecto

```javascript
// MALO
app.use('/api/users', authMiddleware, userRoutes);
app.use(cors(...));  // CORS después de routes → no funciona

// BUENO
app.use(cors(...));  // CORS primero
app.use('/api/users', authMiddleware, userRoutes);
```

### ❌ Error 4: No pasar error al handler

```javascript
// MALO
catch (err) {
  res.status(500).json(err);  // No llama errorHandler
}

// BUENO
catch (err) {
  next(err);  // Pasa al errorHandler
}
```

---

## 📌 Tipos de Middlewares

| Tipo | Dónde | Cuándo |
|------|-------|--------|
| **Global** | `app.use(...)` | Todos los requests |
| **Por ruta** | `app.use('/path', ...)` | Solo esa ruta |
| **En endpoint** | `router.post('/...', mw, controller)` | Solo ese endpoint |

---

## 🎯 Resumen de Middlewares

| Middleware | Función | Ubicación |
|-----------|---------|-----------|
| **CORS** | Permite requests cross-origin | Global, primero |
| **JSON Parser** | Parsea req.body | Global |
| **Auth** | Verifica JWT token | En rutas protegidas |
| **Admin** | Verifica role_id = 1 | En rutas admin |
| **Error Handler** | Maneja errores | Global, último |

---

**Documento creado:** Diciembre 7, 2025  
**Enfoque:** Explicación detallada de Middlewares y seguridad
