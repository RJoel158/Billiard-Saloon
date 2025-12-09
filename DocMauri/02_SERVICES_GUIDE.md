# 🔧 Guía de Services

## ¿Qué son los Services?

Los **services** contienen toda la **lógica de negocio** de la aplicación. Son funciones que:
- ✅ Validan datos complejos
- ✅ Aplican reglas de negocio
- ✅ Coordinan operaciones
- ✅ Lanzan errores estructurados
- ✅ Usan repositorios para acceder a datos

```
[CONTROLLERS]
     ↓ Llamadas
[SERVICES] ← Aquí estamos (Lógica de negocio)
     ↓ Operaciones
[REPOSITORIES]
     ↓ Queries SQL
[BASE DE DATOS]
```

---

## 📋 Estructura de un Service

### Patrón General

```javascript
const repository = require('../repositories/nombre.repository');
const ApiError = require('../middlewares/apiError');

// Función simple: obtener un recurso
async function getItem(id) {
  const item = await repository.findById(id);
  if (!item) {
    throw new ApiError(404, 'ITEM_NOT_FOUND', 'Item no encontrado');
  }
  return item;
}

// Función compleja: crear con validaciones
async function createItem(data) {
  // 1. Validar datos
  if (!data.name) {
    throw new ApiError(400, 'MISSING_FIELD', 'El nombre es requerido');
  }
  
  // 2. Verificar reglas de negocio (duplicados, permisos, etc)
  const existing = await repository.findByName(data.name);
  if (existing) {
    throw new ApiError(409, 'DUPLICATE', 'El nombre ya existe');
  }
  
  // 3. Crear en BD
  const created = await repository.create(data);
  
  // 4. Retornar resultado
  return created;
}

module.exports = { getItem, createItem };
```

---

## 🔍 Services Disponibles

### 1. User Service
**Archivo:** `user.service.js`

Gestiona operaciones de usuarios.

```javascript
const userRepo = require('../repositories/user.repository');
const ApiError = require('../middlewares/apiError');

// ✅ Obtener usuario por ID
async function getUser(id) {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  }
  return user;
}

// ✅ Obtener usuario por email
async function getUserByEmail(email) {
  const user = await userRepo.findByEmail(email);
  return user;  // Puede ser null
}

// ✅ Crear usuario (con validación de duplicados)
async function createUser(data) {
  // Validar email no existe
  const existing = await userRepo.findByEmail(data.email);
  if (existing) {
    throw new ApiError(409, 'EMAIL_EXISTS', 'Email ya registrado');
  }
  
  // Crear en BD
  const user = await userRepo.create(data);
  return user;
}

// ✅ Obtener todos los usuarios
async function getAllUsers() {
  return await userRepo.findAll();
}

// ✅ Actualizar usuario
async function updateUser(id, data) {
  // Verificar que existe
  const existing = await userRepo.findById(id);
  if (!existing) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  }
  
  // Actualizar
  const updated = await userRepo.update(id, data);
  return updated;
}

// ✅ Eliminar usuario
async function deleteUser(id) {
  // Verificar que existe
  const existing = await userRepo.findById(id);
  if (!existing) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  }
  
  // Eliminar
  await userRepo.deleteById(id);
  return true;
}

module.exports = { 
  getUser, 
  getUserByEmail, 
  createUser, 
  getAllUsers, 
  updateUser, 
  deleteUser 
};
```

---

### 2. Auth Service
**Archivo:** `auth.service.js`

Gestiona JWT tokens y autenticación.

```javascript
const jwt = require('jsonwebtoken');

// ✅ Generar JWT token (24 horas)
function generateToken(userId, roleId, email) {
  const payload = {
    user_id: userId,
    role_id: roleId,
    email: email
  };
  
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '24h' }
  );
  
  return token;
}

// ✅ Generar Refresh Token (7 días)
function generateRefreshToken(userId) {
  const payload = { user_id: userId };
  
  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key',
    { expiresIn: '7d' }
  );
  
  return refreshToken;
}

// ✅ Verificar y decodificar token
function verifyToken(token) {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    return decoded;
    // Retorna: { user_id, role_id, email, iat, exp }
  } catch (error) {
    throw new Error(`Token inválido: ${error.message}`);
  }
}

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken
};
```

**Casos de Uso:**

```javascript
// En login
const token = authService.generateToken(user.id, user.role_id, user.email);

// En refresh token endpoint
const decoded = authService.verifyToken(refreshToken);
const newToken = authService.generateToken(decoded.user_id, ...);

// En middleware de autenticación
const decoded = authService.verifyToken(token);
req.user = decoded;  // Agrega usuario al request
```

---

### 3. Email Service
**Archivo:** `email.service.js`

Gestiona envío de correos electrónicos.

```javascript
const nodemailer = require('nodemailer');

// Configurar transporte SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

// ✅ Enviar email de bienvenida
async function sendWelcomeEmail(email, firstName, temporaryPassword) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: '¡Bienvenido a Billiard Saloon! - Tu contraseña temporal',
      html: `
        <div style="font-family: Arial; max-width: 600px;">
          <div style="background-color: #1a472a; color: white; padding: 30px;">
            <h1>🎱 Billiard Saloon</h1>
          </div>
          <div style="background-color: white; padding: 30px;">
            <h2>¡Hola ${firstName}!</h2>
            <p>Tu cuenta ha sido creada exitosamente.</p>
            <div style="background-color: #f9f9f9; padding: 15px;">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Contraseña temporal:</strong> <code>${temporaryPassword}</code></p>
            </div>
            <p>⚠️ Cambia tu contraseña en el primer inicio de sesión.</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email enviado correctamente' };
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error(`Error al enviar email: ${error.message}`);
  }
}

// ✅ Enviar email de reset de contraseña
async function sendPasswordResetEmail(email, resetCode) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Código de restablecimiento - Billiard Saloon',
      html: `
        <div style="font-family: Arial; max-width: 600px;">
          <div style="background-color: #1a472a; color: white; padding: 30px;">
            <h1>🎱 Billiard Saloon</h1>
            <p>Restablecimiento de contraseña</p>
          </div>
          <div style="background-color: white; padding: 30px;">
            <h2>Solicitud de restablecimiento</h2>
            <p>Usa el siguiente código de verificación:</p>
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center;">
              <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                ${resetCode}
              </p>
            </div>
            <p>⏱️ Este código expirará en 10 minutos.</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email enviado' };
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error(`Error al enviar email: ${error.message}`);
  }
}

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
```

**Casos de Uso:**

```javascript
// En registro
await emailService.sendWelcomeEmail(email, firstName, temporaryPassword);

// En reset de contraseña
await emailService.sendPasswordResetEmail(email, resetCode);
```

## 📌 Responsabilidades de Services

| ¿Quién lo hace? | Qué se valida |
|-----------------|--------------|
| **Service** | Datos complejos, reglas de negocio, duplicados |
| **Repository** | Queries SQL, conexión a BD |
| **Controller** | Código HTTP, formato de response |
| **Middleware** | Autenticación, CORS, errores globales |

---

## 🎓 Ejemplo Completo: Crear Usuario

```javascript
// En auth.controller.js
async function register(req, res, next) {
  try {
    const { first_name, last_name, email } = req.body;
    
    // Pasar al service
    const newUser = await userService.createUser({
      first_name,
      last_name,
      email,
      password_hash: hashedPassword,
      role_id: 2
    });
    
    // Responder
    res.status(201).json({ success: true, data: newUser });
  } catch (err) {
    next(err);
  }
}

// En user.service.js
async function createUser(data) {
  // 1. Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new ApiError(400, 'INVALID_EMAIL', 'El email no es válido');
  }
  
  // 2. Verificar no existe
  const existing = await userRepo.findByEmail(data.email);
  if (existing) {
    throw new ApiError(409, 'EMAIL_EXISTS', 'El email ya está registrado');
  }
  
  // 3. Crear en BD
  const user = await userRepo.create(data);
  
  // 4. Retornar
  return user;
}

// En user.repository.js
async function create(user) {
  await db.query(
    'INSERT INTO users (...) VALUES (...)',
    [user.first_name, user.last_name, user.email, ...]
  );
  const rows = await db.query('SELECT ... FROM users WHERE id = LAST_INSERT_ID()');
  return rows[0];
}

