# Nuevas Funcionalidades - Sistema de Sesiones

## Resumen de Implementación

Se ha implementado un sistema completo para gestionar sesiones sin reserva (walk-in) con las siguientes características:

### Backend

#### 1. **Sistema de Multas/Penalidades**
- **Tabla**: `penalties` (creada en migración)
- **Endpoints**:
  - `GET /api/penalties` - Listar todas las multas
  - `GET /api/penalties/:id` - Obtener multa por ID
  - `GET /api/penalties/session/:sessionId` - Multas de una sesión
  - `POST /api/penalties` - Crear multa
  - `DELETE /api/penalties/:id` - Eliminar multa

#### 2. **Comprobantes de Pago**
- **Campo añadido**: `receipt_image` en tabla `payments`
- Almacena imagen en base64 (para producción considerar servicio de almacenamiento)

#### 3. **Búsqueda de Usuarios**
- **Endpoint**: `GET /api/users/search?q=nombre`
- Busca por nombre, apellido o nombre completo

#### 4. **Cierre de Sesión Mejorado**
- Calcula automáticamente multas aplicadas
- Retorna: sesión cerrada, pricing, penalties, totalPenalties, finalCost

### Frontend

#### 1. **CreateSession Component** (`/admin/sessions/new`)
**Proceso en 3 pasos:**

1. **Paso 1 - Búsqueda/Registro de Cliente:**
   - Buscador de clientes por nombre
   - Opción para registrar nuevos clientes si no existen
   - Modal de registro rápido

2. **Paso 2 - Selección de Mesa:**
   - Grid visual de mesas disponibles
   - Solo muestra mesas con status=1 (disponibles)

3. **Paso 3 - Confirmación:**
   - Resumen de cliente, mesa, hora inicio
   - Crea sesión con tipo=2 (walk-in)
   - Hora de inicio automática desde sistema

#### 2. **CloseSessionModal Component**
**Funcionalidades:**

- **Multas/Penalidades:**
  - Botón para agregar multas
  - Formulario con monto y razón
  - Lista de multas agregadas con opción de eliminar
  - Suma automática de multas al total

- **Método de Pago:**
  - Radio buttons: Efectivo, Tarjeta, QR
  - Selección visual con estilos

- **Comprobante de Pago:**
  - Upload de imagen (obligatorio)
  - Preview de la imagen
  - Conversión a base64 para envío

- **Resumen de Costos:**
  - Subtotal de sesión (calculado con pricing dinámico)
  - Total de multas
  - Total final a pagar

#### 3. **ActiveSessions - Actualizado**
- Botón "+ Nueva Sesión" que navega a `/admin/sessions/new`
- Uso del nuevo CloseSessionModal al cerrar sesiones
- Mantiene actualización automática cada 30 segundos

### Flujo de Trabajo Completo

**Crear Sesión Sin Reserva:**
1. Admin hace clic en "+ Nueva Sesión"
2. Busca al cliente por nombre o registra uno nuevo
3. Selecciona mesa disponible
4. Confirma y sesión inicia automáticamente

**Cerrar Sesión:**
1. Desde "Sesiones Activas", clic en "Cerrar Sesión"
2. Modal muestra resumen de tiempo
3. Admin puede agregar multas (daños, objetos perdidos, etc.)
4. Selecciona método de pago
5. Sube foto del comprobante de pago (OBLIGATORIO)
6. Sistema calcula: costo base + multas = total
7. Crea registro de pago con comprobante
8. Cierra sesión y libera mesa

### Archivos Creados/Modificados

**Backend:**
- `Server/migrations/add_penalties_and_receipts.sql`
- `Server/src/repositories/penalty.repository.js`
- `Server/src/services/penalty.service.js`
- `Server/src/controllers/penalty.controller.js`
- `Server/src/routes/penalty.routes.js`
- `Server/src/repositories/user.repository.js` (añadido searchByName)
- `Server/src/repositories/payment.repository.js` (añadido receipt_image)
- `Server/src/services/session.service.js` (calcula multas en cierre)

**Frontend:**
- `Client/src/pages/CreateSession.tsx`
- `Client/src/pages/CreateSession.css`
- `Client/src/components/CloseSessionModal.tsx`
- `Client/src/components/CloseSessionModal.css`
- `Client/src/pages/ActiveSessions.tsx` (actualizado)
- `Client/src/types/index.ts` (añadido Penalty)
- `Client/src/App.tsx` (ruta `/admin/sessions/new`)

### Próximos Pasos (Mejoras Sugeridas)

1. **Almacenamiento de Imágenes:**
   - Integrar servicio de storage (AWS S3, Cloudinary, etc.)
   - Guardar solo URL en base de datos

2. **Validaciones:**
   - Límite de tamaño para imágenes
   - Formatos permitidos de imagen
   - Compresión automática de imágenes

3. **Reportes:**
   - Dashboard de multas aplicadas
   - Historial de pagos con comprobantes
   - Búsqueda de sesiones por cliente

4. **Notificaciones:**
   - Email/SMS al cliente con resumen de sesión
   - Notificación a admin si multa excede cierto monto

## Ejecución de Migración

Para añadir las nuevas tablas/columnas:

```bash
cd Server
mysql -u root -p billar_db < migrations/add_penalties_and_receipts.sql
```

O ejecutar manualmente las queries del archivo de migración.
