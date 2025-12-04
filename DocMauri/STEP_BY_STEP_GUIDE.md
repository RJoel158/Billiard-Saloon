# 🎯 Paso a Paso: Probar el Login en Vivo

## Requisitos Previos
- Servidor Express corriendo en `http://localhost:3000`
- Extension "REST Client" instalada en VS Code
- Archivo `.env` con variables configuradas

---

## ✅ Paso 1: Instalar dependencias pendientes

Si aún no has instalado `jsonwebtoken`:

```bash
cd Server
npm install jsonwebtoken
```

---

## ✅ Paso 2: Verificar que el servidor esté corriendo

```bash
cd Server
npm run dev
```

Deberías ver:
```
✅ Conexión a la base de datos exitosa
🔎 Esquema cargado
🚀 Servidor corriendo en http://localhost:3000
```

---

## ✅ Paso 3: Abre el archivo de pruebas en VS Code

```
Server/api_tests_login.http
```

Deberías ver botones "Send Request" en cada endpoint.

---

## ✅ Paso 4: Registrar un usuario

Busca esta sección en el archivo:

```http
### 1. Registrar nuevo usuario
POST {{api}}/auth/register
Content-Type: application/json

{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan.perez@example.com"
}
```

**Haz clic en "Send Request"** y deberías ver:

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente. Revisa tu email para la contraseña temporal.",
  "data": {
    "id": 1,
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@example.com",
    "role_id": 2,
    "created_at": "2025-12-04T10:30:00.000Z"
  }
}
```

✅ **¿Qué sucedió?**
1. Servidor creó el usuario
2. Generó contraseña temporal (ej: `A9x$kL2@mP`)
3. Encriptó con bcrypt
4. Guardó en la BD
5. Envió email a `juan.perez@example.com`

**Revisa tu Gmail** para ver el email con la contraseña temporal.

---

## ✅ Paso 5: Hacer Login

Busca esta sección:

```http
### 2. Login con credenciales
POST {{api}}/auth/login
Content-Type: application/json

{
  "email": "juan.perez@example.com",
  "password": "AQUI_VA_LA_CONTRASEÑA_TEMPORAL"
}
```

Reemplaza `AQUI_VA_LA_CONTRASEÑA_TEMPORAL` con la que recibiste en el email.

**Haz clic en "Send Request"** y deberías ver:

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Autenticación exitosa",
  "data": {
    "user": {
      "id": 1,
      "email": "juan.perez@example.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "role_id": 2
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlX2lkIjoyLCJlbWFpbCI6Imp1YW4ucGVyZXpAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzMyMzQ2MDAsImV4cCI6MTczMzMyMTAwMH0.VBj...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE3MzMyMzQ2MDAsImV4cCI6MTczMzgzOTQwMH0.AjT..."
  }
}
```

✅ **¿Qué sucedió?**
1. Servidor validó email
2. Comparó contraseña con bcrypt.compare()
3. Generó Access Token (válido 24h)
4. Generó Refresh Token (válido 7d)
5. Retornó tokens + datos usuario

📋 **Copia el token para los próximos pasos.**

---

## ✅ Paso 6: Cambiar contraseña temporal

Busca esta sección y **actualiza el token** con el que recibiste:

```http
### 5. Cambiar contraseña temporal
POST {{api}}/auth/change-temporary-password
Authorization: Bearer AQUI_VA_TU_TOKEN
Content-Type: application/json

{
  "newPassword": "MiNuevaPassword123!",
  "confirmPassword": "MiNuevaPassword123!"
}
```

Reemplaza:
- `AQUI_VA_TU_TOKEN` con el token del login anterior

**Haz clic en "Send Request"** y deberías ver:

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente",
  "data": {
    "id": 1,
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@example.com",
    "role_id": 2
  }
}
```

✅ **¿Qué sucedió?**
1. Middleware validó token
2. Extrajo user_id del token
3. Validó que las contraseñas coincidan
4. Encriptó nueva contraseña
5. Actualizó en BD

📝 **De ahora en adelante, usa esta nueva contraseña para loguear.**

---

## ✅ Paso 7: Login con nueva contraseña

Actualiza el endpoint de login con tu nueva contraseña:

```http
### 2. Login con credenciales
POST {{api}}/auth/login
Content-Type: application/json

{
  "email": "juan.perez@example.com",
  "password": "MiNuevaPassword123!"
}
```

**Haz clic en "Send Request"** y deberías ver el mismo formato que antes.

✅ **Ahora tiene una contraseña permanente.**

---

## ✅ Paso 8: Acceder a ruta protegida

Busca esta sección y **actualiza el token**:

```http
### Obtener todos los usuarios (requiere token)
GET {{api}}/users
Authorization: Bearer AQUI_VA_TU_TOKEN
```

**Haz clic en "Send Request"** y deberías ver:

**Response (200 OK)**:
```json
[
  {
    "id": 1,
    "role_id": 2,
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@example.com",
    "phone": null,
    "created_at": "2025-12-04T10:30:00.000Z"
  }
]
```

✅ **Funcionó porque incluyó un token válido.**

---

## ✅ Paso 9: Intentar sin token

Copia el endpoint de usuarios pero **sin el Authorization header**:

```http
GET http://localhost:3000/api/users
Content-Type: application/json
```

**Haz clic en "Send Request"** y verás:

**Response (401 Unauthorized)**:
```json
{
  "success": false,
  "code": "MISSING_TOKEN",
  "message": "Token no proporcionado. Use: Authorization: Bearer <token>"
}
```

✅ **Correctamente rechazó el acceso sin token.**

---

## ✅ Paso 10: Renovar token

Busca esta sección:

```http
### 3. Renovar token con Refresh Token
POST {{api}}/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "AQUI_VA_TU_REFRESH_TOKEN"
}
```

Reemplaza con el `refreshToken` del login.

**Haz clic en "Send Request"** y verás:

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

✅ **Obtuviste un nuevo Access Token sin re-loguearte.**

---

## 🎯 Resumen de Flujo Completo

```
1. REGISTRAR
   POST /auth/register → Crea usuario + envía email

2. RECIBIR EMAIL
   Gmail → Contraseña temporal

3. PRIMER LOGIN
   POST /auth/login → Access Token + Refresh Token

4. CAMBIAR CONTRASEÑA
   POST /auth/change-temporary-password → Contraseña permanente

5. LOGIN CON NUEVA CONTRASEÑA
   POST /auth/login → Nuevos tokens

6. ACCEDER RUTA PROTEGIDA
   GET /api/users + Authorization: Bearer token → Datos

7. TOKEN EXPIRA
   POST /auth/refresh-token → Nuevo Access Token

8. LOGOUT
   POST /auth/logout → Limpia cliente
```

---

## 🐛 Solucionar Problemas

### ❌ Error: "Cannot find module 'nodemailer'"
**Solución**: 
```bash
npm install nodemailer
```

### ❌ Error: "Cannot find module 'jsonwebtoken'"
**Solución**: 
```bash
npm install jsonwebtoken
```

### ❌ Error: "INVALID_EMAIL"
**Solución**: 
- Usa un email válido: `user@example.com`
- No use emails sin dominio

### ❌ Error: "EMAIL_EXISTS"
**Solución**: 
- El email ya está registrado
- Registra con otro email o elimina el usuario anterior

### ❌ Error: "INVALID_CREDENTIALS"
**Solución**: 
- Email o contraseña incorrectos
- Verifica que usaste la contraseña del email recibido

### ❌ Error: "MISSING_TOKEN"
**Solución**: 
- Agregar header `Authorization: Bearer token`
- Verificar que el token no esté vacío

### ❌ Error: "INVALID_TOKEN" o "Token inválido"
**Solución**: 
- El token expiró (usa refresh token)
- El token está corrupto (cópialo nuevamente)
- El JWT_SECRET cambió (genera nuevo token)

### ❌ No recibí email
**Solucionar**:
1. Revisa spam/basura de Gmail
2. Verifica que GMAIL_USER y GMAIL_PASSWORD sean correctos en .env
3. Verifica que la contraseña de aplicación sea válida (no la contraseña normal)
4. En desarrollo, los emails pueden tardar

---

## 💡 Tips Útiles

1. **Guardar token temporalmente**:
   - Copia el token completo del response
   - Pégatelo en los headers de rutas posteriores

2. **Ver detalles del token**:
   - Visita https://jwt.io
   - Pega tu token para verlo decodificado

3. **Regenerar contraseña**:
   - POST `/auth/request-password-reset` con tu email

4. **Probar con múltiples usuarios**:
   - Crea varios usuarios con diferentes emails

5. **Monitorear logs del servidor**:
   - Los errores aparecen en la consola donde corres `npm run dev`

---

## 📸 Documentación Visual

### Pantalla de Registro
```
┌─────────────────────────────┐
│ BILLIARD SALOON - REGISTRO  │
├─────────────────────────────┤
│ Nombre: [       ]           │
│ Apellido: [     ]           │
│ Email: [        ]           │
│                             │
│ [REGISTRARSE]               │
└─────────────────────────────┘
        ↓
    Email recibido
    ↓
Contraseña temporal: A9x$kL2@mP
```

### Pantalla de Login
```
┌──────────────────────────┐
│ BILLIARD SALOON - LOGIN  │
├──────────────────────────┤
│ Email: [  ]              │
│ Contraseña: [  ]         │
│                          │
│ [LOGIN]                  │
└──────────────────────────┘
    ↓
[Token almacenado]
    ↓
Acceso a rutas protegidas
```

---

¡Ahora ya sabes cómo funciona el sistema de login en vivo! 🎉
