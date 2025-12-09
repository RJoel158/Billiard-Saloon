const db = require('../db/db');
const schema = require('../db/schema');

function _hasActive() {
  return schema.hasColumn('payments', 'is_active');
}

async function findById(id) {
  const extra = _hasActive() ? ' AND is_active = 1' : '';
  const rows = await db.query(`SELECT id, session_id, amount, method, created_at FROM payments WHERE id = ?${extra}`, [id]);
  return rows[0] || null;
}

async function create(payment) {
  await db.query('INSERT INTO payments (session_id, amount,method) VALUES (?, ?, ?)', [payment.session_id, payment.amount, payment.method]);
  const rows = await db.query('SELECT id, session_id, amount, method, created_at FROM payments WHERE id = LAST_INSERT_ID()');
  return rows[0] || null;
}

async function findAll() {
  const extra = _hasActive() ? ' WHERE is_active = 1' : '';
  const rows = await db.query(`SELECT id, session_id, amount, method, created_at FROM payments${extra} ORDER BY created_at DESC`);
  return rows;
}

async function findAllPaged(limit, offset) {
  const extra = _hasActive() ? ' WHERE is_active = 1' : '';
  const rows = await db.query(`SELECT id, session_id, amount, method, created_at FROM payments${extra} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [limit, offset]);
  return rows;
}

async function countTotal() {
  const extra = _hasActive() ? ' WHERE is_active = 1' : '';
  const rows = await db.query(`SELECT COUNT(*) as total FROM payments${extra}`);
  return rows[0]?.total || 0;
}

async function findBySession(session_id) {
  const extra = _hasActive() ? ' AND is_active = 1' : '';
  const rows = await db.query(`SELECT id, session_id, amount, method, created_at FROM payments WHERE session_id = ?${extra} ORDER BY created_at DESC`, [session_id]);
  return rows;
}

async function update(id, payment) {
  if (_hasActive()) {
    await db.query('UPDATE payments SET amount = ?, method = ? WHERE id = ? AND is_active = 1', [payment.amount, payment.method, id]);
  } else {
    await db.query('UPDATE payments SET amount = ?, method = ? WHERE id = ?', [payment.amount, payment.method, id]);
  }
  return await findById(id);
}

async function deleteById(id) {
  if (_hasActive()) {
    const result = await db.query('UPDATE payments SET is_active = 0 WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
  const result = await db.query('DELETE FROM payments WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findById, create, findAll, findAllPaged, countTotal, findBySession, findBySessionId: findBySession, update, deleteById };



// CREATE TABLE payments (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     session_id INT NOT NULL,
//     amount DECIMAL(10,2) NOT NULL,
//     method TINYINT NOT NULL COMMENT '1=cash,2=card,3=qr,4=other',
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (session_id) REFERENCES sessions(id)
// );