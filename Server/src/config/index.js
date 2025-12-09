module.exports = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'mysql-reciclaje.alwaysdata.net',
    user: process.env.DB_USER || 'reciclaje_final',
    password: process.env.DB_PASSWORD || 'Univalle.',
    database: process.env.DB_NAME || 'reciclaje_billar',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  },
};
