# Sistema de Configuración del Negocio

## Descripción General

El sistema de configuración permite establecer parámetros operativos del negocio de billar que se aplican automáticamente en todo el sistema. Todas las validaciones, cálculos y restricciones se basan en estos valores.

## Ubicación del Módulo

**Frontend**: `Client/src/components/Admin/SystemSettings.tsx`  
**Backend**: `Server/src/repositories/system-settings.repository.js`

## Parámetros de Configuración

### 1. Horario de Atención (Schedule)

| Parámetro       | Tipo         | Descripción                     | Valor por Defecto |
| --------------- | ------------ | ------------------------------- | ----------------- |
| `opening_time`  | time         | Hora de apertura del negocio    | 09:00             |
| `closing_time`  | time         | Hora de cierre del negocio      | 23:00             |
| `business_days` | json (array) | Días laborables (1=Lun...7=Dom) | [1,2,3,4,5,6,7]   |

**Aplicación**:

- Las reservas solo pueden crearse dentro del horario de atención
- Las reservas solo se permiten en días laborables
- Validación en frontend (`Reservations.tsx`) y backend (`validateReservation` middleware)

### 2. Reservas (Reservations)

| Parámetro                     | Tipo   | Descripción                                | Valor por Defecto |
| ----------------------------- | ------ | ------------------------------------------ | ----------------- |
| `min_reservation_duration`    | number | Duración mínima en minutos                 | 30                |
| `max_reservation_duration`    | number | Duración máxima en minutos                 | 240 (4h)          |
| `min_advance_hours`           | number | Anticipación mínima en horas               | 2                 |
| `max_advance_days`            | number | Anticipación máxima en días                | 30                |
| `max_concurrent_reservations` | number | Máximo de reservas simultáneas por usuario | 3                 |
| `grace_period_minutes`        | number | Tiempo de gracia para llegadas tardías     | 15                |

**Aplicación**:

- Control de duración en formulario de reservas (atributos `min` y `max`)
- Validación de anticipación al crear/editar reservas
- Límite de reservas concurrentes (a implementar en backend)

### 3. Precios e Impuestos (Pricing)

| Parámetro                        | Tipo             | Descripción                         | Valor por Defecto |
| -------------------------------- | ---------------- | ----------------------------------- | ----------------- |
| `tax_rate`                       | number (decimal) | Tasa de impuestos (13% = 0.13)      | 0.13              |
| `late_cancellation_penalty_rate` | number           | Penalización por cancelación tardía | 0.50 (50%)        |
| `no_show_penalty_rate`           | number           | Penalización por no presentación    | 1.00 (100%)       |

**Aplicación**:

- **Impuestos**: Se calculan automáticamente al finalizar sesiones
  - Frontend: `ActiveSessions.tsx` muestra desglose de impuestos
  - Backend: `session.service.js` función `finalizeSession()` aplica `tax_rate`
- **Penalizaciones**: Botones preconfigurados en modal de finalización
  - Cancelación tardía: 50% del costo base
  - No Show: 100% del costo base

### 4. Notificaciones (Business)

| Parámetro                     | Tipo    | Descripción                            | Valor por Defecto       |
| ----------------------------- | ------- | -------------------------------------- | ----------------------- |
| `enable_notifications`        | boolean | Activar notificaciones del sistema     | true                    |
| `enable_email_notifications`  | boolean | Enviar notificaciones por email        | false                   |
| `auto_cancel_no_show_minutes` | number  | Minutos para auto-cancelar por no show | 30                      |
| `business_name`               | string  | Nombre del negocio                     | Billiard Saloon         |
| `business_phone`              | string  | Teléfono de contacto                   | +591 77777777           |
| `business_email`              | string  | Email de contacto                      | info@billiardsaloon.com |

**Aplicación**:

- Auto-cancelación de reservas sin presentación (a implementar)
- Datos de contacto en emails y notificaciones

## Integración en el Sistema

### Frontend

#### Hook: `useSystemSettings`

```typescript
import { useSystemSettings } from "../hooks/useSystemSettings";

const {
  settings, // Objeto con todos los parámetros
  loading, // Estado de carga
  error, // Errores
  refresh, // Recargar configuración
  isBusinessDay, // Validar día laborable
  isWithinBusinessHours, // Validar horario
  calculateTax, // Calcular impuestos
  calculateLateCancellationPenalty, // Calcular penalización
  calculateNoShowPenalty, // Calcular penalización no show
} = useSystemSettings();
```

#### Componentes que usan la configuración:

1. **Reservations.tsx**

   - Validación de horarios y días laborables
   - Restricciones de duración (min/max)
   - Restricciones de anticipación
   - Indicadores visuales en formulario

2. **ActiveSessions.tsx**

   - Cálculo de impuestos en tiempo real
   - Botones de penalización preconfigurados
   - Desglose de costos (Subtotal + Impuestos + Penalizaciones)

3. **SystemSettings.tsx**
   - Interfaz de administración
   - Actualización de parámetros
   - Validación de tipos de datos

### Backend

#### Middleware: `validateReservation`

```javascript
// Aplicado en: Server/src/routes/reservation.routes.js
router.post("/", validateReservation, controller.create);
router.put("/:id", validateReservation, controller.update);
```

**Validaciones que realiza**:

- ✅ Día laborable según `business_days`
- ✅ Horario de atención (`opening_time` - `closing_time`)
- ✅ Duración mínima/máxima (`min_reservation_duration`, `max_reservation_duration`)
- ✅ Anticipación mínima (`min_advance_hours`)
- ✅ Anticipación máxima (`max_advance_days`)

#### Service: `session.service.js`

Función `finalizeSession()` aplica automáticamente:

```javascript
// 1. Carga tasa de impuestos
const taxRateSetting = await settingsRepository.findByKey("tax_rate");
const taxRate = parseFloat(taxRateSetting.setting_value);

// 2. Calcula costo base
let baseCost = durationHours * category.base_price;

// 3. Aplica impuestos
const taxAmount = baseCost * taxRate;

// 4. Calcula total
let finalCost = baseCost + taxAmount + penalty;
```

## Flujo de Trabajo

### Crear una Reserva

1. Usuario abre formulario de reserva
2. Frontend carga configuración con `useSystemSettings()`
3. Formulario muestra restricciones:
   - Horario: 09:00 - 23:00
   - Duración: 0.5h - 4h
   - Anticipación: 2h - 30 días
   - Días: Lun-Dom
4. Usuario completa datos
5. **Validación Frontend**: Verifica parámetros antes de enviar
6. **Validación Backend**: Middleware `validateReservation` verifica nuevamente
7. Si pasa validación → Crea reserva
8. Si falla → Retorna error específico

### Finalizar una Sesión

1. Admin hace clic en "Finalizar Sesión"
2. Modal muestra desglose:
   ```
   Subtotal:        $45.50
   Impuestos (13%): $5.92
   Penalización:    $0.00
   ─────────────────────────
   Total a Cobrar:  $51.42
   ```
3. Admin puede aplicar penalizaciones:
   - Botón "Cancelación tardía (50%)" → Agrega $22.75
   - Botón "No Show (100%)" → Agrega $45.50
4. Admin selecciona método de pago
5. **Backend calcula**:
   - Duración en horas
   - Costo base = duración × tarifa/hora
   - Impuestos = costo base × `tax_rate`
   - Total = costo base + impuestos + penalización
6. Crea registro de pago con monto total
7. Actualiza sesión con `status=2` (cerrada)

## Modificar Configuración

1. Admin va a "Configuración del Sistema"
2. Ve 4 pestañas organizadas:
   - 📅 Horario
   - 📋 Reservas
   - 💰 Precios e Impuestos
   - 🏢 Datos del Negocio
3. Modifica valores necesarios
4. Click en "Guardar Cambios"
5. Backend actualiza registros en tabla `system_settings`
6. Cambios aplican inmediatamente en nuevas operaciones

## Base de Datos

**Tabla**: `system_settings`

```sql
CREATE TABLE system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type ENUM('string','number','boolean','time','json') NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API Endpoints

| Método | Ruta            | Descripción                          |
| ------ | --------------- | ------------------------------------ |
| GET    | `/api/settings` | Obtener todas las configuraciones    |
| PUT    | `/api/settings` | Actualizar múltiples configuraciones |

**Ejemplo Request**:

```json
PUT /api/settings
{
  "settings": [
    { "setting_key": "tax_rate", "setting_value": "0.15" },
    { "setting_key": "opening_time", "setting_value": "08:00" }
  ]
}
```

**Ejemplo Response**:

```json
{
  "success": true,
  "message": "Configuraciones actualizadas correctamente"
}
```

## Próximas Mejoras

- [ ] Auto-cancelación de reservas sin presentación después de `auto_cancel_no_show_minutes`
- [ ] Límite de `max_concurrent_reservations` por usuario
- [ ] Sistema de notificaciones usando `enable_notifications`
- [ ] Envío de emails con `business_email` y `business_phone`
- [ ] Período de gracia implementado con `grace_period_minutes`
- [ ] Dashboard con métricas basadas en configuración
- [ ] Exportar/importar configuración completa

## Notas Importantes

⚠️ **Los cambios en configuración NO son retroactivos**:

- Sesiones ya finalizadas mantienen su costo calculado original
- Reservas creadas antes del cambio mantienen sus valores
- Solo afecta nuevas operaciones

✅ **Validación en dos niveles**:

- Frontend: UX mejorada, feedback inmediato
- Backend: Seguridad, datos consistentes

💡 **Uso del hook**:

- Se carga automáticamente al montar componente
- Cachea datos para evitar múltiples requests
- Función `refresh()` disponible para actualizar

---

**Última actualización**: Diciembre 7, 2025  
**Versión**: 1.0.0
