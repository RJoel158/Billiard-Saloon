# Sistema de Login - Billiard Saloon

## 📋 Descripción General

Este documento describe cómo funciona el sistema de autenticación (login/registro) en la API de Billiard Saloon. Utilizamos JWT (JSON Web Tokens) para manejar la autenticación y autorización.

---

## 🔑 Conceptos Principales

### 1. JWT (JSON Web Tokens)
Un JWT es un token codificado que contiene información sobre el usuario. Se divide en 3 partes:
- **Header**: Información del tipo de token
- **Payload**: Datos del usuario (user_id, role_id, email)
- **Signature**: Firma para validar que el token no fue modificado

### 2. Access Token vs Refresh Token
- **Access Token**: Válido por 24 horas, se usa para acceder a recursos protegidos
- **Refresh Token**: Válido por 7 días, se usa para obtener un nuevo Access Token sin re-loguearse

### 3. Flow de Autenticación

```
Usuario                          Servidor
  |                                 |
  |-- 1. POST /auth/login          |
  |    (email, password)           |
  |------------------------------>|
  |                                 |
  |                        2. Valida credenciales
  |                        3. Genera tokens
  |                                 |
  |<-- { token, refreshToken }  ---|
  |     (200 OK)                    |
  |                                 |
  |-- 4. GET /api/users            |
  |     Header: Authorization: Bearer token
  |------------------------------>|
  |                                 |
  |                        5. Valida token
  |                        6. Retorna datos
  |                                 |
  |<-- Datos del usuario (200 OK)|
```

---

## 📝 Endpoints de Autenticación

### 1. Registrar Usuario (POST /api/auth/register)

**Descripción**: Crea un nuevo usuario y envía una contraseña temporal por email.

**Request**:
```json
POST /api/auth/register
Content-Type: application/json

{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@example.com"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente. Revisa tu email para la contraseña temporal.",
  "data": {
    "id": 1,
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "role_id": 2,
    "created_at": "2025-12-04T10:30:00.000Z"
  }
}
```

**Validaciones**:
- ✅ Nombre requerido
- ✅ Apellido requerido
- ✅ Email válido y único
- ✅ Email no debe estar registrado

**Lo que sucede**:
1. Se genera una contraseña temporal aleatoria
2. Se encripta la contraseña con bcrypt
3. Se crea el usuario con role_id=2 (cliente)
4. Se envía email con la contraseña temporal

---

### 2. Login (POST /api/auth/login)

**Descripción**: Autentica al usuario y devuelve tokens JWT.

**Request**:
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "ABC123D@E"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Autenticación exitosa",
  "data": {
    "user": {
      "id": 1,
      "email": "juan@example.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "role_id": 2
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (401 Unauthorized)**:
```json
{
  "success": false,
  "code": "INVALID_CREDENTIALS",
  "message": "Email o contraseña incorrectos"
}
```

**Validaciones**:
- ✅ Email debe existir
- ✅ Contraseña debe coincidir
- ✅ Usuario debe estar activo

---

### 3. Renovar Token (POST /api/auth/refresh-token)

**Descripción**: Obtiene un nuevo access token usando el refresh token.

**Request**:
```json
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Token renovado",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Logout (POST /api/auth/logout)

**Descripción**: Cierra la sesión del usuario.

**Request**:
```json
POST /api/auth/logout
Authorization: Bearer token
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

**Nota**: El logout es principalmente para limpiar el cliente. Los tokens JWT son stateless, así que no es obligatorio.

---

### 5. Cambiar Contraseña Temporal (POST /api/auth/change-temporary-password)

**Descripción**: Cambia la contraseña temporal por una permanente.

**Request**:
```json
POST /api/auth/change-temporary-password
Authorization: Bearer token
Content-Type: application/json

{
  "newPassword": "MiNuevaPassword123!",
  "confirmPassword": "MiNuevaPassword123!"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente",
  "data": { /* usuario sin password */ }
}
```

---

### 6. Solicitar Restablecimiento de Contraseña (POST /api/auth/request-password-reset)

**Descripción**: Envía un email para restablecer la contraseña.

**Request**:
```json
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "email": "juan@example.com"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Si el email existe en nuestro sistema, recibirás un correo con instrucciones"
}
```

---

## 🔐 Usar Rutas Protegidas

Cualquier ruta protegida requiere un token JWT en el header `Authorization`.

**Formato correcto**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ejemplo**:
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer tu_token_aqui"
```

**Error sin token (401 Unauthorized)**:
```json
{
  "success": false,
  "code": "MISSING_TOKEN",
  "message": "Token no proporcionado. Use: Authorization: Bearer <token>"
}
```

---

## 🛡️ Middlewares

### authMiddleware
Valida que el usuario tenga un token JWT válido.

```javascript
// Uso en rutas
router.get('/users', authMiddleware, getUsersController);
```

### adminMiddleware
Valida que el usuario sea administrador (role_id = 1).

```javascript
// Uso en rutas
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUserController);
```

---

## 🔄 Flujo Completo de Registro y Login

### 1️⃣ Registro
```
Cliente envía: { first_name, last_name, email }
       ↓
Servidor valida datos
       ↓
Genera contraseña temporal
       ↓
Encripta contraseña con bcrypt
       ↓
Crea usuario en BD
       ↓
Envía email con contraseña temporal
       ↓
Respuesta: Usuario creado ✅
```

### 2️⃣ Primer Login con Contraseña Temporal
```
Cliente envía: { email, password_temporal }
       ↓
Servidor busca usuario por email
       ↓
Valida contraseña con bcrypt.compare()
       ↓
Genera access token (24h)
       ↓
Genera refresh token (7d)
       ↓
Respuesta: { token, refreshToken, user }
```

### 3️⃣ Cambiar Contraseña Temporal
```
Cliente envía: { newPassword, confirmPassword }
Cliente incluye: Authorization: Bearer token
       ↓
Middleware valida token
       ↓
Obtiene user_id del token
       ↓
Encripta nueva contraseña
       ↓
Actualiza en BD
       ↓
Respuesta: Contraseña actualizada ✅
```

### 4️⃣ Acceder Recurso Protegido
```
Cliente envía: GET /api/users
Cliente incluye: Authorization: Bearer token
       ↓
authMiddleware valida token
       ↓
Si válido: req.user contiene { user_id, role_id, email }
       ↓
Ruta retorna datos ✅
```

---

## ⚙️ Configuración en .env

```env
JWT_SECRET=your-super-secret-key-change-in-production
REFRESH_TOKEN_SECRET=your-refresh-secret-key-change-in-production
```

⚠️ **En producción**: Cambiar a claves seguras generadas aleatoriamente.

---

## 🧪 Pruebas con REST Client (VS Code)

Usa el archivo `api_tests_login.http` para probar todos los endpoints:

1. Abre el archivo en VS Code
2. Instala extensión "REST Client"
3. Haz clic en "Send Request" sobre cada endpoint
4. Copia el token del response y úsalo en requests posteriores

---

## 📊 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `MISSING_FIELDS` | Faltan campos en el request | Envía `first_name`, `last_name`, `email` |
| `INVALID_EMAIL` | Email con formato incorrecto | Usa formato válido: `usuario@dominio.com` |
| `EMAIL_EXISTS` | Email ya registrado | Usa otro email |
| `INVALID_CREDENTIALS` | Email o contraseña incorrectos | Verifica email y contraseña |
| `MISSING_TOKEN` | No se envió token | Incluye `Authorization: Bearer token` |
| `INVALID_TOKEN` | Token expirado o inválido | Renueva el token con refresh token |

---

## 📚 Archivos Relevantes

- `src/controllers/auth.controller.js` - Lógica del login
- `src/services/auth.service.js` - Funciones JWT
- `src/services/email.service.js` - Envío de emails
- `src/routes/auth.routes.js` - Rutas de autenticación
- `src/middlewares/auth.middleware.js` - Validación de tokens
- `.env` - Variables de entorno

---

## ✅ Checklist para Defensa

- [ ] ¿Qué es JWT?
- [ ] ¿Cuál es la diferencia entre access token y refresh token?
- [ ] ¿Por qué encriptamos contraseñas con bcrypt?
- [ ] ¿Cómo valida el servidor un token?
- [ ] ¿Qué pasa si el token expira?
- [ ] ¿Cómo se protege una ruta?
- [ ] ¿Cuál es el flujo de login?
- [ ] ¿Cómo se envía el email con contraseña temporal?
