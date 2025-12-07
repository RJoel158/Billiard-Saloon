# API Endpoints - Sistema de Reservas y Sesiones de Billar

## Flujo completo implementado

### 1. Consultar disponibilidad de una mesa

**GET** `/api/reservations/available-slots?table_id=1&date=2025-12-02`

Muestra los horarios disponibles para reservar una mesa específica en una fecha dada.

```json
// Response
{
  "success": true,
  "data": [
    {
      "start_time": "2025-12-02T14:00:00.000Z",
      "end_time": "2025-12-02T15:00:00.000Z",
      "hour": "14:00 - 15:00"
    },
    {
      "start_time": "2025-12-02T15:00:00.000Z",
      "end_time": "2025-12-02T16:00:00.000Z",
      "hour": "15:00 - 16:00"
    }
  ]
}
```

### 2. Crear una reserva (Cliente)

**POST** `/api/reservations`

El cliente crea una reserva indicando mesa, hora inicio, hora fin. La reserva queda en estado `pending` (1).

```json
// Request body
{
  "user_id": 1,
  "table_id": 1,
  "start_time": "2025-12-02T15:00:00",
  "end_time": "2025-12-02T17:00:00"
}

// Response
{
  "id": 1,
  "user_id": 1,
  "table_id": 1,
  "reservation_date": "2025-12-02T15:00:00.000Z",
  "start_time": "2025-12-02T15:00:00.000Z",
  "end_time": "2025-12-02T17:00:00.000Z",
  "status": 1,  // 1=pending
  "created_at": "2025-12-02T14:30:00.000Z"
}
```

**Validaciones automáticas:**

- ✅ Duración mínima de 1 hora
- ✅ No puede reservar en el pasado
- ✅ Detecta conflictos con otras reservas o sesiones activas
- ✅ Mesa no está en mantenimiento

### 3. Aprobar reserva (Admin)

**PATCH** `/api/reservations/:id/approve`

El admin revisa la reserva y la aprueba. Estado cambia a `confirmed` (2).

```json
// Request body
{
  "admin_user_id": 5
}

// Response
{
  "success": true,
  "data": {
    "id": 1,
    "status": 2  // confirmed
  }
}
```

### 4. Rechazar reserva (Admin)

**PATCH** `/api/reservations/:id/reject`

El admin puede rechazar la reserva. Estado cambia a `cancelled` (3).

```json
// Request body
{
  "admin_user_id": 5,
  "reason": "Comprobante de pago inválido"
}
```

### 5. Iniciar sesión (Walk-in o con Reserva)

**POST** `/api/sessions/start`

#### Opción A: Walk-in (sin reserva)

```json
{
  "table_id": 1,
  "user_id": 2 // opcional
}
```

**Validaciones walk-in:**

- ✅ Mesa no tiene sesión activa
- ✅ No hay reservas confirmadas en las próximas 2 horas

#### Opción B: Con reserva confirmada

```json
{
  "table_id": 1,
  "reservation_id": 1
}
```

**Validaciones reserva:**

- ✅ Reserva existe y está confirmada (status=2)
- ✅ Mesa coincide con la reserva
- ✅ Horario está cerca (dentro de 30 minutos)
- ✅ Reserva no tiene sesión previa

```json
// Response
{
  "success": true,
  "data": {
    "id": 10,
    "user_id": 1,
    "reservation_id": 1,
    "table_id": 1,
    "start_time": "2025-12-02T15:05:00.000Z",
    "end_time": null,
    "session_type": 1, // 1=reservation, 2=walk_in
    "final_cost": 0.0,
    "status": 1 // active
  },
  "message": "Sesión iniciada correctamente"
}
```

**Efecto secundario:** La mesa cambia a estado `occupied` (2).

### 6. Finalizar sesión

**POST** `/api/sessions/:id/end`

Finaliza la sesión, calcula el costo total según duración y precio base de la categoría.

```json
// Response
{
  "success": true,
  "data": {
    "id": 10,
    "user_id": 1,
    "reservation_id": 1,
    "table_id": 1,
    "start_time": "2025-12-02T15:05:00.000Z",
    "end_time": "2025-12-02T17:10:00.000Z",
    "session_type": 1,
    "final_cost": 37.5, // 2 horas redondeadas hacia arriba * precio_base
    "status": 2 // closed
  },
  "message": "Sesión finalizada correctamente"
}
```

**Efecto secundario:** La mesa vuelve a estado `available` (1).

**Cálculo de costo:**

- Duración: redondeo hacia arriba a la hora completa
- Precio: `base_price * horas`
- TODO: Aplicar dynamic_pricing si hay reglas activas

### 7. Registrar pago

**POST** `/api/payments`

Registra el pago de una sesión (efectivo, tarjeta, QR, etc).

```json
{
  "session_id": 10,
  "amount": 37.5,
  "method": 3 // 1=cash, 2=card, 3=qr, 4=other
}
```

---

## Estados (status) en el sistema

### Reservations

- `1` - pending (esperando aprobación admin)
- `2` - confirmed (aprobada por admin)
- `3` - cancelled (rechazada o cancelada)
- `4` - expired (no utilizada)

### Sessions

- `1` - active (en curso)
- `2` - closed (finalizada)
- `3` - cancelled (cancelada)

### Tables (billiard_tables)

- `1` - available (disponible)
- `2` - occupied (ocupada por sesión activa)
- `3` - maintenance (en mantenimiento)

### Payments method

- `1` - cash (efectivo)
- `2` - card (tarjeta)
- `3` - qr (QR/digital)
- `4` - other (otro)

---

## Notificaciones (Pendiente - Socket.io)

Las notificaciones se enviarán mediante WebSocket (socket.io) para:

- ✅ Reserva aprobada → notificar al cliente
- ✅ Reserva rechazada → notificar al cliente con razón
- ⏳ Nueva reserva creada → notificar a admins

---

## Campos pendientes por añadir a la BD

Para soportar subida de comprobantes y carnets:

### En `reservations`

- `payment_proof_url` VARCHAR(255) - URL del comprobante de pago o foto de carnet

### En `payments`

- `proof_url` VARCHAR(255) - URL del comprobante de pago

Estos campos se pueden añadir ejecutando:

```sql
ALTER TABLE reservations ADD COLUMN payment_proof_url VARCHAR(255) DEFAULT NULL;
ALTER TABLE payments ADD COLUMN proof_url VARCHAR(255) DEFAULT NULL;
```

---

## Ejemplos de uso completo

### Escenario 1: Cliente hace reserva y la usa

1. Cliente consulta disponibilidad: `GET /api/reservations/available-slots?table_id=1&date=2025-12-02`
2. Cliente crea reserva: `POST /api/reservations` → status=1 (pending)
3. Admin aprueba: `PATCH /api/reservations/1/approve` → status=2 (confirmed)
4. Cliente llega y se inicia sesión: `POST /api/sessions/start` con `reservation_id=1`
5. Termina de jugar: `POST /api/sessions/10/end` → calcula costo
6. (Ya pagó con QR en reserva, no necesita pagar nuevamente)

### Escenario 2: Walk-in (sin reserva)

1. Persona llega sin reserva
2. Admin inicia sesión: `POST /api/sessions/start` solo con `table_id=1`
3. Valida que no haya reservas próximas (2 horas)
4. Juega y termina: `POST /api/sessions/10/end`
5. Se registra pago en efectivo: `POST /api/payments`

---

## Próximos pasos

- [ ] Implementar middleware de autenticación JWT
- [ ] Añadir roles y permisos (admin vs cliente)
- [ ] Integrar Socket.io para notificaciones en tiempo real
- [ ] Aplicar dynamic_pricing en cálculo de costos
- [ ] Upload de imágenes (comprobantes/carnets) → S3 o local
- [ ] Dashboard admin para ver reservas pendientes
- [ ] Notificaciones push/email opcionales
