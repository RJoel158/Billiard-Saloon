# 🎓 Preguntas de Defensa - Sistema de Registro con Email

## 1. ¿Cómo funciona la generación de contraseña temporal?

**Código:**
```javascript
function generateTemporaryPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
```

**Explicación:**
- Se utiliza un conjunto de caracteres que incluye mayúsculas, minúsculas, números y símbolos
- Se genera un bucle 12 veces
- En cada iteración, se selecciona un carácter aleatorio usando `Math.random()`
- `Math.floor()` convierte el número decimal a entero
- Se concatenan los caracteres para formar la contraseña
- Esto genera contraseñas únicas y seguras cada vez

**Ventajas:**
- Difícil de predecir
- Sin patrones
- Combinación de tipos de caracteres

---

## 2. ¿Por qué usar bcrypt para hashear contraseñas?

**Respuesta:**
```javascript
const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
```

**Razones:**
- **Irreversible**: No se puede obtener la contraseña original del hash
- **Con salt**: Bcrypt incluye automáticamente un "salt" (dato aleatorio) para evitar ataques de diccionario
- **Adaptive**: Se puede aumentar la complejidad (número 10 = 2^10 iteraciones)
- **Estándar de la industria**: Usado por grandes empresas

**Comparación con otras opciones:**
```
❌ Guardar en texto plano     → INSEGURO
❌ Encriptación reversible    → Si acceden a la BD, desencriptan fácilmente
✅ bcrypt con salt            → Estándar de seguridad
✅ Argon2                     → Aún más seguro (alternativa)
```

---

## 3. ¿Cómo se integra Nodemailer con Gmail?

**Pasos de configuración:**

1. **Habilitar autenticación de 2 pasos** en Google Account
2. **Generar contraseña de aplicación** (diferente a la contraseña normal)
3. **Configurar transporte en Node.js:**

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});
```

4. **Enviar email:**
```javascript
await transporter.sendMail({
  from: process.env.GMAIL_USER,
  to: 'usuario@gmail.com',
  subject: 'Bienvenido',
  html: '<h1>Contenido HTML</h1>'
});
```

**¿Por qué no usar contraseña normal de Google?**
- Google lo bloqueará como "actividad sospechosa"
- La contraseña de aplicación está limitada a correo
- Mayor seguridad si se expone el código

---

## 4. ¿Qué es process.env y por qué se utiliza?

**Respuesta:**
```javascript
GMAIL_USER=tu_email@gmail.com    // Guardado en .env
GMAIL_PASSWORD=app_password      // Guardado en .env
```

**Ventajas:**
- ✅ **Seguridad**: No incluir credenciales en el código
- ✅ **Flexibilidad**: Diferentes valores según ambiente (dev, test, prod)
- ✅ **Control**: Acceso restringido a archivos `.env`
- ✅ **Git-safe**: El archivo `.env` está en `.gitignore`

**Sin `process.env` (¡MAL!):**
```javascript
// ❌ NUNCA hagas esto
const emailUser = "mi_email@gmail.com";
const emailPassword = "mi_contraseña";
// Si se sube a GitHub, cualquiera ve tus credenciales
```

---

## 5. ¿Cuál es la diferencia entre autenticación y autorización?

**Autenticación:**
- ¿Eres quien dices ser?
- Username + Contraseña
- Token JWT

**Autorización:**
- ¿Qué permisos tienes?
- Role-based access (Admin, Cliente, Gerente)

**Ejemplo en tu proyecto:**
```javascript
// Autenticación: Verificar email y contraseña
async function login(email, password) {
  const user = await userRepo.findByEmail(email);
  if (!user || !await bcrypt.compare(password, user.password_hash)) {
    throw new Error('Credenciales inválidas');
  }
  return user;
}

// Autorización: Verificar rol
function requireAdmin(req, res, next) {
  if (req.user.role_id !== 1) {
    return res.status(403).json({ error: 'Solo admins' });
  }
  next();
}
```

---

## 6. ¿Cómo validar datos en el backend?

**En el controller:**
```javascript
const { first_name, last_name, email } = req.body;

// 1. Validar que no estén vacíos
if (!first_name || !last_name || !email) {
  throw new ApiError(400, 'MISSING_FIELDS', 'Faltan campos');
}

// 2. Validar formato de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new ApiError(400, 'INVALID_EMAIL', 'Email inválido');
}

// 3. Validar que no exista
const existing = await userService.getUserByEmail(email);
if (existing) {
  throw new ApiError(409, 'EMAIL_EXISTS', 'Email ya registrado');
}
```

**¿Por qué validar en backend Y frontend?**
- Frontend: Mejor UX (feedback inmediato)
- Backend: Seguridad (el cliente puede enviar datos maliciosos)

---

## 7. ¿Qué es un API Error y por qué usarlo?

**Código:**
```javascript
class ApiError extends Error {
  constructor(statusCode, errorCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

// Uso:
throw new ApiError(409, 'EMAIL_EXISTS', 'El email ya está registrado');
```

**Ventajas:**
- **Consistencia**: Todos los errores tienen la misma estructura
- **Información**: statusCode, errorCode, message
- **Frontend-friendly**: El cliente sabe qué hacer con cada error
- **Debugging**: Fácil de identificar qué salió mal

**Response al cliente:**
```json
{
  "success": false,
  "error": "EMAIL_EXISTS",
  "message": "El email ya está registrado",
  "statusCode": 409
}
```

---

## 8. ¿Qué es async/await y por qué se usa?

**Sin async/await (callbacks):**
```javascript
function registerUser(email, callback) {
  database.query('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return callback(err);
    if (user) return callback(new Error('Email existe'));
    
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return callback(err);
      
      database.query('INSERT INTO users...', (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
    });
  });
}
// Spaghetti code (pyramid of doom)
```

**Con async/await:**
```javascript
async function registerUser(email, password) {
  const existing = await database.query('SELECT * FROM users WHERE email = ?', [email]);
  if (existing) throw new Error('Email existe');
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await database.query('INSERT INTO users...', [email, hashedPassword]);
  return result;
}
// Código limpio y legible
```

**Ventajas:**
- ✅ Código más legible
- ✅ Manejo de errores con try/catch
- ✅ Parecido a código síncrono
- ✅ Fácil de debuggear

---

## 9. ¿Cuál es la estructura MVC/MSC de tu proyecto?

**MSC: Model-Service-Controller**

```
routes/auth.routes.js        → Define endpoints
    ↓
controllers/auth.controller.js → Lógica HTTP (req, res)
    ↓
services/user.service.js    → Lógica de negocio
    ↓
repositories/user.repository.js → Acceso a datos (SQL)
    ↓
database                    → MySQL
```

**Flujo del registro:**
```
1. POST /api/auth/register → auth.routes.js
2. auth.controller.register() → Valida req.body
3. userService.createUser() → Lógica de negocio (email unico, hash password)
4. userRepository.create() → Ejecuta INSERT en BD
5. emailService.sendWelcomeEmail() → Envía email
6. res.json() → Respuesta al cliente
```

**¿Por qué separar en capas?**
- **Reutilización**: Services sin HTTP
- **Testing**: Cada capa se puede testear aislada
- **Mantenibilidad**: Cambios en BD no afectan controllers
- **Escalabilidad**: Fácil agregar nuevas features

---

## 10. ¿Cómo manejas los errores en Express?

**Error handling middleware:**
```javascript
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_ERROR';
  
  res.status(statusCode).json({
    success: false,
    error: errorCode,
    message: err.message
  });
});
```

**En controllers:**
```javascript
async function register(req, res, next) {
  try {
    // Lógica que puede fallar
    if (!email) throw new ApiError(400, 'EMAIL_REQUIRED', 'Email requerido');
  } catch (err) {
    next(err); // Pasar al middleware de error
  }
}
```

**Ventajas:**
- ✅ Manejo centralizado
- ✅ No olvidar try/catch en cada ruta
- ✅ Respuestas consistentes
- ✅ Logging automático

---

## 11. ¿Por qué usar .env en lugar de hardcodear valores?

**INCORRECTO (¡MAL!):**
```javascript
const GMAIL_USER = 'mi_email@gmail.com';
const GMAIL_PASSWORD = 'mi_contraseña_secreta';
const DB_HOST = 'localhost';
const API_KEY = 'sk-1234567890abcdef';
```

**Problemas:**
- ❌ Credenciales expuestas en GitHub
- ❌ Imposible cambiar entre dev, test, prod
- ❌ Violación de seguridad

**CORRECTO (¡BIEN!):**
```
.env file:
DB_HOST=localhost
GMAIL_PASSWORD=mi_contraseña_secreta
NODE_ENV=development

JavaScript:
const db_host = process.env.DB_HOST;
const gmail_pass = process.env.GMAIL_PASSWORD;
```

**Configuración para diferentes ambientes:**
```
.env.development   → localhost, debug = true
.env.production    → bd-producción, debug = false
.env.test          → bd-test
```

---

## 12. ¿Qué debería suceder si el email no se envía?

**Respuesta ideal para defensa:**

```javascript
try {
  await emailService.sendWelcomeEmail(firstName, email, tempPassword);
} catch (emailError) {
  // El usuario se registró, pero el email falló
  console.error('Error enviando email:', emailError);
  
  // Opción 1: Enviar respuesta con advertencia
  res.status(201).json({
    success: true,
    warning: 'Usuario registrado pero hubo error al enviar email',
    data: user
  });
  
  // Opción 2: Guardar en cola para reintentar
  await emailQueue.add({
    to: email,
    type: 'WELCOME',
    templateData: { firstName, password }
  });
}
```

**Mejoras para producción:**
- Cola de emails (Bull, RabbitMQ)
- Reintentos automáticos
- Fallback a otro servicio (SendGrid, AWS SES)
- Logs y alertas

---

## 13. ¿Cómo asegurarías este sistema?

**Respuesta para defensa:**

1. **Contraseña:**
   - bcrypt con salt
   - Mínimo 12 caracteres

2. **Email:**
   - Variables de entorno
   - Contraseña de aplicación de Google

3. **Validación:**
   - Datos en backend
   - Regex para email

4. **Rate limiting:**
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutos
     max: 5 // Máximo 5 registros por IP
   });
   router.post('/register', limiter, authController.register);
   ```

5. **HTTPS:**
   - En producción, siempre HTTPS
   - Certificado SSL

6. **JWT:**
   - Tokens con expiración
   - Refresh tokens

7. **2FA:**
   - Código OTP
   - Verificación adicional

---

## 14. ¿Qué ventajas tiene tu estructura vs crear todo en 1 archivo?

**Opción Mala (TODO en 1 archivo):**
```javascript
// app.js (5000+ líneas)
app.post('/register', async (req, res) => {
  // Validaciones
  // Hash password
  // Insertar BD
  // Enviar email
  // Responder
  // CAOS TOTAL
});
```

**Tu estructura:**
```
auth.routes.js      → Rutas
auth.controller.js  → HTTP
user.service.js     → Lógica
user.repository.js  → BD
email.service.js    → Emails
```

**Ventajas de tu estructura:**

| Aspecto | 1 Archivo | Tu Estructura |
|---------|-----------|---------------|
| Legibilidad | ❌ Difícil | ✅ Clara |
| Testing | ❌ Imposible | ✅ Fácil |
| Reutilización | ❌ No | ✅ Sí |
| Mantenibilidad | ❌ Pesadilla | ✅ Ordenado |
| Escalabilidad | ❌ Limitada | ✅ Excelente |
| Debugging | ❌ Complejo | ✅ Rápido |

---

## 15. Preguntas Trampa

### "¿Qué pasa si alguien registra con un email falso?"

**Respuesta:**
```javascript
// Validamos formato
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new ApiError(400, 'INVALID_EMAIL', 'Email inválido');
}

// Pero alguien puede poner fake@fake.com
// Solución: Verificación de email
```

**Solución mejor:**
```javascript
// Enviar enlace de verificación
const verificationToken = generateToken();
await userRepo.update(userId, { verification_token: verificationToken });

// Cliente recibe email con link
// https://app.com/verify?token=abc123

// Solo activa la cuenta si verifica
```

### "¿Qué pasa si 1000 personas se registran simultáneamente?"

**Respuesta:**
- Base de datos maneja múltiples conexiones
- Bcrypt es CPU-intensivo → Usar queue
- Emails pueden tardarse → Usar cola

**Mejora:**
```javascript
// Usar Bull para procesos pesados
const queue = new Queue('emails');

// En controller
await queue.add('send_welcome', {
  email, firstName, tempPassword
});

// En worker separado
queue.process('send_welcome', async (job) => {
  await emailService.sendWelcomeEmail(...);
});
```

---

## 🎯 Resumen para la Defensa

**Puntos clave a destacar:**

1. ✅ **Seguridad**: Bcrypt, process.env, validación
2. ✅ **Estructura**: MSC (Model-Service-Controller)
3. ✅ **Async/Await**: Código limpio y legible
4. ✅ **Error handling**: Middleware centralizado
5. ✅ **Escalabilidad**: Código preparado para crecer
6. ✅ **Buenas prácticas**: Separación de responsabilidades

**Cosas que impresionan en defensa:**
- Conocer por qué se usa bcrypt vs otras opciones
- Entender MSC y sus ventajas
- Hablar de mejoras futuras (rate limiting, 2FA, verificación de email)
- Conocer alternativas (Argon2, sendgrid, aws ses)

