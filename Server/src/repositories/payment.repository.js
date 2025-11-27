const db = require('../db/db');

async function findById(id) {
  const rows = await db.query('SELECT id, session_id, amount, method FROM payments WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create(payment) {
  await db.query('INSERT INTO payments (session_id, amount,method) VALUES (?, ?, ?)', [payment.session_id, payment.amount, payment.method]);
  const rows = await db.query('SELECT id, session_id, amount, method FROM payments WHERE id = LAST_INSERT_ID()');
  return rows[0] || null;
}

module.exports = { findById, create };



// CREATE TABLE payments (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     session_id INT NOT NULL,
//     amount DECIMAL(10,2) NOT NULL,
//     method TINYINT NOT NULL COMMENT '1=cash,2=card,3=qr,4=other',
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (session_id) REFERENCES sessions(id)
// );