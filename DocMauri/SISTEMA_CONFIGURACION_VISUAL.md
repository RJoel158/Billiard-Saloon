# 🎯 Sistema de Configuración - Guía Visual

## 📊 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                    TABLA: system_settings                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ opening_time = "09:00"                                   │   │
│  │ closing_time = "23:00"                                   │   │
│  │ tax_rate = "0.13"                                        │   │
│  │ min_reservation_duration = "30"                          │   │
│  │ business_days = "[1,2,3,4,5,6,7]"                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  GET /api/settings                       │
        │  Retorna todos los parámetros            │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  useSystemSettings() Hook                │
        │  • Transforma tipos de datos             │
        │  • Cachea configuración                  │
        │  • Provee funciones helper               │
        └──────────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
┌───────────────────────┐          ┌────────────────────────┐
│   Reservations.tsx    │          │  ActiveSessions.tsx    │
│                       │          │                        │
│ ✅ Valida horarios    │          │ 💰 Calcula impuestos   │
│ ✅ Valida días        │          │ 💰 Aplica penalizaciones│
│ ✅ Valida duración    │          │ 📊 Muestra desglose    │
│ ✅ Valida anticipación│          │                        │
└───────────────────────┘          └────────────────────────┘
```

## 🔄 Ciclo de Vida de una Reserva

```
1️⃣ USUARIO ABRE FORMULARIO
   ↓
   useSystemSettings() carga configuración
   ↓
   Formulario muestra restricciones:
   ┌────────────────────────────────────┐
   │ Horario: 09:00 - 23:00            │
   │ Duración: 0.5h - 4h               │
   │ Anticipación: 2h - 30 días        │
   │ Días laborables: ☑ Lun ☑ Mar ... │
   └────────────────────────────────────┘

2️⃣ VALIDACIÓN FRONTEND
   ↓
   ❌ ¿Día laborable?
   ❌ ¿Dentro del horario?
   ❌ ¿Duración válida?
   ❌ ¿Anticipación correcta?
   ↓
   Si todo OK → POST /api/reservations

3️⃣ VALIDACIÓN BACKEND
   ↓
   Middleware: validateReservation
   ↓
   ❌ Verifica mismas reglas del frontend
   ↓
   Si todo OK → Crea reserva en DB
```

## 💵 Cálculo de Pago al Finalizar Sesión

```
ENTRADA:
┌───────────────────────────┐
│ Hora inicio: 14:00        │
│ Hora fin:    16:30        │
│ Tarifa:      $20/hora     │
│ Penalización: $0          │
└───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ BACKEND: session.service.js             │
│                                         │
│ 1. Duración = 2.5 horas                 │
│ 2. Costo base = 2.5 × $20 = $50.00      │
│ 3. Impuestos = $50 × 0.13 = $6.50       │
│ 4. Penalización = $0                    │
│ 5. TOTAL = $50 + $6.50 + $0 = $56.50    │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ FRONTEND: Modal muestra                 │
│                                         │
│ Subtotal:        $50.00                 │
│ Impuestos (13%): $6.50                  │
│ Penalización:    $0.00                  │
│ ─────────────────────────                │
│ Total a Cobrar:  $56.50                 │
└─────────────────────────────────────────┘
```

## 🎨 Interfaz de Configuración

```
╔════════════════════════════════════════════════════════════╗
║          CONFIGURACIÓN DEL SISTEMA                         ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Tabs: [📅 Horario] [📋 Reservas] [💰 Precios] [🏢 Negocio]║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │ 📅 HORARIO DE ATENCIÓN                            │   ║
║  │                                                    │   ║
║  │ Hora de Apertura:  [09:00] ⏰                      │   ║
║  │ Hora de Cierre:    [23:00] ⏰                      │   ║
║  │                                                    │   ║
║  │ Días Laborables:                                  │   ║
║  │ ☑ Lunes  ☑ Martes  ☑ Miércoles  ☑ Jueves         │   ║
║  │ ☑ Viernes  ☑ Sábado  ☑ Domingo                   │   ║
║  └────────────────────────────────────────────────────┘   ║
║                                                            ║
║  [Guardar Cambios]                                         ║
╚════════════════════════════════════════════════════════════╝
```

## 🛡️ Validaciones Aplicadas

### Al Crear/Editar Reserva

| ✅ Validación    | Frontend | Backend | Mensaje de Error                                |
| ---------------- | -------- | ------- | ----------------------------------------------- |
| Día laborable    | ✓        | ✓       | "El día Domingo no es un día laborable"         |
| Horario          | ✓        | ✓       | "La reserva debe estar dentro de 09:00 - 23:00" |
| Duración mín     | ✓        | ✓       | "La duración mínima es 30 minutos"              |
| Duración máx     | ✓        | ✓       | "La duración máxima es 240 minutos"             |
| Anticipación mín | ✓        | ✓       | "Debe reservar con al menos 2 horas"            |
| Anticipación máx | ✓        | ✓       | "No puede reservar con más de 30 días"          |

### Al Finalizar Sesión

| 💰 Cálculo         | Aplicado       | Fórmula                                     |
| ------------------ | -------------- | ------------------------------------------- |
| Impuestos          | Automático     | costo_base × tax_rate                       |
| Cancelación tardía | Manual (botón) | costo_base × late_cancellation_penalty_rate |
| No Show            | Manual (botón) | costo_base × no_show_penalty_rate           |

## 📱 Componentes Integrados

```
┌─────────────────────────────────────────────────────┐
│  useSystemSettings.ts (Hook)                        │
│  • Carga configuración al montar                    │
│  • Provee funciones helper                          │
│  • Actualización con refresh()                      │
└─────────────────────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌────────────────┐
│Reservations │ │ActiveSessions│ │SystemSettings  │
│             │ │              │ │                │
│• Formulario │ │• Finalizador │ │• Admin Panel   │
│• Validación │ │• Cálculos    │ │• CRUD Config   │
└─────────────┘ └─────────────┘ └────────────────┘
```

## 🔧 Archivos Modificados/Creados

### Frontend

```
✅ Client/src/hooks/useSystemSettings.ts        (NUEVO)
✅ Client/src/components/Admin/Reservations.tsx (MODIFICADO)
✅ Client/src/components/Admin/ActiveSessions.tsx (MODIFICADO)
✅ Client/src/components/Admin/SystemSettings.tsx (YA EXISTÍA)
```

### Backend

```
✅ Server/src/middlewares/validateReservation.js (NUEVO)
✅ Server/src/services/session.service.js       (MODIFICADO)
✅ Server/src/routes/reservation.routes.js      (MODIFICADO)
✅ Server/src/repositories/system-settings.repository.js (YA EXISTÍA)
```

### Documentación

```
✅ DocMauri/SISTEMA_CONFIGURACION.md (NUEVO)
✅ DocMauri/SISTEMA_CONFIGURACION_VISUAL.md (ESTE ARCHIVO)
```

## 🎬 Ejemplos de Uso

### Escenario 1: Cambiar Horario de Atención

```
1. Admin → Configuración del Sistema
2. Tab "Horario"
3. Cambiar:
   opening_time: "09:00" → "08:00"
   closing_time: "23:00" → "22:00"
4. Guardar

RESULTADO:
• Nuevas reservas solo se pueden hacer entre 08:00 - 22:00
• Reservas existentes NO se modifican
• Validación inmediata en frontend
```

### Escenario 2: Aumentar Tasa de Impuestos

```
1. Admin → Configuración del Sistema
2. Tab "Precios e Impuestos"
3. Cambiar:
   tax_rate: "0.13" (13%) → "0.15" (15%)
4. Guardar

RESULTADO:
• Nuevas sesiones finalizadas usan 15%
• Modal muestra "Impuestos (15%): $7.50"
• Backend calcula automáticamente
• Sesiones anteriores mantienen su 13%
```

### Escenario 3: Aplicar Penalización

```
1. Admin → Sesiones Activas
2. Click "Finalizar Sesión" en Mesa #5
3. Modal muestra:
   Subtotal:        $45.50
   Impuestos (13%): $5.92
   ─────────────────────────
   Total a Cobrar:  $51.42

4. Click botón "No Show (100%)"
5. Ahora muestra:
   Subtotal:        $45.50
   Impuestos (13%): $5.92
   Penalización:    $45.50  ← NUEVO
   ─────────────────────────
   Total a Cobrar:  $96.92

6. Seleccionar método de pago
7. Confirmar

RESULTADO:
• Pago registrado con $96.92
• Sesión cerrada
• Cliente penalizado
```

## 🚀 Próximos Pasos

```
[ ] Implementar auto-cancelación de no-shows
[ ] Límite de reservas concurrentes por usuario
[ ] Sistema de notificaciones en tiempo real
[ ] Exportar/importar configuración
[ ] Historial de cambios de configuración
[ ] Roles con permisos para cambiar configuración
```

---

**¿Cómo probar el sistema?**

1. Inicia el backend: `cd Server && npm run dev`
2. Inicia el frontend: `cd Client && npm run dev`
3. Ve a Configuración del Sistema
4. Cambia algún parámetro (ej: horario de cierre a 20:00)
5. Intenta crear una reserva a las 21:00
6. ✅ Debería mostrar error de validación

---

**Última actualización**: Diciembre 7, 2025
