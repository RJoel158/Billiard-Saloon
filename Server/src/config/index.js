// Configuración simple tomada de variables de entorno
module.exports = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'billiard',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  },
};
