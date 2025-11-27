const express = require("express");
const db = require("./src/db/db");
const tableCategoryRoutes = require("./src/routes/table-category.routes");
const { errorHandler } = require("./src/middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Montar rutas
app.use("/api/table-categories", tableCategoryRoutes);

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
