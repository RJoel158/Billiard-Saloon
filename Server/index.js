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
let dashboardRoutes;
let penaltyRoutes;
const { errorHandler } = require("./src/middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
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
  tableCategoryRoutes = require("./src/routes/table-category.routes");
  userRoutes = require("./src/routes/user.routes");
  const authRoutes = require("./src/routes/auth.routes");
  paymentRoutes = require("./src/routes/payment.routes");
  rolesRoutes = require("./src/routes/roles.routes");
  tableRoutes = require("./src/routes/billiard-table.routes");
  dynamicPricingRoutes = require("./src/routes/dynamic-pricing.routes");
  reservationRoutes = require("./src/routes/reservation.routes");
  sessionRoutes = require("./src/routes/session.routes");
  dashboardRoutes = require("./src/routes/dashboard.routes");
  penaltyRoutes = require("./src/routes/penalty.routes");

  app.use("/api/table-categories", tableCategoryRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/roles', rolesRoutes);
  app.use('/api/tables', tableRoutes);
  app.use('/api/dynamic-pricing', dynamicPricingRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/penalties', penaltyRoutes);

  // Admin-protected mounts (development middleware). Use header `x-user-role: admin` to authorize.
  const isAdmin = require('./src/middlewares/isAdmin');
  app.use('/api/admin/table-categories', isAdmin, tableCategoryRoutes);
  app.use('/api/admin/users', isAdmin, userRoutes);
  app.use('/api/admin/payments', isAdmin, paymentRoutes);
  app.use('/api/admin/roles', isAdmin, rolesRoutes);
  app.use('/api/admin/tables', isAdmin, tableRoutes);
  app.use('/api/admin/dynamic-pricing', isAdmin, dynamicPricingRoutes);
  app.use('/api/admin/reservations', isAdmin, reservationRoutes);
  app.use('/api/admin/sessions', isAdmin, sessionRoutes);
  app.use('/api/admin/dashboard', isAdmin, dashboardRoutes);
  app.use('/api/admin/penalties', isAdmin, penaltyRoutes);

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;

if (require.main === module) {
  startServer();
}
