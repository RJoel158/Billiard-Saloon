# 🎱 Billar Club - Frontend

Sistema de gestión y reservas para salón de billar con tres tipos de interfaces de usuario.

## 📋 Estructura del Proyecto

```
Client/src/
├── components/
│   ├── Admin/          # Componentes para Admin/Employee
│   │   └── Dashboard.tsx
│   ├── Client/         # Componentes para Cliente
│   │   ├── Inicio.tsx
│   │   ├── Reservas.tsx
│   │   ├── Historial.tsx
│   │   └── Perfil.tsx
│   ├── Login.tsx
│   └── Register.tsx
├── context/
│   └── AuthContext.tsx # Manejo de autenticación
├── layouts/
│   ├── AdminLayout/    # Layout para Admin/Employee
│   └── ClientLayout/   # Layout para Cliente
├── pages/
│   └── AuthPage.tsx
├── types/
│   ├── auth.types.ts
│   └── billiard.types.ts
└── App.tsx
```

## 🚀 Características Implementadas

### ✅ Sistema de Autenticación

- Login con email y contraseña
- Registro de nuevos usuarios
- Context API para manejo de estado global
- Persistencia de sesión en localStorage
- Roles de usuario: Admin, Employee, Client

### ✅ Interfaz Admin/Employee

**Vistas disponibles:**

- 📊 Dashboard - Estadísticas y resumen
- 🎯 Mesas - Gestión de mesas (En desarrollo)
- ⏱️ Sesiones - Control de sesiones (En desarrollo)
- 💳 Pagos - Registro de pagos (En desarrollo)
- 📅 Reservas - Gestión de reservas (En desarrollo)
- 📈 Ganancias - Reportes financieros (Solo Admin)

**Características:**

- Sidebar de navegación
- Restricciones por rol (Employee no ve Ganancias)
- Dashboard con métricas en tiempo real
- Info de usuario y logout

### ✅ Interfaz Cliente

**Vistas disponibles:**

- 🏠 Inicio - Landing page con categorías de mesas
- 📅 Mis Reservas - Gestión de reservas personales
- 🕐 Historial - Registro de sesiones pasadas
- 👤 Mi Perfil - Información personal

**Características:**

- Header responsive con navegación
- Cards informativos
- Diseño moderno y limpio
- Mobile-friendly

## 🎨 Roles y Permisos

### 👑 Admin (role_id: 1)

- Acceso completo a todas las vistas
- Puede ver ganancias y reportes financieros
- Gestión total del sistema

### 👨‍💼 Employee (role_id: 3)

- Acceso a Dashboard, Mesas, Sesiones, Pagos, Reservas
- **NO** puede ver Ganancias
- Operaciones del día a día

### 👤 Client (role_id: 2)

- Interfaz diferente (ClientLayout)
- Puede hacer reservas
- Ver su historial
- Gestionar su perfil

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Build para producción
npm run build
```

## 📦 Dependencias Principales

- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **lucide-react** - Librería de iconos
- **Context API** - Manejo de estado global

## 🌐 Configuración del API

El frontend se conecta al backend en:

```
http://localhost:3000/api
```

### Endpoints usados:

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar nuevo usuario

## 🎯 Próximos Pasos

### Componentes por implementar:

1. **Admin:**

   - Vista de Mesas con CRUD
   - Vista de Sesiones con control de tiempo
   - Vista de Pagos con métodos de pago
   - Vista de Reservas con calendario
   - Vista de Ganancias con gráficos

2. **Cliente:**

   - Formulario de nueva reserva
   - Calendario de disponibilidad
   - Detalle de reservas
   - Historial detallado con filtros
   - Edición de perfil

3. **Generales:**
   - Conectar con API real
   - Manejo de errores mejorado
   - Loading states
   - Notificaciones/toasts
   - Validaciones de formularios
   - Paginación en listas
   - Búsqueda y filtros

## 📱 Responsive Design

Todas las vistas están optimizadas para:

- 📱 Mobile (< 768px)
- 💻 Tablet (768px - 1024px)
- 🖥️ Desktop (> 1024px)

## 🎨 Paleta de Colores

```css
Primario: #2563eb (blue-600)
Secundario: #10b981 (green-600)
Acento: #f59e0b (yellow-600)
Peligro: #ef4444 (red-600)
Fondo: #f9fafb (gray-50)
Texto: #111827 (gray-900)
```

## 📝 Uso del Sistema

### Como Admin/Employee:

1. Login con credenciales
2. Acceso al Dashboard con métricas
3. Navegación por sidebar
4. Logout desde el sidebar

### Como Cliente:

1. Login o registro
2. Vista de bienvenida con opciones
3. Navegación por header
4. Hacer reservas
5. Ver historial y perfil

## 🔐 Seguridad

- Tokens JWT almacenados en localStorage
- Validación de roles en el frontend
- Protección de rutas según rol
- Logout limpia completamente la sesión

## 📖 Documentación Adicional

- **Backend:** Ver `/Server/PAGINATION.md` para API de paginación
- **Ejemplo UI:** Ver `/Ejmplo UI/` para referencia de diseño
