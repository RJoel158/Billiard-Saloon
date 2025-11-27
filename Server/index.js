const express = require('express');
const db = require('./src/db/db'); // Asegúrate de que el archivo de conexión a la base de datos esté correctamente importado

const app = express();
const PORT = process.env.PORT || 3000;

// Verificar conexión a la base de datos
async function checkDatabaseConnection() {
  try {
    await db.query('SELECT 1'); // Consulta simple para verificar la conexión
    console.log('✅ Conexión a la base de datos exitosa');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    process.exit(1); // Detener el servidor si la base de datos no está disponible
  }
}

// Definir una ruta para la raíz
app.get('/', (req, res) => {
  res.send('¡Bienvenido al servidor! 🚀');
});

// Iniciar el servidor
async function startServer() {
  await checkDatabaseConnection(); // Verificar la base de datos antes de iniciar el servidor

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();