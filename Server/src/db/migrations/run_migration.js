const db = require('../db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    
    // Test connection
    await db.query('SELECT 1');
    console.log('✅ Conexión exitosa');

    console.log('📄 Ejecutando migración...');

    // Execute migration
    const mainSQL = `
      ALTER TABLE reservations 
      ADD COLUMN qr_payment_path VARCHAR(255) NULL AFTER end_time,
      ADD COLUMN payment_verified BOOLEAN DEFAULT FALSE AFTER qr_payment_path
    `;

    console.log('SQL:', mainSQL);
    await db.query(mainSQL);

    console.log('✅ Migración ejecutada exitosamente');
    console.log('📊 Verificando columnas añadidas...');

    // Verify columns were added
    const columns = await db.query(
      "SHOW COLUMNS FROM reservations WHERE Field IN ('qr_payment_path', 'payment_verified')"
    );

    console.log('Columnas añadidas:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}, Default: ${col.Default})`);
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    
    // Check if columns already exist
    if (error.message.includes("Duplicate column")) {
      console.log('ℹ️  Las columnas ya existen en la tabla');
      
      // Verify they exist
      try {
        const columns = await db.query(
          "SHOW COLUMNS FROM reservations WHERE Field IN ('qr_payment_path', 'payment_verified')"
        );
        console.log('Columnas encontradas:');
        columns.forEach(col => {
          console.log(`  - ${col.Field} (${col.Type}, Default: ${col.Default})`);
        });
        process.exit(0);
      } catch (err) {
        console.error('Error verificando columnas:', err.message);
      }
    }
    
    process.exit(1);
  } finally {
    // Close pool
    if (db.pool) {
      await db.pool.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Run migration
runMigration();
