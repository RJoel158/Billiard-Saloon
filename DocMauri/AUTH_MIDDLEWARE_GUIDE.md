# Implementar Autenticación en Rutas - Guía Rápida

## 📌 ¿Cómo proteger una ruta con autenticación?

### Paso 1: Importar el middleware

```javascript
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');
```

### Paso 2: Agregar el middleware a la ruta

```javascript
// Ruta pública (sin autenticación)
router.post('/register', authController.register);

// Ruta protegida (requiere token)
router.get('/users', authMiddleware, userController.getAll);

// Ruta solo para administradores
router.delete('/users/:id', authMiddleware, adminMiddleware, userController.delete);
```

## 📋 Ejemplos

### Ejemplo 1: Ruta GET protegida
```javascript
const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

// Sin autenticación
router.post('/register', userController.register);

// Con autenticación
router.get('/profile', authMiddleware, userController.getProfile);

module.exports = router;
```

### Ejemplo 2: Ruta DELETE solo para admins
```javascript
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    // req.user contiene: { user_id, role_id, email }
    // Solo entra aquí si:
    // 1. Token es válido (authMiddleware)
    // 2. role_id === 1 (adminMiddleware)
    
    const userId = req.params.id;
    await userService.deleteUser(userId);
    
    res.json({
      success: true,
      message: 'Usuario eliminado'
    });
  } catch (err) {
    next(err);
  }
});
```

## 🔍 ¿Cómo acceder a los datos del usuario en las rutas?

Una vez que el token es validado, los datos del usuario están disponibles en `req.user`:

```javascript
router.get('/profile', authMiddleware, (req, res) => {
  const { user_id, role_id, email } = req.user;
  
  console.log(`Usuario ID: ${user_id}`);
  console.log(`Rol ID: ${role_id}`);
  console.log(`Email: ${email}`);
  
  res.json({
    message: `Bienvenido ${email}`,
    user: req.user
  });
});
```

## 🛡️ Roles

- **role_id = 1**: Administrador (acceso total)
- **role_id = 2**: Cliente (acceso limitado)

## ⚡ Flujo de Validación

```
Request con: Authorization: Bearer token
         ↓
authMiddleware valida token
         ↓
¿Token válido?
  - SÍ: añade req.user y continúa
  - NO: devuelve 401 Unauthorized
         ↓
adminMiddleware (si existe)
         ↓
¿user.role_id === 1?
  - SÍ: continúa
  - NO: devuelve 403 Forbidden
         ↓
Ejecuta la función de la ruta
```

## 📝 Plantilla rápida

```javascript
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

// Ruta que requiere autenticación
router.get('/datos', authMiddleware, (req, res) => {
  res.json({
    message: 'Datos protegidos',
    usuario: req.user
  });
});

// Ruta que requiere ser admin
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    message: 'Solo admins pueden ver esto'
  });
});
```

## ❌ Errores Comunes

```javascript
// ❌ INCORRECTO - No puede acceder a req.user
router.get('/datos', (req, res) => {
  console.log(req.user); // undefined
});

// ✅ CORRECTO - Usar authMiddleware primero
router.get('/datos', authMiddleware, (req, res) => {
  console.log(req.user); // { user_id, role_id, email }
});

// ❌ INCORRECTO - Orden importa
router.delete('/:id', adminMiddleware, authMiddleware, ...);

// ✅ CORRECTO - authMiddleware primero, luego adminMiddleware
router.delete('/:id', authMiddleware, adminMiddleware, ...);
```

## 🧪 Prueba en la API

1. Haz login en `/api/auth/login`
2. Copia el `token` del response
3. Usa en el header de rutas protegidas:
   ```
   Authorization: Bearer tu_token_aqui
   ```
