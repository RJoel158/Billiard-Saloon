Estructura creada para Backend sencillo en JavaScript (Express)

Carpetas principales dentro de `Server/src`:

- `config/` -> configuración y carga de variables de entorno
- `db/` -> conexión a MySQL y helper `query`
- `repositories/`-> funciones de acceso a datos (SQL queries)
- `services/` -> lógica de negocio y validaciones
- `controllers/` -> handlers que llaman a services y forman respuestas
- `routes/` -> definición de endpoints y mounting
- `middlewares/` -> middleware (error handler, auth, validación)
- `utils/` -> helpers (respuesta estandarizada, loggers, etc.)

Archivos creados inicialmente:

- `src/config/index.js`
- `src/db/index.js`
- `src/repositories/user.repository.js`
- `src/services/user.service.js`
- `src/controllers/user.controller.js`
- `src/routes/user.routes.js`
- `src/middlewares/errorHandler.js`
- `src/middlewares/apiError.js`
- `src/utils/response.js`

Sugerencia de uso rápido:

- Mantén `Server/index.js` como punto de entrada (existe en el repo). En ese archivo puedes montar las rutas creadas así:

```js
const express = require("express");
const userRoutes = require("./src/routes/user.routes");
const { errorHandler } = require("./src/middlewares/errorHandler");

const app = express();
app.use(express.json());
app.use("/api/v1/users", userRoutes);
app.use(errorHandler);

app.listen(process.env.PORT || 3000);
```

¿Quieres que monte las rutas en `Server/index.js` por ti o prefieres hacerlo manualmente? Modify this file as needed.
