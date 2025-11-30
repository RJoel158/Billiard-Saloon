const db = require('../db/db');

async function findById(id) {
  const rows = await db.query('SELECT id, session_id, amount, method, created_at FROM payments WHERE id = ? AND is_active = 1', [id]);
  return rows[0] || null;
}

async function create(payment) {
  await db.query('INSERT INTO payments (session_id, amount,method) VALUES (?, ?, ?)', [payment.session_id, payment.amount, payment.method]);
  const rows = await db.query('SELECT id, session_id, amount, method, created_at FROM payments WHERE id = LAST_INSERT_ID()');
  return rows[0] || null;
}

async function findAll() {
  const rows = await db.query('SELECT id, session_id, amount, method, created_at FROM payments WHERE is_active = 1 ORDER BY created_at DESC');
  return rows;
}

async function findAllPaged(limit, offset) {
  const rows = await db.query('SELECT id, session_id, amount, method, created_at FROM payments WHERE is_active = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
  return rows;
}

async function findBySession(session_id) {
  const rows = await db.query('SELECT id, session_id, amount, method, created_at FROM payments WHERE session_id = ? AND is_active = 1 ORDER BY created_at DESC', [session_id]);
  return rows;
}

async function update(id, payment) {
  await db.query('UPDATE payments SET amount = ?, method = ? WHERE id = ? AND is_active = 1', [payment.amount, payment.method, id]);
  return await findById(id);
}

async function deleteById(id) {
  const result = await db.query('UPDATE payments SET is_active = 0 WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findById, create, findAll, findAllPaged, findBySession, update, deleteById };



// CREATE TABLE payments (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     session_id INT NOT NULL,
//     amount DECIMAL(10,2) NOT NULL,
//     method TINYINT NOT NULL COMMENT '1=cash,2=card,3=qr,4=other',
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (session_id) REFERENCES sessions(id)
// );