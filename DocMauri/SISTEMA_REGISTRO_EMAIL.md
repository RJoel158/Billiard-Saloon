# 📧 Sistema de Registro con Envío de Email

## 🎯 Descripción

Este sistema implementa un flujo de registro completo donde:
1. El usuario se registra con su nombre, apellido y email
2. Se genera una **contraseña temporal aleatoria** automáticamente
3. Se envía un **email de bienvenida** con la contraseña temporal
4. El usuario inicia sesión con la contraseña temporal
5. En el primer login, puede cambiar la contraseña temporal por una nueva

## 🔧 Configuración

### 1. Instalar dependencia
```bash
npm install nodemailer
```

### 2. Configurar Gmail
Para que funcione con Gmail, necesitas:

1. **Activar autenticación de 2 pasos** en tu cuenta de Google:
   - Ir a https://myaccount.google.com/
   - Seguridad → Autenticación en 2 pasos

2. **Generar contraseña de aplicación**:
   - En Google Account → Seguridad → Contraseñas de aplicaciones
   - Seleccionar "Correo" y "Windows Computer"
   - Copiar la contraseña generada

3. **Configurar archivo `.env`**:
```env
GMAIL_USER=tu_email@gmail.com
GMAIL_PASSWORD=tu_contraseña_de_aplicación
FRONTEND_URL=http://localhost:5173
```

### 3. Actualizar esquema de BD (opcional para reset password)
Si quieres implementar restablecimiento de contraseña, agrega columnas:

```sql
ALTER TABLE `users` ADD COLUMN `reset_token` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `reset_token_expiry` DATETIME DEFAULT NULL;
```

## 📡 Endpoints

### 1. Registro de Usuario
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan.perez@gmail.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente. Revisa tu email para la contraseña temporal.",
  "data": {
    "id": 1,
    "role_id": 2,
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@gmail.com",
    "phone": null,
    "created_at": "2025-12-02T10:30:00Z",
    "status": 1
  }
}
```

**Errores posibles:**
```json
{
  "success": false,
  "error": "MISSING_FIELDS",
  "message": "Faltan campos requeridos: first_name, last_name, email"
}
```

```json
{
  "success": false,
  "error": "INVALID_EMAIL",
  "message": "El email no es válido"
}
```

```json
{
  "success": false,
  "error": "EMAIL_EXISTS",
  "message": "El email ya está registrado"
}
```

### 2. Cambiar Contraseña Temporal
**POST** `/api/auth/change-temporary-password`

**Headers:**
```
Authorization: Bearer {token_jwt}
```

**Request Body:**
```json
{
  "newPassword": "MiNuevaContraseña123!",
  "confirmPassword": "MiNuevaContraseña123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente",
  "data": {
    "id": 1,
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@gmail.com"
  }
}
```

### 3. Solicitar Restablecimiento de Contraseña
**POST** `/api/auth/request-password-reset`

**Request Body:**
```json
{
  "email": "juan.perez@gmail.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Si el email existe en nuestro sistema, recibirás un correo con instrucciones"
}
```

## 🎨 Email de Bienvenida

El email que reciben los usuarios contiene:
- Bienvenida personalizada
- Email y contraseña temporal
- Advertencia sobre cambiar contraseña
- HTML formateado con estilos

**Ejemplo visual:**
```
╔════════════════════════════════════════════╗
║     🎱 Billiard Saloon - Bienvenida        ║
╚════════════════════════════════════════════╝

¡Hola Juan!

Tu cuenta ha sido creada exitosamente.

Email: juan.perez@gmail.com
Contraseña temporal: K@5mL9pQx2Rt

⚠️ IMPORTANTE: Cambia tu contraseña en el 
   primer inicio de sesión.

Si tienes preguntas, contacta con soporte.

© 2025 Billiard Saloon
```

## 🔐 Seguridad - Buenas Prácticas

1. **Contraseña temporal fuerte**:
   - 12 caracteres
   - Mayúsculas, minúsculas, números y símbolos

2. **Hash seguro**:
   - Usar bcrypt con 10 saltos
   - Nunca guardar contraseñas en texto plano

3. **Email de verificación**:
   - Usar HTTPS
   - No incluir datos sensibles en el sujeto

4. **Límite de intentos**:
   - Implementar rate limiting en rutas de auth

5. **Tokens JWT**:
   - Implementar autenticación con JWT
   - Expiración de tokens

## 💻 Ejemplo de Uso en Frontend (React)

```jsx
import axios from 'axios';
import { useState } from 'react';

export function RegisterForm() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/register',
        formData
      );
      
      setMessage('¡Registro exitoso! Revisa tu email para la contraseña temporal.');
      setFormData({ first_name: '', last_name: '', email: '' });
      
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="first_name"
        placeholder="Nombre"
        value={formData.first_name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="last_name"
        placeholder="Apellido"
        value={formData.last_name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

## 🧪 Pruebas con Postman/Thunder Client

### Registro
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "first_name": "TestUser",
  "last_name": "Testing",
  "email": "testuser@gmail.com"
}
```

### Solicitar Reset Password
```
POST http://localhost:3000/api/auth/request-password-reset
Content-Type: application/json

{
  "email": "testuser@gmail.com"
}
```

## 📋 Flujo Completo

```
1. Usuario llena formulario de registro
   ↓
2. Frontend envía POST /api/auth/register
   ↓
3. Backend valida datos
   ↓
4. Backend genera contraseña temporal
   ↓
5. Backend hashea contraseña
   ↓
6. Backend crea usuario en BD
   ↓
7. Backend envía email con contraseña
   ↓
8. Usuario recibe email con instrucciones
   ↓
9. Usuario inicia sesión con temp password
   ↓
10. Usuario cambia contraseña (opcional)
```

## 🐛 Troubleshooting

### El email no se envía
- Verificar que GMAIL_USER y GMAIL_PASSWORD estén correctos en `.env`
- Verificar autenticación de 2 pasos en Google
- Verificar que la contraseña sea de aplicación, no la contraseña de Google

### Error "EAUTH"
- Esperar 15 minutos y reintentar
- Usar navegador para verificar gmail.com y autorizar acceso

### El email llega a spam
- Agregar direcciones a contactos
- Mejorar contenido del email (menos enlaces)
- Implementar DKIM y SPF

## 🚀 Mejoras Futuras

- [ ] Verificación de email con token
- [ ] JWT para autenticación
- [ ] Rate limiting
- [ ] Logs de auditoría
- [ ] 2FA (autenticación de dos factores)
- [ ] OAuth (Google, GitHub)
