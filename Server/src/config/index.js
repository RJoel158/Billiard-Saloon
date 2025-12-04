// Configuración simple tomada de variables de entorno
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'mysql-reciclaje.alwaysdata.net',
    user: process.env.DB_USER || 'reciclaje_final',
    password: process.env.DB_PASSWORD || 'Univalle.',
    database: process.env.DB_NAME || 'reciclaje_billar',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};
