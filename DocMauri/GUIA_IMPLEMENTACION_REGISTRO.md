# 🚀 Guía Paso a Paso - Implementar Sistema de Registro con Email

## ✅ Lista de Verificación

Sigue estos pasos exactamente en orden:

## **PASO 1: Instalar dependencia**

```bash
cd Server
npm install nodemailer
```

**Verificar instalación:**
```bash
npm list nodemailer
```

---

## **PASO 2: Configurar Gmail**

### 2.1 Habilitar autenticación de 2 pasos

1. Ir a https://myaccount.google.com/
2. Menú izquierdo → "Seguridad"
3. Buscar "Autenticación en 2 pasos"
4. Hacer clic → "Comenzar"
5. Seguir los pasos (SMS o aplicador)

### 2.2 Generar contraseña de aplicación

1. Ir a https://myaccount.google.com/
2. Menú izquierdo → "Seguridad"
3. Buscar "Contraseña de aplicaciones" (aparece después de habilitar 2FA)
4. Seleccionar:
   - Aplicación: "Correo"
   - Dispositivo: "Windows Computer"
5. Hacer clic en "Generar"
6. **Copiar la contraseña de 16 caracteres**

```
Ejemplo: jkfh jsdk kfjs kdfs
(sin espacios: jkfhjsdkkfjskdfs)
```

### 2.3 Crear archivo `.env`

En la carpeta `Server/` crea archivo `.env`:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=reciclaje_billar

# Gmail
GMAIL_USER=tu_email@gmail.com
GMAIL_PASSWORD=jkfhjsdkkfjskdfs

# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**IMPORTANTE:**
- No incluir espacios alrededor de `=`
- `.env` está en `.gitignore` (no se sube a GitHub)
- Cada persona tiene su `.env` local

---

## **PASO 3: Archivos creados (verificar que existan)**

```
Server/
├── src/
│   ├── controllers/
│   │   └── auth.controller.js       ✅ NUEVO
│   ├── routes/
│   │   └── auth.routes.js           ✅ NUEVO
│   └── services/
│       └── email.service.js         ✅ NUEVO
├── .env                             ✅ NUEVO
└── package.json                     ✅ MODIFICADO
```

**Verificar contenido:**

```bash
# Ver si existe email.service.js
cat src/services/email.service.js

# Ver si existe auth.controller.js
cat src/controllers/auth.controller.js

# Ver si existe auth.routes.js
cat src/routes/auth.routes.js
```

---

## **PASO 4: Actualizar `index.js`**

El archivo `index.js` ya debe tener:

```javascript
let authRoutes; // En las declaraciones

// Después de otras rutas:
authRoutes = require("./src/routes/auth.routes");
app.use('/api/auth', authRoutes);
```

**Verificar:**
```bash
grep -n "authRoutes" index.js
# Debe mostrar líneas donde aparece authRoutes
```

---

## **PASO 5: Actualizar `user.service.js`**

Debe incluir nueva función:

```javascript
async function getUserByEmail(email) {
  const user = await userRepo.findByEmail(email);
  return user;
}

module.exports = { getUser, getUserByEmail, createUser, getAllUsers, updateUser, deleteUser };
```

**Verificar:**
```bash
grep -n "getUserByEmail" src/services/user.service.js
```

---

## **PASO 6: Iniciar servidor**

```bash
# Desde carpeta Server/
npm run dev

# Debería verse algo como:
# ✅ Conexión a la base de datos exitosa
# 🔎 Esquema cargado (columns detectadas)
# 🚀 Servidor corriendo en http://localhost:3000
```

**Si hay errores:**
```bash
# Error de email
# → Verificar .env (Gmail y contraseña correctos)

# Error de BD
# → Verificar conexión a MySQL

# Error de módulo nodemailer
# → Ejecutar: npm install nodemailer
```

---

## **PASO 7: Probar endpoints**

### 7.1 Usar Thunder Client / Postman

En VS Code instala: "Thunder Client" (extensión)

### 7.2 Probar registro

```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "tu_email@gmail.com"
}
```

**Respuesta esperada (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente. Revisa tu email para la contraseña temporal.",
  "data": {
    "id": 1,
    "role_id": 2,
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "tu_email@gmail.com",
    "status": 1
  }
}
```

**Si no funciona:**

```
Error: No puedo enviar email
→ Verificar GMAIL_USER y GMAIL_PASSWORD en .env

Error: Email ya existe
→ Usar otro email o borrar usuario de BD

Error: 404 /api/auth/register
→ Verificar que authRoutes esté en index.js
```

### 7.3 Verificar email recibido

1. Ir a la bandeja de entrada de `tu_email@gmail.com`
2. Buscar correo de "Billiard Saloon"
3. Copiar la contraseña temporal

### 7.4 Verificar que se guardó en BD

```sql
SELECT * FROM users WHERE email = 'tu_email@gmail.com';
```

---

## **PASO 8: Actualizar Base de Datos (Opcional - Para reset password)**

Si quieres implementar "Olvidé contraseña", agrega columnas:

```sql
ALTER TABLE `users` ADD COLUMN `reset_token` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `reset_token_expiry` DATETIME DEFAULT NULL;
```

---

## **PASO 9: Probar casos de error**

### Email ya existe
```
POST http://localhost:3000/api/auth/register
{
  "first_name": "Otro",
  "last_name": "Usuario",
  "email": "tu_email@gmail.com"  ← Ya registrado
}
```

**Respuesta (409):**
```json
{
  "success": false,
  "error": "EMAIL_EXISTS",
  "message": "El email ya está registrado"
}
```

### Email inválido
```
POST http://localhost:3000/api/auth/register
{
  "first_name": "Test",
  "last_name": "User",
  "email": "email_sin_arroba.com"
}
```

**Respuesta (400):**
```json
{
  "success": false,
  "error": "INVALID_EMAIL",
  "message": "El email no es válido"
}
```

### Faltan campos
```
POST http://localhost:3000/api/auth/register
{
  "first_name": "Solo",
  "last_name": "Nombre"
  // Falta email
}
```

**Respuesta (400):**
```json
{
  "success": false,
  "error": "MISSING_FIELDS",
  "message": "Faltan campos requeridos: first_name, last_name, email"
}
```

---

## **PASO 10: Integrar con Frontend (React)**

### 10.1 Crear componente Register.tsx

```typescript
import { useState } from 'react';
import axios from 'axios';

export function Register() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/register',
        formData
      );

      setMessage(response.data.message);
      setFormData({ first_name: '', last_name: '', email: '' });

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error en el registro';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre:</label>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          placeholder="Juan"
          required
        />
      </div>

      <div>
        <label>Apellido:</label>
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          placeholder="Pérez"
          required
        />
      </div>

      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="juan@example.com"
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
    </form>
  );
}
```

### 10.2 Usar en App.tsx

```typescript
import { Register } from './pages/Register';

function App() {
  return (
    <div>
      <Register />
    </div>
  );
}

export default App;
```

---

## **PASO 11: Verificar Logs**

Para debugging, revisa los logs del servidor:

```bash
# Terminal donde está npm run dev

# Deberías ver:
# [timestamp] Email enviado a: juan@gmail.com
# [timestamp] Usuario creado: id=1, email=juan@gmail.com
```

Si hay error:

```bash
# Error: Error enviando email: ...
# → GMAIL_USER o GMAIL_PASSWORD incorrectos
# → Gmail bloqueó acceso (requiere re-autenticación)

# Error: EMAIL_EXISTS
# → Intentar con otro email

# Error: INVALID_EMAIL
# → Formato de email incorrecto (sin @, sin .)
```

---

## **PASO 12: Commit a Git**

Una vez todo funcione:

```bash
git add .
git commit -m "feat: Sistema de registro con envío de email"
git push origin login-mauri
```

---

## **Checklist Final**

```
☑️ npm install nodemailer
☑️ Gmail: Autenticación 2FA activada
☑️ Gmail: Contraseña de aplicación generada
☑️ Crear archivo .env con credenciales
☑️ Archivos creados: email.service.js, auth.controller.js, auth.routes.js
☑️ index.js actualizado con authRoutes
☑️ user.service.js tiene getUserByEmail()
☑️ Servidor inicia sin errores (npm run dev)
☑️ POST /api/auth/register funciona
☑️ Email se recibe en bandeja de entrada
☑️ Usuario guardado en BD
☑️ Casos de error funcionan correctamente
☑️ Frontend integrado (opcional)
☑️ Commit a Git
```

---

## **Troubleshooting Rápido**

| Problema | Solución |
|----------|----------|
| Error `EAUTH` en email | Esperar 15 min, reintentar o regenerar contraseña app |
| Email no llega | Revisar carpeta spam, agregar a contactos |
| Error 404 en `/api/auth/register` | `authRoutes` no está en `index.js` |
| `MISSING_FIELDS` | Enviar `first_name`, `last_name`, `email` |
| `INVALID_EMAIL` | Validar formato: user@example.com |
| `EMAIL_EXISTS` | Ese email ya está registrado |
| Error `MODULE_NOT_FOUND` nodemailer | Ejecutar: `npm install nodemailer` |
| Connection refused a BD | MySQL no está corriendo |
| Error en `.env` | No hay espacios alrededor de `=` |

---

## **Próximas Mejoras**

Después de que esto funcione, agregar:

- [ ] JWT para autenticación
- [ ] Verificación de email (link en email)
- [ ] Rate limiting (máx 5 registros por IP)
- [ ] Cambio de contraseña temporal en primer login
- [ ] Recuperación de contraseña (reset password)
- [ ] 2FA (código OTP)
- [ ] Login con Google / GitHub
- [ ] Captcha en formulario

