# 🎱 Guía Completa: Gestión de Usuarios, Autenticación, JWT y Email

---

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Base de Datos - Tabla Users](#base-de-datos---tabla-users)
3. [Flujo de Autenticación](#flujo-de-autenticación)
4. [JWT (JSON Web Tokens)](#jwt-json-web-tokens)
5. [Endpoints de Autenticación](#endpoints-de-autenticación)
6. [Endpoints de Usuarios](#endpoints-de-usuarios)
7. [Sistema de Envío de Correos](#sistema-de-envío-de-correos)
8. [Middlewares de Seguridad](#middlewares-de-seguridad)
9. [Manejo de Errores](#manejo-de-errores)
10. [Variables de Entorno](#variables-de-entorno)

---

## 🏗️ Arquitectura General

El sistema de gestión de usuarios se implementa siguiendo un patrón **MVC** con capas de servicios:

```
┌─────────────────────────────────────────────────────┐
│                   CLIENTE (Frontend)                 │
└─────────────┬───────────────────────────────────────┘
              │ HTTP + Bearer Token
              ↓
┌─────────────────────────────────────────────────────┐
│              EXPRESS SERVER (Node.js)                │
├─────────────────────────────────────────────────────┤
│ Routes      → Controllers → Services → Repositories │
│             ↓                                        │
│          Middlewares (Auth, Error)                  │
│             ↓                                        │
│  Services (Email, JWT, Validation)                 │
└─────────────┬───────────────────────────────────────┘
              │
        ┌─────┴──────┬─────────────────┐
        ↓            ↓                 ↓
    ┌────────┐  ┌────────┐      ┌──────────┐
    │ MySQL  │  │ Gmail  │      │ JWT Lib  │
    │  (DB)  │  │ (Mail) │      │ (Tokens) │
    └────────┘  └────────┘      └──────────┘
```

---

## 💾 Base de Datos - Tabla Users

### Esquema de la Tabla `users`

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL DEFAULT 2,        -- 1=Admin, 2=Cliente
  first_name VARCHAR(50) NOT NULL,       -- Primer nombre
  last_name VARCHAR(50) NOT NULL,        -- Apellido
  email VARCHAR(100) UNIQUE NOT NULL,    -- Email único
  password_hash VARCHAR(255),            -- Hash bcrypt de la contraseña
  phone VARCHAR(20),                     -- Teléfono opcional
  password_changed TINYINT DEFAULT 0,    -- 0=temporal, 1=cambió su contraseña
  reset_code VARCHAR(10),                -- Código de 6 dígitos para reset
  reset_code_expiry DATETIME,            -- Expiración del código (10 min)
  is_active TINYINT DEFAULT 1,           -- 1=activo, 0=inactivo (soft delete)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Campos Importantes

| Campo | Propósito | Tipo |
|-------|-----------|------|
| `id` | Identificador único del usuario | INT |
| `role_id` | Define permisos (1=Admin, 2=Usuario) | INT |
| `email` | Único, utilizado para login y recuperación | VARCHAR |
| `password_hash` | Hash bcrypt de la contraseña | VARCHAR |
| `password_changed` | Flag: ¿ha cambiado su contraseña temporal? | TINYINT |
| `reset_code` | Código temporal para reset de contraseña | VARCHAR |
| `reset_code_expiry` | Fecha/hora de expiración del código | DATETIME |
| `is_active` | Soft delete: usuario activo o no | TINYINT |

---

## 🔐 Flujo de Autenticación

### 1️⃣ Registro de Nuevo Usuario

```
┌─────────────────────────────────────────────┐
│  POST /api/auth/register                    │
│  Body: {                                    │
│    first_name: "Juan",                      │
│    last_name: "Pérez",                      │
│    email: "juan@example.com"                │
│  }                                          │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  ✅ Validaciones:                           │
│  • Campos requeridos presentes             │
│  • Email válido (formato correcto)         │
│  • Email no existe en BD                   │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  🔑 Generar contraseña temporal             │
│  • 12 caracteres aleatorios                │
│  • Hash con bcrypt (salt rounds: 10)       │
│  • Guardada como password_hash             │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  💾 Crear usuario en BD                     │
│  • role_id = 2 (Cliente por defecto)       │
│  • password_changed = 0 (temporal)         │
│  • status = 1 (activo)                     │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  📧 Enviar email con contraseña temporal   │
│  • Gmail SMTP                              │
│  • HTML template profesional               │
│  • Incluye instrucciones de cambio         │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  ✅ Response 201 Created                    │
│  {                                          │
│    "success": true,                         │
│    "message": "Usuario registrado...",      │
│    "data": { usuario sin password }        │
│  }                                          │
└─────────────────────────────────────────────┘
```

### 2️⃣ Cambio de Contraseña Temporal

```
┌─────────────────────────────────────────────┐
│  POST /api/auth/change-temporary-password   │
│  Body: {                                    │
│    email: "juan@example.com",               │
│    temporaryPassword: "A1b2C3d4E5f6!",      │
│    newPassword: "MyNewPass123!",            │
│    confirmPassword: "MyNewPass123!"         │
│  }                                          │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  ✅ Validaciones:                           │
│  • Todos los campos presentes              │
│  • Contraseñas nuevas coinciden            │
│  • Longitud mínima 8 caracteres            │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  🔑 Verificar contraseña temporal           │
│  • bcrypt.compare(temporal, hash)          │
│  • Debe coincidir con password_hash        │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  🔐 Hash nueva contraseña                   │
│  • bcrypt(newPassword, 10)                 │
│  • Guardar como password_hash              │
│  • password_changed = 1 (✅ cambió)        │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  ✅ Response 200                            │
│  {                                          │
│    "success": true,                         │
│    "message": "Contraseña actualizada",    │
│    "data": { usuario actualizado }         │
│  }                                          │
└─────────────────────────────────────────────┘
```

### 3️⃣ Login

```
┌─────────────────────────────────────────────┐
│  POST /api/auth/login                       │
│  Body: {                                    │
│    email: "juan@example.com",               │
│    password: "MyNewPass123!"                │
│  }                                          │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  ✅ Validaciones:                           │
│  • Email y password presentes              │
│  • Usuario existe en BD                    │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  🔑 Verificar contraseña                    │
│  • bcrypt.compare(password, hash)          │
│  • Debe coincidir con password_hash        │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  🎫 Generar Tokens:                         │
│  • JWT Token (válido 24h)                  │
│  • Refresh Token (válido 7d)               │
│  • Incluyen: user_id, role_id, email      │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  ✅ Response 200                            │
│  {                                          │
│    "success": true,                         │
│    "message": "Autenticación exitosa",     │
│    "data": {                                │
│      "user": { id, email, nombre... },     │
│      "token": "eyJhbGc...",                │
│      "refreshToken": "eyJhbGc...",         │
│      "requiresPasswordChange": false        │
│    }                                        │
│  }                                          │
└─────────────────────────────────────────────┘
```

### 4️⃣ Recuperación de Contraseña

```
┌─────────────────────────────────────────────┐
│  POST /api/auth/request-password-reset      │
│  Body: { email: "juan@example.com" }        │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  ✅ Validar email existe (sin revelar)     │
│  • Buscar usuario por email                │
│  • No revelar si existe por seguridad      │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  🔐 Generar código reset (6 dígitos)        │
│  • Rango: 100000 a 999999                  │
│  • Expiración: 10 minutos                  │
│  • Math.floor(Math.random() * 900000) + 100000
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  💾 Guardar en BD:                          │
│  • reset_code = código                     │
│  • reset_code_expiry = now + 10 min        │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  📧 Enviar email con código                 │
│  • HTML template con código visible        │
│  • Advertencia de expiración               │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  ✅ Response 200 (genérico por seguridad)  │
│  {                                          │
│    "success": true,                         │
│    "message": "Si el email existe..."      │
│  }                                          │
└─────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────┐
│  POST /api/auth/verify-reset-code           │
│  Body: {                                    │
│    email: "juan@example.com",               │
│    code: "123456"                           │
│  }                                          │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  ✅ Validaciones:                           │
│  • Código no expirado (< 10 min)           │
│  • Código coincide                         │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  ✅ Response 200                            │
│  { "success": true, "data": { verified } } │
└─────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────┐
│  POST /api/auth/reset-password              │
│  Body: {                                    │
│    email: "juan@example.com",               │
│    code: "123456",                          │
│    newPassword: "AnotherPass456!",          │
│    confirmPassword: "AnotherPass456!"       │
│  }                                          │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  ✅ Validaciones:                           │
│  • Código válido y no expirado             │
│  • Código correcto                         │
│  • Contraseñas coinciden                   │
│  • Longitud mínima 8 caracteres            │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  🔐 Hash nueva contraseña                   │
│  • bcrypt(newPassword, 10)                 │
│  • Limpiar reset_code y expiry            │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  ✅ Response 200                            │
│  {                                          │
│    "success": true,                         │
│    "message": "Contraseña restablecida",   │
│    "data": { usuario actualizado }         │
│  }                                          │
└─────────────────────────────────────────────┘
```

---

## 🎫 JWT (JSON Web Tokens)

### ¿Qué es JWT?

Un **JWT** es un token encriptado que contiene información del usuario y sirve para:
- ✅ Autenticar usuarios sin sesiones en servidor
- ✅ Mantener al usuario logueado entre requests
- ✅ Pasar información segura entre cliente y servidor

### Estructura JWT

```
Header.Payload.Signature
```

#### Ejemplo desglosado:

**Header:**
```json
{
  "alg": "HS256",    // Algoritmo
  "typ": "JWT"       // Tipo de token
}
```

**Payload (información del usuario):**
```json
{
  "user_id": 5,
  "role_id": 2,
  "email": "juan@example.com",
  "iat": 1702000000,    // Issued At (cuándo se creó)
  "exp": 1702086400     // Expiration (caduca en 24h)
}
```

**Signature (verificación):**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  "your-secret-key-change-in-production"
)
```

### Implementación en el Código

#### Archivo: `src/services/auth.service.js`

```javascript
const jwt = require('jsonwebtoken');

// 1. Generar Token de Acceso (24h de validez)
function generateToken(userId, roleId, email) {
  const payload = {
    user_id: userId,
    role_id: roleId,
    email: email
  };
  
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '24h' }  // ⏱️ Válido por 24 horas
  );
  
  return token;
}

// 2. Generar Refresh Token (7d de validez)
function generateRefreshToken(userId) {
  const payload = { user_id: userId };
  
  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key',
    { expiresIn: '7d' }  // ⏱️ Válido por 7 días
  );
  
  return refreshToken;
}

// 3. Verificar Token
function verifyToken(token) {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    return decoded;
  } catch (error) {
    throw new Error(`Token inválido: ${error.message}`);
  }
}
```

### Flujo de Renovación de Token

```
┌──────────────────────────────────────────┐
│  Token original expira en 1 hora         │
└────────────┬─────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│  POST /api/auth/refresh-token            │
│  Body: { refreshToken: "eyJhbGc..." }   │
└────────────┬─────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│  ✅ Verificar Refresh Token              │
│  • No debe estar expirado (válido 7 días)│
│  • Extraer user_id del payload          │
└────────────┬─────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│  🎫 Generar nuevo Token                  │
│  • Válido por otros 24 horas             │
│  • Mismo payload (user_id, role_id...)   │
└────────────┬─────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│  ✅ Response 200                         │
│  {                                       │
│    "success": true,                      │
│    "data": {                             │
│      "token": "nuevo_jwt",               │
│      "refreshToken": "nuevo_refresh"     │
│    }                                     │
│  }                                       │
└──────────────────────────────────────────┘
```

---

## 🔌 Endpoints de Autenticación

### 1. Registrar Usuario

```http
POST /api/auth/register
Content-Type: application/json

{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@example.com"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente. Revisa tu email para la contraseña temporal.",
  "data": {
    "id": 5,
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "role_id": 2,
    "created_at": "2025-12-07T10:30:00Z"
  }
}
```

**Errores Posibles:**
- `400` - `MISSING_FIELDS`: Faltan campos requeridos
- `400` - `INVALID_EMAIL`: Email no tiene formato válido
- `409` - `EMAIL_EXISTS`: El email ya está registrado

---

### 2. Cambiar Contraseña Temporal (Primera Vez)

```http
POST /api/auth/change-temporary-password
Content-Type: application/json

{
  "email": "juan@example.com",
  "temporaryPassword": "A1b2C3d4E5f6!@",
  "newPassword": "MyNewPass123!",
  "confirmPassword": "MyNewPass123!"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente",
  "data": {
    "id": 5,
    "first_name": "Juan",
    "email": "juan@example.com",
    "password_changed": 1
  }
}
```

**Errores Posibles:**
- `400` - `MISSING_FIELDS`: Faltan campos
- `400` - `PASSWORDS_MISMATCH`: Las contraseñas no coinciden
- `400` - `WEAK_PASSWORD`: Menos de 8 caracteres
- `401` - `INVALID_CREDENTIALS`: Email o contraseña temporal incorrectos

---

### 3. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "MyNewPass123!"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Autenticación exitosa",
  "data": {
    "user": {
      "id": 5,
      "email": "juan@example.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "role_id": 2,
      "password_changed": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJyb2xlX2lkIjoyLCJlbWFpbCI6Imp1YW5AZXhhbXBsZS5jb20iLCJpYXQiOjE3MDIwMDAwMDAsImV4cCI6MTcwMjA4NjQwMH0.signature",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJpYXQiOjE3MDIwMDAwMDAsImV4cCI6MTcwMjYwNTIwMH0.signature",
    "requiresPasswordChange": false
  }
}
```

**Errores Posibles:**
- `400` - `MISSING_FIELDS`: Email o contraseña no proporcionados
- `401` - `INVALID_CREDENTIALS`: Email o contraseña incorrectos

---

### 4. Solicitar Reset de Contraseña

```http
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "email": "juan@example.com"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Si el email existe en nuestro sistema, recibirás un correo con instrucciones"
}
```

**Nota:** La respuesta es genérica por seguridad (no revela si el email existe).

---

### 5. Verificar Código Reset

```http
POST /api/auth/verify-reset-code
Content-Type: application/json

{
  "email": "juan@example.com",
  "code": "123456"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Código verificado correctamente",
  "data": {
    "verified": true
  }
}
```

**Errores Posibles:**
- `400` - `MISSING_FIELDS`: Faltan email o código
- `400` - `NO_RESET_REQUEST`: No hay reset activo
- `400` - `EXPIRED_CODE`: El código expiró (10 minutos)
- `400` - `INVALID_CODE`: El código es incorrecto

---

### 6. Restablecer Contraseña

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "juan@example.com",
  "code": "123456",
  "newPassword": "AnotherPass456!",
  "confirmPassword": "AnotherPass456!"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente",
  "data": {
    "id": 5,
    "email": "juan@example.com",
    "first_name": "Juan"
  }
}
```

**Errores Posibles:**
- `400` - `PASSWORDS_MISMATCH`: Las contraseñas no coinciden
- `400` - `WEAK_PASSWORD`: Menos de 8 caracteres
- `400` - `EXPIRED_CODE`: El código expiró
- `400` - `INVALID_CODE`: El código es incorrecto

---

### 7. Renovar Token (Refresh)

```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Token renovado",
  "data": {
    "token": "nuevo_jwt_token",
    "refreshToken": "nuevo_refresh_token"
  }
}
```

**Errores Posibles:**
- `400` - `MISSING_REFRESH_TOKEN`: No se proporcionó refresh token
- `401` - `INVALID_TOKEN`: El token es inválido o expiró
- `401` - `USER_NOT_FOUND`: El usuario no existe

---

### 8. Logout

```http
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200:**
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

**Nota:** El logout es principalmente simbólico. El cliente debe eliminar el token localmente.

---

## 👥 Endpoints de Usuarios

### 1. Obtener Todos los Usuarios (Admin)

```http
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "Admin",
      "last_name": "User",
      "email": "admin@example.com",
      "role_id": 1,
      "phone": null,
      "created_at": "2025-01-01T00:00:00Z",
      "password_changed": 1
    },
    {
      "id": 5,
      "first_name": "Juan",
      "last_name": "Pérez",
      "email": "juan@example.com",
      "role_id": 2,
      "phone": null,
      "created_at": "2025-12-07T10:30:00Z",
      "password_changed": 1
    }
  ]
}
```

---

### 2. Obtener Usuario por ID

```http
GET /api/users/5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "role_id": 2,
    "phone": null,
    "created_at": "2025-12-07T10:30:00Z",
    "password_changed": 1
  }
}
```

---

### 3. Crear Usuario Directamente (Admin)

```http
POST /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "first_name": "Carlos",
  "last_name": "López",
  "email": "carlos@example.com",
  "password_hash": "hashed_password_value",
  "role_id": 2,
  "phone": "123456789"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "first_name": "Carlos",
    "last_name": "López",
    "email": "carlos@example.com",
    "role_id": 2,
    "phone": "123456789",
    "created_at": "2025-12-07T11:00:00Z",
    "password_changed": 0
  }
}
```

---

### 4. Actualizar Usuario

```http
PUT /api/users/5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "phone": "987654321",
  "first_name": "Juanito"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "first_name": "Juanito",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "role_id": 2,
    "phone": "987654321",
    "password_changed": 1
  }
}
```

---

### 5. Eliminar Usuario

```http
DELETE /api/users/5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 204:** Sin contenido (usuario eliminado)

---

### 6. Cambiar Contraseña (Autenticado)

```http
POST /api/auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "currentPassword": "MyNewPass123!",
  "newPassword": "AnotherPass456!",
  "confirmPassword": "AnotherPass456!"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente",
  "data": {
    "id": 5,
    "email": "juan@example.com",
    "first_name": "Juan"
  }
}
```

**Errores Posibles:**
- `400` - `PASSWORDS_MISMATCH`: Las nuevas contraseñas no coinciden
- `400` - `WEAK_PASSWORD`: Menos de 8 caracteres
- `401` - `INVALID_PASSWORD`: La contraseña actual es incorrecta

---

## 📧 Sistema de Envío de Correos

### Configuración Gmail

#### Archivo: `src/services/email.service.js`

```javascript
const nodemailer = require('nodemailer');

// Configurar el transporte SMTP de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,      // ejemplo@gmail.com
    pass: process.env.GMAIL_PASSWORD   // contraseña de app
  }
});
```

### Variables de Entorno Necesarias

```bash
GMAIL_USER=tu_email@gmail.com
GMAIL_PASSWORD=tu_contraseña_de_app
```

**⚠️ Importante:** 
- No uses tu contraseña normal de Gmail
- Crea una **contraseña de aplicación** en Google Account Security
- Guarda esto en el archivo `.env`

### 1. Email de Bienvenida (con Contraseña Temporal)

```javascript
async function sendWelcomeEmail(email, firstName, temporaryPassword) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: '¡Bienvenido a Billiard Saloon! - Tu contraseña temporal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <div style="background-color: #1a472a; color: white; padding: 30px;">
          <h1>🎱 Billiard Saloon</h1>
          <p>Bienvenido a nuestro sistema</p>
        </div>
        
        <div style="background-color: white; padding: 30px;">
          <h2>¡Hola ${firstName}!</h2>
          
          <p>Tu cuenta ha sido creada exitosamente en <strong>Billiard Saloon</strong>.</p>
          
          <div style="background-color: #f9f9f9; border-left: 4px solid #1a472a; padding: 15px;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Contraseña temporal:</strong> <code>${temporaryPassword}</code></p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0;">
            <strong>⚠️ Importante:</strong> 
            Cambia tu contraseña en el primer inicio de sesión para mayor seguridad.
          </div>
          
          <p>Si no creaste esta cuenta, contacta a nuestro equipo de soporte.</p>
        </div>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
  return { success: true, message: 'Email enviado correctamente' };
}
```

**Ejemplo de Salida (HTML Renderizado):**

```
┌─────────────────────────────────────────────────────┐
│ 🎱 Billiard Saloon                                  │
│ Bienvenido a nuestro sistema                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ¡Hola Juan!                                         │
│                                                     │
│ Tu cuenta ha sido creada exitosamente en Billiard  │
│ Saloon.                                             │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ Email: juan@example.com                     │   │
│ │ Contraseña temporal: A1b2C3d4E5f6!          │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ⚠️ Importante: Cambia tu contraseña en el primer   │
│ inicio de sesión para mayor seguridad de tu        │
│ cuenta.                                             │
│                                                     │
│ Si no creaste esta cuenta o tienes alguna          │
│ pregunta, contacta a nuestro equipo de soporte.   │
│                                                     │
│ © 2025 Billiard Saloon. Todos los derechos         │
│ reservados.                                         │
└─────────────────────────────────────────────────────┘
```

---

### 2. Email de Reset de Contraseña (con Código)

```javascript
async function sendPasswordResetEmail(email, resetCode) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Código de restablecimiento de contraseña - Billiard Saloon',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <div style="background-color: #1a472a; color: white; padding: 30px;">
          <h1>🎱 Billiard Saloon</h1>
          <p>Restablecimiento de contraseña</p>
        </div>
        
        <div style="background-color: white; padding: 30px;">
          <h2>Solicitud de restablecimiento</h2>
          
          <p>Recibimos una solicitud para restablecer tu contraseña. 
             Usa el siguiente código de verificación:</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center;">
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; 
                      font-family: monospace;">
              ${resetCode}
            </p>
          </div>
          
          <div style="background-color: #ffe8e8; border: 1px solid #ff6b6b; padding: 15px;">
            <strong>⏱️ Importante:</strong> 
            Este código expirará en 10 minutos. No compartas este código con nadie.
          </div>
          
          <p>Si no solicitaste restablecer tu contraseña, por favor ignora este 
             correo. Tu cuenta seguirá siendo segura.</p>
        </div>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
  return { success: true, message: 'Email de restablecimiento enviado' };
}
```

**Ejemplo de Salida (HTML Renderizado):**

```
┌─────────────────────────────────────────────────────┐
│ 🎱 Billiard Saloon                                  │
│ Restablecimiento de contraseña                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Solicitud de restablecimiento                       │
│                                                     │
│ Recibimos una solicitud para restablecer tu         │
│ contraseña. Usa el siguiente código:                │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │           1 2 3 4 5 6                        │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ⏱️ Importante: Este código expirará en 10          │
│ minutos. No compartas este código con nadie.       │
│                                                     │
│ Si no solicitaste restablecer tu contraseña,       │
│ ignora este correo. Tu cuenta seguirá siendo       │
│ segura.                                             │
│                                                     │
│ © 2025 Billiard Saloon. Todos los derechos         │
│ reservados.                                         │
└─────────────────────────────────────────────────────┘
```

---

### Manejo de Errores en Email

```javascript
// El servicio está diseñado para NO fallar la autenticación 
// si falla el email

try {
  await emailService.sendWelcomeEmail(email, firstName, tempPassword);
} catch (emailError) {
  console.error('Error enviando email:', emailError.message);
  // Continuamos de todas formas, la autenticación no falla
}
```

---

## 🔒 Middlewares de Seguridad

### 1. Middleware de Autenticación JWT

**Archivo:** `src/middlewares/auth.middleware.js`

```javascript
const authService = require('../services/auth.service');
const ApiError = require('./apiError');

/**
 * Middleware para verificar JWT token
 * Extrae el token del header Authorization y lo valida
 * Si es válido, agrega el usuario decodificado a req.user
 */
async function authMiddleware(req, res, next) {
  try {
    // Obtener el header Authorization
    const authHeader = req.headers.authorization;

    // Validar que exista y tenga formato "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(
        401, 
        'MISSING_TOKEN', 
        'Token no proporcionado. Use: Authorization: Bearer <token>'
      );
    }

    // Extraer token (remover "Bearer " del inicio)
    const token = authHeader.substring(7);

    // Verificar y decodificar el token
    const decoded = authService.verifyToken(token);
    
    // Agregar información decodificada a req.user
    req.user = decoded;
    // req.user = { user_id: 5, role_id: 2, email: "..." }

    next();
  } catch (err) {
    next(new ApiError(401, 'INVALID_TOKEN', err.message || 'Token inválido'));
  }
}

module.exports = { authMiddleware, adminMiddleware };
```

#### Cómo usar en rutas:

```javascript
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

// Ruta protegida - requiere token válido
router.post('/change-password', authMiddleware, authController.changePassword);

// Ruta protegida para admin - requiere role_id = 1
router.delete('/users/:id', authMiddleware, adminMiddleware, userController.deleteUser);
```

#### En el controlador:

```javascript
async function changePassword(req, res, next) {
  try {
    // Acceder al usuario del middleware
    const { user_id } = req.user;  // Viene del authMiddleware
    
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // ... resto del código
  }
}
```

---

### 2. Middleware de Admin

```javascript
async function adminMiddleware(req, res, next) {
  try {
    // Debe estar autenticado (authMiddleware ya se ejecutó)
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Usuario no autenticado');
    }

    // Verificar que sea admin (role_id = 1)
    if (req.user.role_id !== 1) {
      throw new ApiError(
        403, 
        'FORBIDDEN', 
        'Acceso denegado. Se requieren permisos de administrador'
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}
```

---

### 3. Flujo de Ejecución de Middlewares

```
┌─────────────────────────────────────────────┐
│  Request con Authorization header:          │
│  Authorization: Bearer eyJhbGc...           │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  1. authMiddleware ejecuta:                 │
│  ✅ Extrae token de header                  │
│  ✅ Verifica con JWT secret                 │
│  ✅ Decodifica payload                      │
│  ✅ Agrega req.user = { user_id, role... } │
│  ✅ Llama next()                            │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  2. adminMiddleware (si está presente):     │
│  ✅ Verifica req.user existe                │
│  ✅ Verifica req.user.role_id === 1         │
│  ✅ Llama next() si es admin                │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  3. Controller ejecuta:                     │
│  ✅ Tiene acceso a req.user                 │
│  ✅ Procesa la lógica de negocio            │
│  ✅ Responde al cliente                     │
└─────────────────────────────────────────────┘
```

---

## ❌ Manejo de Errores

### Clase ApiError

**Archivo:** `src/middlewares/apiError.js`

```javascript
class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;      // HTTP status code (400, 401, 409, etc)
    this.code = code;          // Error code (INVALID_EMAIL, EMAIL_EXISTS, etc)
    this.message = message;    // Mensaje legible
  }
}

module.exports = ApiError;
```

### Ejemplos de Errores:

```javascript
// Email no válido
throw new ApiError(400, 'INVALID_EMAIL', 'El email no es válido');

// Email ya existe
throw new ApiError(409, 'EMAIL_EXISTS', 'El email ya está registrado');

// Contraseña débil
throw new ApiError(400, 'WEAK_PASSWORD', 'La contraseña debe tener al menos 8 caracteres');

// Token inválido
throw new ApiError(401, 'INVALID_TOKEN', 'Token inválido');

// Usuario no encontrado
throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');

// Acceso denegado
throw new ApiError(403, 'FORBIDDEN', 'Acceso denegado. Se requieren permisos de administrador');
```

### Middleware de Error Global

**Archivo:** `src/middlewares/errorHandler.js`

```javascript
function errorHandler(err, req, res, next) {
  // Si es un ApiError, usar sus propiedades
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      code: err.code,
      message: err.message
    });
  }

  // Error genérico
  console.error('Unexpected error:', err);
  return res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Error interno del servidor'
  });
}

module.exports = { errorHandler };
```

### Flujo de Manejo de Errores

```
┌─────────────────────────────────────────────┐
│  Controller lanza ApiError:                 │
│  throw new ApiError(409, 'EMAIL_EXISTS'...) │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  next(err) pasa al errorHandler             │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  errorHandler verifica tipo de error        │
│  ✅ Si es ApiError: usa sus propiedades     │
│  ✅ Si no: error genérico 500               │
└────────────┬────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────┐
│  Response al cliente:                       │
│  {                                          │
│    "success": false,                        │
│    "code": "EMAIL_EXISTS",                  │
│    "message": "El email ya está..."         │
│  }                                          │
└─────────────────────────────────────────────┘
```

---

## 🔧 Variables de Entorno

### Archivo: `.env`

```bash
# 📡 Server
PORT=3000
NODE_ENV=development

# 🔐 JWT
JWT_SECRET=your-super-secret-key-change-in-production
REFRESH_TOKEN_SECRET=your-refresh-secret-key-change-in-production

# 💾 Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=billiard_saloon

# 📧 Gmail
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_app_password

# 🌐 Frontend
FRONTEND_URL=http://localhost:5173
```

### Configuración de Google (Contraseña de Aplicación)

1. Ir a https://myaccount.google.com/security
2. Habilitar 2-Step Verification
3. Generar "App Password" para Gmail
4. Usar esa contraseña en `GMAIL_PASSWORD`

---

## 📝 Resumen de Flujos Principales

### Flujo de Registro Completo

```
1. Usuario llena formulario de registro
   ↓
2. POST /api/auth/register
   - Validar campos
   - Verificar email único
   ↓
3. Generar contraseña temporal (12 caracteres)
   - Hash con bcrypt (salt: 10)
   ↓
4. Crear usuario en BD
   - role_id = 2 (cliente)
   - password_changed = 0
   - password_hash = hash de temporal
   ↓
5. Enviar email con contraseña temporal
   - HTML bonito con instrucciones
   ↓
6. Response 201 Created
   - Datos del usuario sin contraseña
```

### Flujo de Cambio de Contraseña Temporal

```
1. Usuario recibe contraseña temporal por email
   ↓
2. POST /api/auth/change-temporary-password
   - Validar todos los campos
   ↓
3. Verificar contraseña temporal
   - bcrypt.compare(temporal, hash)
   ↓
4. Hashear nueva contraseña
   - bcrypt(newPassword, 10)
   ↓
5. Actualizar en BD
   - password_hash = nuevo hash
   - password_changed = 1
   ↓
6. Response 200 OK
   - Datos del usuario actualizado
```

### Flujo de Login

```
1. Usuario ingresa email y contraseña
   ↓
2. POST /api/auth/login
   - Validar campos presentes
   ↓
3. Buscar usuario por email
   ↓
4. Verificar contraseña
   - bcrypt.compare(password, hash)
   ↓
5. Generar tokens
   - JWT Token (24h): { user_id, role_id, email, iat, exp }
   - Refresh Token (7d): { user_id, iat, exp }
   ↓
6. Response 200 OK
   - User data
   - Token
   - RefreshToken
   - requiresPasswordChange flag
```

### Flujo de Reset de Contraseña Olvidada

```
1. Usuario solicita reset
   ↓
2. POST /api/auth/request-password-reset
   - Validar email
   ↓
3. Generar código (6 dígitos)
   - Expiración: 10 minutos
   ↓
4. Guardar en BD
   - reset_code
   - reset_code_expiry
   ↓
5. Enviar email con código
   ↓
6. POST /api/auth/verify-reset-code
   - Validar código no expirado
   - Validar código correcto
   ↓
7. POST /api/auth/reset-password
   - Validar código nuevamente
   - Hashear nueva contraseña
   - Limpiar reset_code y expiry
   ↓
8. Response 200 OK
   - Contraseña restablecida
```

### Flujo de Solicitud Autenticada

```
Cliente                           Servidor
   │                                │
   │  GET /api/protected            │
   │  Authorization: Bearer JWT     │
   ├─────────────────────────────→  │
   │                                │
   │                          authMiddleware
   │                          ├─ Extrae token
   │                          ├─ Verifica JWT
   │                          ├─ Decodifica payload
   │                          └─ Agrega req.user
   │                                │
   │                          Controller
   │                          ├─ Accede a req.user
   │                          └─ Procesa lógica
   │                                │
   │  ← Response 200 OK             │
   ├─────────────────────────────┤  │
   │
```

---

## 🎯 Puntos Clave a Recordar

✅ **Seguridad de Contraseñas:**
- Siempre hashear con bcrypt (salt: 10)
- Nunca guardar contraseñas en texto plano
- Validar longitud mínima (8 caracteres)

✅ **JWT Tokens:**
- Token válido 24 horas
- Refresh token válido 7 días
- Incluyen: user_id, role_id, email
- Se envían en header Authorization

✅ **Validaciones:**
- Emails: formato correcto y único
- Campos requeridos siempre presentes
- Contraseñas: mínimo 8 caracteres
- Códigos reset: 6 dígitos, expiran en 10 min

✅ **Email:**
- Usar Gmail SMTP
- Generar App Password (no usar contraseña normal)
- Fallos de email NO interrumpen autenticación
- Templates HTML profesionales

✅ **Errores:**
- Lanzar ApiError con status, code y message
- Middleware errorHandler maneja todas las excepciones
- Respuestas consistentes (success, code, message, data)

✅ **Roles:**
- 1 = Admin (acceso total)
- 2 = Cliente (acceso limitado)
- Verificar role_id en adminMiddleware

---

## 📚 Archivos Clave del Proyecto

```
Server/
├── index.js                          (Configuración Express)
├── src/
│   ├── config/                       (Configuración general)
│   ├── controllers/
│   │   ├── auth.controller.js        (Lógica de autenticación)
│   │   └── user.controller.js        (Lógica de usuarios)
│   ├── services/
│   │   ├── auth.service.js           (JWT, tokens)
│   │   ├── user.service.js           (Usuarios)
│   │   └── email.service.js          (Envío de emails)
│   ├── repositories/
│   │   └── user.repository.js        (Acceso a BD)
│   ├── routes/
│   │   ├── auth.routes.js            (Rutas de auth)
│   │   └── user.routes.js            (Rutas de usuarios)
│   ├── middlewares/
│   │   ├── auth.middleware.js        (JWT, admin check)
│   │   ├── apiError.js               (Clase de errores)
│   │   └── errorHandler.js           (Manejo global de errores)
│   └── db/
│       ├── db.js                     (Conexión MySQL)
│       └── schema.js                 (Info del esquema)
└── package.json
```

---

**Documento creado:** Diciembre 7, 2025  
**Versión:** 1.0  
**Enfoque:** Gestión de Usuarios, Autenticación JWT y Sistema de Correos
