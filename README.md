# 🎱 Billiard Saloon - Sistema de Gestión

Sistema completo de gestión para salón de billar con administración de reservas, sesiones, pagos y reportes.

## 🚀 Características

### Frontend (React + TypeScript + Vite)

- ✅ **Dashboard** con estadísticas en tiempo real
- ✅ **Gestión de Reservas** con aprobación/rechazo de admin
- ✅ **Control de Sesiones Activas** con temporizador en vivo
- ✅ **Reportes y Análisis** de ganancias con exportación a CSV
- ✅ **Panel de Pruebas** CRUD completo para todos los módulos
- ✅ **Autenticación** con JWT y roles de usuario
- ✅ **Interfaz Moderna** con diseño responsivo

### Backend (Node.js + Express + MySQL)

- ✅ **API RESTful** con arquitectura en capas
- ✅ **Autenticación JWT** con middleware de seguridad
- ✅ **Sistema de Roles** (Admin, Cliente, Empleado)
- ✅ **Validaciones** completas en capa de negocio
- ✅ **Manejo de Errores** centralizado
- ✅ **Precios Dinámicos** por horario y día
- ✅ **Cálculo Automático** de costos

## 📋 Prerequisitos

- Node.js 16+
- MySQL 8.0+
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd Billiard-Saloon
```

### 2. Configurar Base de Datos

```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE billiard_saloon;
USE billiard_saloon;

# Importar esquema
source Server/base.sql;

# Importar datos de prueba
source Server/seed_data.sql;
```

### 3. Configurar Backend

```bash
cd Server
npm install

# Crear archivo .env
cat > .env << EOL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=billiard_saloon
DB_PORT=3306
PORT=3000
JWT_SECRET=billiard-secret-key-2024
EOL

# Iniciar servidor
npm start
```

El servidor estará corriendo en `http://localhost:3000`

### 4. Configurar Frontend

```bash
cd Client
npm install

# El .env ya está configurado con:
# VITE_API_URL=http://localhost:3000/api

# Iniciar aplicación
npm run dev
```

La aplicación estará corriendo en `http://localhost:5173`

## 👤 Usuarios de Prueba

```
Admin:
Email: admin@billiard.com
Contraseña: admin123

Cliente:
Email: maria@email.com
Contraseña: admin123
```

## 📱 Uso de la Aplicación

### 1. Login

- Accede con las credenciales de prueba
- El sistema validará tus credenciales y generará un token JWT

### 2. Dashboard

- Vista general con estadísticas:
  - Ingresos totales y del día
  - Sesiones activas
  - Reservas pendientes
  - Mesas disponibles
- Lista de sesiones recientes

### 3. Gestión de Reservas

- Ver todas las reservas (pendientes, confirmadas, canceladas)
- Aprobar o rechazar reservas pendientes
- Ver detalles completos de cada reserva
- Filtrar por estado

### 4. Sesiones Activas

- Ver sesiones en curso con temporizador en vivo
- Iniciar nueva sesión (walk-in o con reserva)
- Finalizar sesión con cálculo automático de costo
- Estimación de ingresos en tiempo real

### 5. Reportes

- Filtrar por rango de fechas
- Ver ingresos diarios y mensuales
- Análisis por método de pago
- Rendimiento por mesa
- Exportar reportes a CSV

### 6. Panel de Pruebas

- CRUD completo para:
  - Usuarios y Roles
  - Categorías de Mesas
  - Mesas de Billar
  - Reservas (con verificador de disponibilidad)
  - Sesiones
  - Pagos
  - Precios Dinámicos

## 🔄 Flujo de Trabajo

### Reserva de Mesa

1. Cliente verifica disponibilidad para fecha y mesa
2. Cliente crea reserva (estado: Pendiente)
3. Admin revisa y aprueba/rechaza la reserva
4. Si se aprueba, cliente puede llegar y iniciar sesión

### Sesión Walk-in

1. Cliente llega sin reserva
2. Admin verifica mesas disponibles
3. Admin inicia sesión tipo "Walk-in"
4. Sistema valida que no haya reservas en las próximas 2 horas
5. Mesa se marca como ocupada

### Sesión con Reserva

1. Cliente llega con reserva confirmada
2. Admin inicia sesión tipo "Reserva"
3. Sistema valida:
   - Reserva confirmada
   - Dentro de ventana de 30 minutos
   - Mesa disponible
4. Mesa se marca como ocupada

### Finalizar Sesión

1. Admin finaliza la sesión
2. Sistema calcula:
   - Tiempo transcurrido (redondeado a hora completa)
   - Precio base por categoría de mesa
   - Precio final = horas × precio_base
3. Mesa vuelve a estado disponible
4. Se genera el total a pagar

### Registrar Pago

1. Admin selecciona la sesión cerrada
2. Ingresa monto y método de pago
3. Sistema registra el pago
4. Actualiza estadísticas de reportes

## 🗂️ Estructura del Proyecto

```
Billiard-Saloon/
├── Client/                    # Frontend React
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── context/          # Context API (Auth)
│   │   ├── pages/            # Páginas principales
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ReservationsManagement.tsx
│   │   │   ├── ActiveSessions.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── LoginPage.tsx
│   │   ├── services/         # API cliente (axios)
│   │   └── App.tsx
│   └── package.json
│
└── Server/                    # Backend Express
    ├── src/
    │   ├── controllers/      # Controladores de rutas
    │   ├── services/         # Lógica de negocio
    │   ├── repositories/     # Acceso a datos
    │   ├── routes/           # Definición de rutas
    │   ├── middlewares/      # Middlewares (auth, errors)
    │   ├── db/               # Configuración DB
    │   └── utils/            # Utilidades
    ├── base.sql              # Esquema de base de datos
    ├── seed_data.sql         # Datos de prueba
    ├── index.js              # Punto de entrada
    └── package.json
```

## 🔐 API Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual (requiere token)

### Reservas

- `GET /api/reservations` - Listar reservas
- `GET /api/reservations/:id` - Obtener reserva
- `POST /api/reservations` - Crear reserva
- `PUT /api/reservations/:id/approve` - Aprobar reserva
- `PUT /api/reservations/:id/reject` - Rechazar reserva
- `DELETE /api/reservations/:id` - Cancelar reserva
- `GET /api/reservations/available-slots/:tableId/:date` - Ver disponibilidad

### Sesiones

- `GET /api/sessions` - Listar sesiones
- `POST /api/sessions/start` - Iniciar sesión
- `PUT /api/sessions/:id/end` - Finalizar sesión

### Otros módulos

- `/api/users` - Usuarios
- `/api/roles` - Roles
- `/api/tables` - Mesas
- `/api/table-categories` - Categorías
- `/api/payments` - Pagos
- `/api/dynamic-pricing` - Precios dinámicos

## 🎨 Tecnologías Utilizadas

### Frontend

- React 19.2.0
- TypeScript
- Vite 7.2.4
- Axios
- CSS3 (diseño personalizado)

### Backend

- Node.js
- Express 5.1.0
- MySQL2 3.6.0
- bcrypt (encriptación)
- jsonwebtoken (autenticación)
- CORS

## 📊 Características Avanzadas

### Validaciones de Negocio

- ✅ Mínimo 1 hora de reserva
- ✅ Horario de operación: 8 AM - 11 PM
- ✅ Buffer de 2 horas para walk-ins
- ✅ Ventana de 30 minutos para check-in de reservas
- ✅ Detección de conflictos de horarios
- ✅ Validación de disponibilidad de mesas

### Cálculo de Precios

- ✅ Precio base por categoría de mesa
- ✅ Redondeo hacia arriba a hora completa
- ✅ Sistema de precios dinámicos (futuro)

### Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación JWT
- ✅ Middleware de autorización
- ✅ Validación de inputs
- ✅ Manejo seguro de errores

## 🐛 Troubleshooting

### Error de conexión a base de datos

```bash
# Verificar que MySQL está corriendo
sudo systemctl status mysql

# Verificar credenciales en .env
```

### Error CORS

```bash
# Verificar que CORS está habilitado en Server/index.js
# Verificar URL del API en Client/.env
```

### Error de módulos no encontrados

```bash
# Reinstalar dependencias
cd Server && npm install
cd Client && npm install
```

## 📝 Notas Importantes

- El hash de contraseña en seed_data.sql es para "admin123"
- Los temporizadores se actualizan cada segundo en sesiones activas
- Los datos del dashboard se refrescan cada 30 segundos
- Los reportes se pueden exportar a CSV
- El sistema valida todas las reglas de negocio en el backend

## 🚀 Próximas Mejoras

- [ ] Socket.io para actualizaciones en tiempo real
- [ ] Subida de fotos (comprobantes de pago, IDs)
- [ ] Aplicación de precios dinámicos en cálculos
- [ ] Notificaciones push
- [ ] Historial de sesiones por cliente
- [ ] Sistema de fidelización
- [ ] Reportes gráficos con charts
- [ ] Backup automático de base de datos

## 👨‍💻 Desarrollo

```bash
# Backend con auto-reload
cd Server
npm run dev  # requiere nodemon

# Frontend
cd Client
npm run dev
```

## 📄 Licencia

Proyecto educativo - Uso libre

---

**Desarrollado con ❤️ para gestión eficiente de salones de billar** 🎱
