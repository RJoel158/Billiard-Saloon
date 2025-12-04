# 📊 Resumen Visual de tu Backend

## Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador)                  │
│              Envía petición HTTP al servidor            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   SERVIDOR EXPRESS                      │
│  ┌─────────────────────────────────────────────────────┐│
│  │ MIDDLEWARE (procesa globalmente)                    ││
│  │ • express.json() - Convierte body a JSON            ││
│  │ • errorHandler - Maneja errores                     ││
│  └─────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │ ROUTES (Mapea URLs a Controllers)                   ││
│  │ GET    /api/users    → getAll()                     ││
│  │ POST   /api/users    → create()                     ││
│  │ PUT    /api/users/:id → update()                    ││
│  │ DELETE /api/users/:id → delete()                    ││
│  └──────────────┬────────────────────────────────────┬─┘│
│                 │                                    │   │
│                 ↓                                    ↓   │
│  ┌──────────────────────────┐  ┌──────────────────────┐ │
│  │  CONTROLLERS             │  │   CONTROLLERS        │ │
│  │  • Recibe petición       │  │   (otros recursos)   │ │
│  │  • req, res, next        │  │                      │ │
│  │  • Llama service         │  │  tableController     │ │
│  │  • Devuelve respuesta    │  │  sessionController   │ │
│  └──────────────┬───────────┘  └──────────────┬───────┘ │
│                 │                              │         │
│                 ↓                              ↓         │
│  ┌──────────────────────────┐  ┌──────────────────────┐ │
│  │  SERVICES                │  │   SERVICES           │ │
│  │  • Valida datos          │  │   (lógica)           │ │
│  │  • Reglas de negocio     │  │                      │ │
│  │  • Lanza errores         │  │  tableService        │ │
│  │  • Llama repository      │  │  sessionService      │ │
│  └──────────────┬───────────┘  └──────────────┬───────┘ │
│                 │                              │         │
│                 ↓                              ↓         │
│  ┌──────────────────────────┐  ┌──────────────────────┐ │
│  │  REPOSITORIES            │  │   REPOSITORIES       │ │
│  │  • SQL queries           │  │   (acceso a datos)   │ │
│  │  • Parámetros (?)        │  │                      │ │
│  │  • Previene SQL Inject   │  │  tableRepository     │ │
│  │  • Llama db.query()      │  │  sessionRepository   │ │
│  └──────────────┬───────────┘  └──────────────┬───────┘ │
│                 │                              │         │
│                 └──────────┬───────────────────┘         │
│                            ↓                             │
│  ┌─────────────────────────────────────────────────────┐│
│  │         DATABASE (MySQL)                           ││
│  │ db.query('SELECT * FROM users WHERE id = ?', [id]) ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                         ↑
                         │ Respuesta
                         │
                    res.json({ data })
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador)                  │
│              Recibe JSON con los datos                  │
└─────────────────────────────────────────────────────────┘
```

---

## Flujo de una Petición Paso a Paso

### Petición: POST /api/users

```
1️⃣  CLIENTE
    POST http://localhost:3000/api/users
    Headers: { "Content-Type": "application/json" }
    Body: {
      "first_name": "Juan",
      "email": "juan@example.com"
    }

2️⃣  MIDDLEWARE (express.json())
    Convierte body string en objeto JavaScript:
    req.body = {
      first_name: "Juan",
      email: "juan@example.com"
    }

3️⃣  ROUTER ENCUENTRA LA RUTA
    user.routes.js:
    router.post('/', controller.create)
    ✓ Detecta: POST en /api/users

4️⃣  CONTROLLER RECIBE
    user.controller.js:
    async function create(req, res, next) {
      const payload = req.body;
      const user = await userService.createUser(payload);
      res.status(201).json({ success: true, data: user });
    }

5️⃣  SERVICE VALIDA Y PROCESA
    user.service.js:
    async function createUser(data) {
      // Validación 1: Email existe
      const existing = await userRepo.findByEmail(data.email);
      if (existing) {
        throw new ApiError(409, 'EMAIL_EXISTS', '...');
      }
      
      // Si todo bien, crear
      const user = await userRepo.create(data);
      return user;
    }

6️⃣  REPOSITORY ACCEDE A BD
    user.repository.js:
    async function create(user) {
      await db.query(
        'INSERT INTO users (role_id, first_name, email, ...) VALUES (?, ?, ?, ...)',
        [2, user.first_name, user.email, ...]
      );
      return { id: 1, first_name: "Juan", email: "juan@example.com" };
    }

7️⃣  BASE DE DATOS
    MySQL ejecuta:
    INSERT INTO users (role_id, first_name, email, created_at)
    VALUES (2, 'Juan', 'juan@example.com', NOW());
    
    Devuelve: { insertId: 1, affectedRows: 1 }

8️⃣  RESPUESTA SUBE
    Repository → Service → Controller
    
    Cada capa devuelve el resultado

9️⃣  CONTROLLER RESPONDE
    res.status(201).json({
      success: true,
      data: {
        id: 1,
        first_name: "Juan",
        email: "juan@example.com"
      }
    })

🔟 CLIENTE RECIBE
    Status: 201 Created
    Body: {
      "success": true,
      "data": {
        "id": 1,
        "first_name": "Juan",
        "email": "juan@example.com"
      }
    }
```

---

## Archivos Clave

### Punto de Entrada
```
Server/index.js
├─ Crea aplicación Express
├─ Carga middlewares
├─ Monta rutas
└─ Inicia servidor en puerto 3000
```

### Rutas
```
Server/src/routes/
├─ user.routes.js         → GET, POST, PUT, DELETE /api/users
├─ table-category.routes.js
├─ billiard-table.routes.js
├─ session.routes.js
├─ reservation.routes.js
├─ payment.routes.js
├─ dynamic-pricing.routes.js
└─ roles.routes.js
```

### Controladores
```
Server/src/controllers/
├─ user.controller.js      → Recibe petición, llama service
├─ ...controller.js        → Mismo patrón
└─ (tienen funciones: getAll, getById, create, update, delete)
```

### Servicios
```
Server/src/services/
├─ user.service.js         → Valida, aplica lógica, llama repo
├─ ...service.js           → Mismo patrón
└─ (lógica de negocio aquí)
```

### Repositorios
```
Server/src/repositories/
├─ user.repository.js      → Queries SQL
├─ ...repository.js        → Mismo patrón
└─ (acceso a datos aquí)
```

### Base de Datos
```
Server/src/db/
├─ db.js                   → Conexión MySQL, método query()
└─ schema.js               → Detecta columnas de tablas
```

### Middlewares
```
Server/src/middlewares/
├─ errorHandler.js         → Captura y maneja errores
└─ apiError.js             → Clase de error personalizado
```

---

## Métodos HTTP y Acciones

```
GET /api/users                    → Obtener todos (getAll)
GET /api/users/1                  → Obtener uno (getById)
POST /api/users                   → Crear (create)
PUT /api/users/1                  → Actualizar (update)
DELETE /api/users/1               → Eliminar (delete)

GET /api/users?page=1&limit=10    → Con query params
GET /api/users/1/sessions         → Datos anidados
```

---

## Códigos HTTP Comunes

```
✅ 200 OK              Solicitud exitosa
✅ 201 Created         Recurso creado
✅ 204 No Content      Eliminado exitosamente

❌ 400 Bad Request     Datos inválidos
❌ 401 Unauthorized    No autenticado
❌ 404 Not Found       Recurso no existe
❌ 409 Conflict        Email duplicado, etc
❌ 500 Server Error    Error interno
```

---

## Componentes en tu Proyecto

### 1. Usuarios
```
Routes:  GET /api/users, POST, PUT, DELETE
Service: Valida email único
Repo:    Queries de usuarios
BD:      tabla users
```

### 2. Mesas de Billar
```
Routes:  GET /api/tables, POST, PUT, DELETE
Service: Valida categoría existe
Repo:    Queries de mesas
BD:      tabla billiard_tables
```

### 3. Sesiones
```
Routes:  GET /api/sessions, POST, PUT (close), DELETE
Service: Calcula costo, valida duración
Repo:    Queries de sesiones
BD:      tabla sessions
```

### 4. Reservaciones
```
Routes:  GET /api/reservations, POST, PUT (cancel), DELETE
Service: Valida conflictos de horario
Repo:    Queries de reservaciones
BD:      tabla reservations
```

### 5. Pagos
```
Routes:  GET /api/payments, POST
Service: Valida sesión existe
Repo:    Queries de pagos
BD:      tabla payments
```

### 6. Precios Dinámicos
```
Routes:  GET /api/dynamic-pricing, POST, PUT, DELETE
Service: Calcula precios según reglas
Repo:    Queries de pricing
BD:      tabla dynamic_pricing
```

---

## Error Handling Flow

```
                Petición HTTP
                     ↓
          Routes → Controller → Service
                                    ↓
                    throw new ApiError(404, 'USER_NOT_FOUND', '...')
                                    ↓
                           Se propaga el error
                                    ↓
                    Controller catch: next(err)
                                    ↓
                          Middleware errorHandler
                                    ↓
          res.status(404).json({ error: 'USER_NOT_FOUND' })
                                    ↓
                        Respuesta al cliente
```

---

## Validaciones en Service

```javascript
async function createUser(data) {
  // Validación 1: Campos requeridos
  if (!data.email) throw new ApiError(400, 'EMAIL_REQUIRED', '...');
  
  // Validación 2: Email único
  if (await userRepo.findByEmail(data.email)) {
    throw new ApiError(409, 'EMAIL_EXISTS', '...');
  }
  
  // Validación 3: Email válido
  if (!data.email.includes('@')) {
    throw new ApiError(400, 'INVALID_EMAIL', '...');
  }
  
  // Si todo bien
  return await userRepo.create(data);
}
```

---

## Seguridad

### SQL Injection Prevention
```javascript
❌ VULNERABLE:
db.query(`SELECT * FROM users WHERE email = '${email}'`);

✅ SEGURO:
db.query('SELECT * FROM users WHERE email = ?', [email]);
```

### Parámetros Escapados
```
Los ? se reemplazan por valores escapados:
? → 'value' (si es string)
? → 123 (si es número)

Imposible inyectar código SQL
```

---

## Checklist para Defensa

- [ ] Entiendo qué es Express
- [ ] Sé explicar la arquitectura (Routes → Controllers → Services → Repos)
- [ ] Puedo dibujar el flujo completo de una petición
- [ ] Entiendo async/await
- [ ] Sé por qué separamos en capas
- [ ] Entiendo req.body, req.params, req.query
- [ ] Sé qué es un middleware
- [ ] Conozco los códigos HTTP principales
- [ ] Entiendo SQL injection y cómo prevenirla
- [ ] Puedo explicar error handling
- [ ] Sé cómo validar datos
- [ ] Entiendo las rutas CRUD

---

## Frases Memorables

> "Express es un framework minimalista que actúa como director de orquesta de las peticiones HTTP"

> "Separamos en capas para que cada una tenga una responsabilidad específica y el código sea mantenible"

> "El controller es solo un intermediario entre HTTP y la lógica"

> "Todo el SQL va en el repository, aquí solo usamos parámetros para prevenir inyecciones"

> "Async/await permite que el servidor no se bloquee esperando la BD"

> "El error handler está al final para capturar todos los errores globalmente"

> "Usamos ? en SQL porque reemplazan valores escapados, imposible SQL injection"

---

## Comandos Útiles

```bash
# Iniciar servidor en modo desarrollo (recarga automática)
npm run dev

# Iniciar servidor en producción
npm start

# Instalar dependencias
npm install

# Ver las rutas que espera
# (Están en index.js: app.use('/api/users', userRoutes))
```

---

## Test Mental Rápido

**Pregunta 1:** ¿Qué archivo contiene la lógica SQL?
**Respuesta:** Repository (ej: user.repository.js)

**Pregunta 2:** ¿Dónde va la validación?
**Respuesta:** Service (ej: user.service.js)

**Pregunta 3:** ¿Qué devuelve `res.status(201).json(...)`?
**Respuesta:** JSON con código HTTP 201 (Created)

**Pregunta 4:** ¿Para qué sirve `?` en SQL?
**Respuesta:** Para escapar parámetros y prevenir SQL Injection

**Pregunta 5:** ¿Qué es `async/await`?
**Respuesta:** Para manejar operaciones asincrónicas sin bloquear

---

¡Ya estás listo para defender tu proyecto! 🎓🚀
