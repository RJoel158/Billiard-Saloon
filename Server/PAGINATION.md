# Paginación en el Backend

## Resumen

Se ha implementado paginación en todos los endpoints GET del backend. Esto permite obtener resultados en páginas controladas para mejorar el rendimiento y la experiencia del usuario.

## Endpoints Actualizados

Todos los siguientes endpoints ahora soportan paginación:

- `GET /api/users` - Lista de usuarios
- `GET /api/billiard-tables` - Lista de mesas de billar
- `GET /api/reservations` - Lista de reservaciones
- `GET /api/sessions` - Lista de sesiones
- `GET /api/roles` - Lista de roles
- `GET /api/dynamic-pricing` - Lista de precios dinámicos
- `GET /api/table-categories` - Lista de categorías de mesa
- `GET /api/payments` - Lista de pagos

## Parámetros de Query

Todos los endpoints GET aceptan los siguientes parámetros opcionales:

### `page` (opcional)

- **Tipo**: `number`
- **Default**: `1`
- **Descripción**: Número de página a obtener
- **Ejemplo**: `?page=2`

### `limit` (opcional)

- **Tipo**: `number`
- **Default**: `10`
- **Min**: `1`
- **Max**: `100`
- **Descripción**: Cantidad de elementos por página
- **Ejemplo**: `?limit=20`

## Ejemplos de Uso

### Obtener la primera página (10 elementos)

```bash
GET /api/users
```

### Obtener la segunda página con 20 elementos

```bash
GET /api/users?page=2&limit=20
```

### Obtener la tercera página con 50 elementos

```bash
GET /api/reservations?page=3&limit=50
```

## Formato de Respuesta

Todas las respuestas paginadas tienen el siguiente formato:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 2,
    "totalPages": 10,
    "totalItems": 95,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

### Campos de la Respuesta

- **`success`**: Indica si la operación fue exitosa
- **`data`**: Array con los elementos de la página actual
- **`pagination`**: Objeto con información de paginación
  - **`currentPage`**: Página actual solicitada
  - **`totalPages`**: Total de páginas disponibles
  - **`totalItems`**: Total de elementos en la base de datos
  - **`itemsPerPage`**: Cantidad de elementos por página
  - **`hasNextPage`**: `true` si existe una página siguiente
  - **`hasPreviousPage`**: `true` si existe una página anterior

## Implementación Técnica

### Archivos Modificados

1. **Utilidad de Paginación** (`src/utils/pagination.js`)

   - `getPaginationParams()`: Extrae y valida parámetros de query
   - `formatPaginatedResponse()`: Formatea la respuesta paginada
   - `getLimitClause()`: Genera cláusula SQL LIMIT

2. **Repositorios** (todos en `src/repositories/`)

   - Método `findAllPaged(limit, offset)`: Obtiene datos paginados
   - Método `countTotal()`: Cuenta el total de registros

3. **Servicios** (todos en `src/services/`)

   - Método `getAll[Recurso]Paged(limit, offset)`: Lógica de negocio paginada

4. **Controladores** (todos en `src/controllers/`)
   - Actualización del método `getAll()` para usar paginación

## Notas Importantes

- El límite máximo por página es de **100 elementos** para prevenir sobrecarga del servidor
- El límite mínimo es de **1 elemento**
- Si no se especifican parámetros, se usa `page=1` y `limit=10` por defecto
- Los resultados están ordenados de forma descendente por fecha/id (más recientes primero)

## Ejemplo con Frontend (React/TypeScript)

```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

async function fetchUsers(params: PaginationParams = {}) {
  const queryParams = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 10),
  });

  const response = await fetch(`/api/users?${queryParams}`);
  const data: PaginatedResponse<User> = await response.json();

  return data;
}
```

## Migración desde Versión Anterior

Si estabas usando los endpoints sin paginación, tus llamadas existentes seguirán funcionando pero ahora recibirán respuestas paginadas con valores por defecto (`page=1`, `limit=10`).

Para obtener todos los elementos (comportamiento anterior), puedes usar `?limit=100` y hacer múltiples llamadas si `hasNextPage` es `true`.
