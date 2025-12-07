const express = require("express");
const cors = require("cors");
const db = require("./src/db/db");
// routes will be required after schema init in startServer
let tableCategoryRoutes;
let userRoutes;
let paymentRoutes;
let rolesRoutes;
let tableRoutes;
let dynamicPricingRoutes;
let reservationRoutes;
let sessionRoutes;
let authRoutes;
let systemSettingsRoutes;
const { errorHandler } = require("./src/middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(cors());
app.use(express.json());

// Montar rutas (se harán después de inicializar el esquema en startServer)

// Middleware de errores
app.use(errorHandler);

// Verificar conexión a la base de datos
async function checkDatabaseConnection() {
  try {
    await db.query("SELECT 1");
    console.log("✅ Conexión a la base de datos exitosa");
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error.message);
    process.exit(1);
  }
}

// Definir una ruta para la raíz
app.get('/', (req, res) => {
  res.send('¡Bienvenido al servidor! 🚀');
});

// Iniciar el servidor
async function startServer() {
  await checkDatabaseConnection();

  // Initialize schema info so repositories can adapt queries
  const schema = require('./src/db/schema');
  try {
    await schema.init();
    console.log('🔎 Esquema cargado (columns detectadas)');
  } catch (err) {
    console.warn('⚠️ No se pudo leer el esquema de la DB:', err.message);
  }

  // Now require and mount routes
  authRoutes = require("./src/routes/auth.routes");
  tableCategoryRoutes = require("./src/routes/table-category.routes");
  userRoutes = require("./src/routes/user.routes");
  paymentRoutes = require("./src/routes/payment.routes");
  rolesRoutes = require("./src/routes/roles.routes");
  tableRoutes = require("./src/routes/billiard-table.routes");
  dynamicPricingRoutes = require("./src/routes/dynamic-pricing.routes");
  reservationRoutes = require("./src/routes/reservation.routes");
  sessionRoutes = require("./src/routes/session.routes");
  systemSettingsRoutes = require("./src/routes/system-settings.routes");

  app.use("/api/auth", authRoutes);
  app.use("/api/table-categories", tableCategoryRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/roles', rolesRoutes);
  app.use('/api/tables', tableRoutes);
  app.use('/api/dynamic-pricing', dynamicPricingRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/settings', systemSettingsRoutes);

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;

if (require.main === module) {
  startServer();
}
