# 🎱 Billiard Saloon - Sistema de Gestión de Salón de Billar

Sistema completo para administrar un salón de billar con tarifas dinámicas, gestión de mesas, reservas, sesiones de juego y pagos.

## 🚀 Características Principales

### Backend (Server)

- ✅ **Autenticación JWT** completa con registro y login
- ✅ **Gestión de Usuarios** con roles (Admin/Cliente)
- ✅ **Gestión de Mesas** con categorías y estados (disponible/ocupada/mantenimiento)
- ✅ **Tarifas Dinámicas** según:
  - Horas pico
  - Fin de semana
  - Alta demanda
  - Promociones
  - Eventos especiales
- ✅ **Sesiones de Juego** con cálculo automático de costos
- ✅ **Sistema de Reservas** con validación de disponibilidad
- ✅ **Gestión de Pagos** con múltiples métodos
- ✅ **Dashboard de Estadísticas** con:
  - Sesiones activas
  - Ingresos diarios/mensuales
  - Uso de mesas
  - Análisis de horas pico

### Frontend (Client)

- ✅ **Interfaz moderna** con React + TypeScript + Vite
- ✅ **Autenticación** con manejo de sesiones
- ✅ **Dashboard de Admin** con estadísticas en tiempo real
- ✅ **Dashboard de Cliente** para gestionar reservas
- ✅ **Componentes UI reutilizables**
- ✅ **Diseño responsivo**

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- MySQL (v5.7 o superior)
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd Billiard-Saloon
```

### 2. Configurar el Backend

```bash
cd Server
npm install
```

Crear archivo `.env` basado en `.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=billiard_db
DB_PORT=3306
JWT_SECRET=tu-secret-key-muy-segura
JWT_EXPIRES_IN=7d
```

Importar el esquema de base de datos:

```bash
mysql -u tu_usuario -p billiard_db < base.sql
```

### 3. Configurar el Frontend

```bash
cd ../Client
npm install
```

Crear archivo `.env` basado en `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
```

## 🚀 Ejecución

### Modo Desarrollo

**Terminal 1 - Backend:**

```bash
cd Server
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd Client
npm run dev
```

Acceder a:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Modo Producción

**Backend:**

```bash
cd Server
npm start
```

**Frontend:**

```bash
cd Client
npm run build
npm run preview
```

## 📊 Estructura del Proyecto

```
Billiard-Saloon/
├── Server/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/           # Configuración
│   │   ├── controllers/      # Controladores
│   │   ├── db/              # Base de datos
│   │   ├── middlewares/     # Middlewares (auth, errors)
│   │   ├── repositories/    # Acceso a datos
│   │   ├── routes/          # Rutas API
│   │   ├── services/        # Lógica de negocio
│   │   └── utils/           # Utilidades
│   ├── index.js             # Punto de entrada
│   └── package.json
│
├── Client/                   # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   └── ui/         # Componentes UI reutilizables
│   │   ├── contexts/       # Contextos (Auth, etc.)
│   │   ├── pages/          # Páginas principales
│   │   ├── types/          # Tipos TypeScript
│   │   ├── utils/          # Utilidades
│   │   ├── App.tsx         # Componente principal
│   │   └── main.tsx        # Punto de entrada
│   └── package.json
│
└── base.sql                 # Esquema de base de datos
```

## 🔐 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener usuario actual (requiere auth)

### Usuarios

- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Mesas de Billar

- `GET /api/tables` - Listar mesas
- `POST /api/tables` - Crear mesa
- `PUT /api/tables/:id` - Actualizar mesa
- `DELETE /api/tables/:id` - Eliminar mesa

### Sesiones

- `GET /api/sessions` - Listar sesiones
- `GET /api/sessions/active` - Sesiones activas
- `POST /api/sessions` - Crear sesión
- `POST /api/sessions/:id/close` - Cerrar sesión (calcula precio)
- `DELETE /api/sessions/:id` - Cancelar sesión

### Reservas

- `GET /api/reservations` - Listar reservas
- `GET /api/reservations/pending` - Reservas pendientes
- `GET /api/reservations/my-reservations` - Mis reservas (requiere auth)
- `POST /api/reservations` - Crear reserva
- `POST /api/reservations/:id/confirm` - Confirmar reserva
- `POST /api/reservations/:id/cancel` - Cancelar reserva

### Dashboard (Admin)

- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/revenue` - Reporte de ingresos
- `GET /api/dashboard/table-usage` - Uso de mesas
- `GET /api/dashboard/payment-methods` - Métodos de pago
- `GET /api/dashboard/peak-hours` - Análisis de horas pico

## 👥 Roles de Usuario

### Admin (role_id: 1)

- Acceso completo al sistema
- Gestión de mesas, categorías y tarifas
- Validación de reservas
- Visualización de estadísticas
- Gestión de usuarios

### Cliente (role_id: 2)

- Crear y gestionar sus reservas
- Ver historial de sesiones
- Actualizar perfil

## 🎨 Componentes UI Disponibles

- **Button** - Botones con variantes (primary, secondary, danger, success)
- **Card** - Tarjetas con título y cuerpo
- **Input** - Inputs con label y manejo de errores
- **Modal** - Modales para diálogos

## 🔧 Tecnologías Utilizadas

### Backend

- Node.js + Express
- MySQL2
- JWT (jsonwebtoken)
- bcryptjs (hash de contraseñas)
- dotenv (variables de entorno)

### Frontend

- React 19
- TypeScript
- Vite
- React Router DOM
- Axios
- date-fns

## 📝 Próximas Mejoras

- [ ] Gestión completa de mesas desde el dashboard admin
- [ ] Vista de sesiones activas en tiempo real
- [ ] Sistema de notificaciones
- [ ] Reportes en PDF
- [ ] Integración con pasarelas de pago
- [ ] App móvil con React Native

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

Desarrollado con ❤️ para la gestión eficiente de salones de billar.
