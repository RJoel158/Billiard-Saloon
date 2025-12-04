# 🎓 Preguntas Frecuentes para Defensa - Sistema de Login

## ❓ Preguntas sobre JWT

### P1: ¿Qué es JWT y por qué lo usamos?
**R**: JWT (JSON Web Token) es un estándar para transmitir información de forma segura entre cliente y servidor. Lo usamos porque:
- Es **stateless**: No necesita almacenarse en el servidor
- Es **seguro**: Está firmado digitalmente
- Es **escalable**: Funciona bien en microservicios
- Cada token contiene la información del usuario

### P2: ¿Cómo está compuesto un JWT?
**R**: Un JWT tiene 3 partes separadas por puntos (.):
```
header.payload.signature
```
- **Header**: `{"alg": "HS256", "typ": "JWT"}`
- **Payload**: `{"user_id": 1, "role_id": 2, "email": "user@example.com"}`
- **Signature**: Firma HMAC-SHA256 del header + payload + secret

### P3: ¿Qué diferencia hay entre Access Token y Refresh Token?
**R**:
| Token | Duración | Uso | Ubicación |
|-------|----------|-----|-----------|
| Access | 24 horas | Acceder recursos | Header Authorization |
| Refresh | 7 días | Renovar Access | Seguro (no JavaScript) |

Cuando expira el Access Token, usamos el Refresh Token para obtener uno nuevo sin que el usuario ingrese credenciales nuevamente.

---

## ❓ Preguntas sobre Seguridad

### P4: ¿Por qué encriptamos las contraseñas con bcrypt?
**R**: Bcrypt es un algoritmo **adaptive hash** que:
- Es **lento** (ralentiza ataques de fuerza bruta)
- Usa **salt** (secuencia aleatoria) para cada hash
- Es **irreversible** (no se puede desencriptar)
- Tiene **factor de costo** (aumenta la dificultad con el tiempo)

```javascript
// Cuando se crea el usuario:
const hashedPassword = await bcrypt.hash(password, 10);

// Cuando se valida:
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

### P5: ¿Qué sucede si alguien obtiene un token?
**R**: Si se obtiene un token:
1. Puede usarlo mientras esté válido (24 horas)
2. **NO puede** extraer la contraseña (es solo un token, no contiene contraseña)
3. Después de 24h expira automáticamente
4. Si sospechamos, el usuario puede cambiar contraseña

### P6: ¿Cómo protegemos contra ataques de inyección SQL?
**R**: Usamos **prepared statements** en todas las queries:
```javascript
// ✅ SEGURO - Parámetros separados
await db.query('SELECT * FROM users WHERE email = ?', [email]);

// ❌ INSEGURO - Concatenación directa
await db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

---

## ❓ Preguntas sobre el Flow

### P7: ¿Cuál es el flujo completo de registro?
**R**:
```
1. Usuario envía: { first_name, last_name, email }
2. Servidor valida que email no exista
3. Genera contraseña temporal aleatoria (12 caracteres)
4. Encripta con bcrypt
5. Guarda en BD
6. Envía email con contraseña temporal
7. Usuario recibe email y se loguea con esa contraseña
8. Usuario cambia por contraseña permanente
```

### P8: ¿Cuál es el flujo completo de login?
**R**:
```
1. Usuario envía: { email, password }
2. Servidor busca usuario por email
3. Compara password con bcrypt.compare()
4. Si es válido:
   a. Genera Access Token (24h)
   b. Genera Refresh Token (7d)
   c. Retorna tokens + datos usuario
5. Cliente almacena tokens (localStorage/sessionStorage)
6. Cliente incluye token en próximas requests
```

### P9: ¿Qué pasa cuando un token expira?
**R**:
```
1. Cliente envía request con token expirado
2. Servidor valida: ¡Token expirado!
3. Retorna 401 Unauthorized
4. Cliente intenta renovar con Refresh Token
5. Si Refresh es válido: genera nuevo Access Token
6. Si Refresh expiró: usuario debe re-loguearse
```

---

## ❓ Preguntas sobre la Implementación

### P10: ¿Cómo funciona el middleware de autenticación?
**R**:
```javascript
// En auth.middleware.js
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.substring(7); // Quita "Bearer "
    
    const decoded = authService.verifyToken(token);
    req.user = decoded; // Guarda datos en request
    
    next(); // Continúa a la ruta
  } catch (err) {
    next(new ApiError(401, 'INVALID_TOKEN', ...));
  }
}
```

### P11: ¿Cómo uso el middleware en una ruta?
**R**:
```javascript
// Sin autenticación (pública)
router.post('/register', authController.register);

// Con autenticación
router.get('/profile', authMiddleware, userController.getProfile);

// Solo para admins
router.delete('/users/:id', authMiddleware, adminMiddleware, ...);
```

### P12: ¿Cómo accedo a los datos del usuario en una ruta protegida?
**R**:
```javascript
router.get('/profile', authMiddleware, (req, res) => {
  // req.user contiene: { user_id, role_id, email }
  const { user_id, email } = req.user;
  
  res.json({
    message: `Hola ${email}`,
    userId: user_id
  });
});
```

---

## ❓ Preguntas sobre Email

### P13: ¿Cómo enviamos emails con la contraseña temporal?
**R**:
```javascript
// En email.service.js
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

// Generar HTML bonito con la contraseña
const htmlTemplate = `...`;

await transporter.sendMail({
  from: process.env.GMAIL_USER,
  to: email,
  subject: '¡Bienvenido! Tu contraseña temporal',
  html: htmlTemplate
});
```

### P14: ¿Qué información incluimos en el email?
**R**:
- Email del usuario
- Contraseña temporal generada
- Advertencia de cambiarla en primer login
- Link a la app (si es necesario)
- Información de contacto de soporte

---

## ❓ Preguntas sobre Base de Datos

### P15: ¿Qué campos tiene la tabla de usuarios?
**R**:
```sql
users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT (admin=1, client=2),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  phone VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active TINYINT (opcional para soft delete)
)
```

---

## ❓ Preguntas Teóricas

### P16: ¿Qué es autenticación vs autorización?
**R**:
- **Autenticación**: Verificar que eres quien dices ser (login)
- **Autorización**: Verificar qué puedes hacer (permisos)

Ejemplo:
```
Autenticación: "¿Eres Juan?" → Sí, aquí está mi token
Autorización: "¿Puedes eliminar usuarios?" → No, solo admins
```

### P17: ¿Por qué usar Bearer tokens en el header?
**R**:
- **Seguro**: No se envía en la URL
- **Estándar**: Todos los navegadores lo soportan
- **Escalable**: Funciona con CORS
- **Limpio**: Separación entre datos y autenticación

Formato:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### P18: ¿Qué es CORS y cómo se relaciona con autenticación?
**R**: CORS (Cross-Origin Resource Sharing) permite que dominios diferentes accedan a recursos. Con autenticación:
- El cliente (localhost:5173) solicita recursos al servidor (localhost:3000)
- Incluye token en el header
- Servidor valida el token
- Si es válido, retorna datos

---

## 🧪 Pruebas Prácticas

### P19: ¿Cómo pruebo el login?

**Opción 1: REST Client en VS Code**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "tempPass123"
}
```

**Opción 2: cURL**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"tempPass123"}'
```

**Opción 3: Frontend (JavaScript)**
```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'tempPass123'
  })
});

const { token } = await response.json();
localStorage.setItem('token', token);
```

### P20: ¿Cómo uso el token en requests posteriores?

**Header HTTP**:
```
Authorization: Bearer tu_token_aqui
```

**JavaScript/Fetch**:
```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:3000/api/users', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 📊 Resumen Visual

```
[Usuario]
   ↓ POST /auth/login (email, password)
[Servidor: Valida credenciales]
   ↓
[Genera JWT (Access + Refresh)]
   ↓
[Retorna tokens]
   ↓
[Cliente almacena token]
   ↓ GET /api/users + Authorization: Bearer token
[Servidor: Valida token]
   ↓
¿Válido? SÍ → [Retorna datos]
¿Válido? NO → [Retorna 401]
   ↓
[Cliente]: ¿Token expirado? → Usa Refresh Token
```

---

## ✅ Checklist para la Defensa

Antes de presentar, asegúrate de poder:

- [ ] Explicar qué es JWT y sus 3 partes
- [ ] Diferenciar Access Token vs Refresh Token
- [ ] Explicar por qué bcrypt es seguro
- [ ] Describir el flow completo de registro
- [ ] Describir el flow completo de login
- [ ] Mostrar cómo funciona el middleware
- [ ] Explicar qué pasa con un token expirado
- [ ] Mostrar cómo se usan en las rutas protegidas
- [ ] Explicar medidas de seguridad (SQL Injection, etc)
- [ ] Demostrar un login real en la API

---

## 🎯 Respuestas Clave para Memorizar

> "JWT es un token stateless que contiene información del usuario, firmada digitalmente para que no pueda ser modificado."

> "Bcrypt es lento a propósito para ralentizar ataques de fuerza bruta."

> "El middleware valida el token, extrae los datos del usuario y los agrega a req.user."

> "Si el Access Token expira, usamos el Refresh Token para obtener uno nuevo."

> "Las rutas sin authMiddleware son públicas, las con authMiddleware requieren token válido."
