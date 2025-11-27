require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/db');
const userRoutes = require('./src/routes/user.routes');
const { errorHandler } = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware para loguear requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Body:`, req.body);
  next();
});

// Verificar conexión a la base de datos
async function checkDatabaseConnection() {
  try {
    await db.query('SELECT 1');
    console.log('✅ Conexión a la base de datos exitosa');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    process.exit(1);
  }
}

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a Billiard Saloon API' });
});

app.use('/api/v1/users', userRoutes);

// Error Handler (debe ir al final)
app.use(errorHandler);

// Iniciar el servidor
async function startServer() {
  await checkDatabaseConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();