const db = require('../db/db');

async function findAll() {
  const rows = await db.query('SELECT id, user_id, table_id, reservation_date, start_time, end_time, status, created_at FROM reservations');
  return rows;
}

async function findById(id) {
  const rows = await db.query('SELECT id, user_id, table_id, reservation_date, start_time, end_time, status, created_at FROM reservations WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create(r) {
  await db.query('INSERT INTO reservations (user_id, table_id, reservation_date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)', [r.user_id, r.table_id, r.reservation_date, r.start_time, r.end_time, r.status || 1]);
  const rows = await db.query('SELECT id, user_id, table_id, reservation_date, start_time, end_time, status, created_at FROM reservations WHERE id = LAST_INSERT_ID()');
  return rows[0] || null;
}

async function update(id, r) {
  await db.query('UPDATE reservations SET user_id = ?, table_id = ?, reservation_date = ?, start_time = ?, end_time = ?, status = ? WHERE id = ?', [r.user_id, r.table_id, r.reservation_date, r.start_time, r.end_time, r.status, id]);
  return await findById(id);
}

async function deleteById(id) {
  // Logical delete: mark as cancelled (3)
  const result = await db.query('UPDATE reservations SET status = 3 WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, deleteById };
