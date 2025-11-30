const express = require("express");
const db = require("./src/db/db");
const tableCategoryRoutes = require("./src/routes/table-category.routes");
const userRoutes = require("./src/routes/user.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const rolesRoutes = require("./src/routes/roles.routes");
const tableRoutes = require("./src/routes/billiard-table.routes");
const dynamicPricingRoutes = require("./src/routes/dynamic-pricing.routes");
const reservationRoutes = require("./src/routes/reservation.routes");
const sessionRoutes = require("./src/routes/session.routes");
const { errorHandler } = require("./src/middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Montar rutas
app.use("/api/table-categories", tableCategoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/dynamic-pricing', dynamicPricingRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/sessions', sessionRoutes);

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

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;

if (require.main === module) {
  startServer();
}
