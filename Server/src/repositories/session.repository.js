const db = require('../db/db');

async function findAll() {
  const rows = await db.query('SELECT id, user_id, reservation_id, table_id, start_time, end_time, session_type, final_cost, status FROM sessions');
  return rows;
}

async function findById(id) {
  const rows = await db.query('SELECT id, user_id, reservation_id, table_id, start_time, end_time, session_type, final_cost, status FROM sessions WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findActiveByTable(table_id) {
  const rows = await db.query('SELECT id, user_id, reservation_id, table_id, start_time, end_time, session_type, final_cost, status FROM sessions WHERE table_id = ? AND status = 1', [table_id]);
  return rows[0] || null;
}

async function findByReservation(reservation_id) {
  const rows = await db.query('SELECT id, user_id, reservation_id, table_id, start_time, end_time, session_type, final_cost, status FROM sessions WHERE reservation_id = ?', [reservation_id]);
  return rows[0] || null;
}

async function create(s) {
  await db.query('INSERT INTO sessions (user_id, reservation_id, table_id, start_time, end_time, session_type, final_cost, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [s.user_id || null, s.reservation_id || null, s.table_id, s.start_time, s.end_time || null, s.session_type || 2, s.final_cost || 0, s.status || 1]);
  const rows = await db.query('SELECT id, user_id, reservation_id, table_id, start_time, end_time, session_type, final_cost, status FROM sessions WHERE id = LAST_INSERT_ID()');
  return rows[0] || null;
}

async function update(id, s) {
  await db.query('UPDATE sessions SET user_id = ?, reservation_id = ?, table_id = ?, start_time = ?, end_time = ?, session_type = ?, final_cost = ?, status = ? WHERE id = ?', [s.user_id || null, s.reservation_id || null, s.table_id, s.start_time, s.end_time || null, s.session_type || 2, s.final_cost || 0, s.status, id]);
  return await findById(id);
}

async function deleteById(id) {
  // Logical delete: mark session as cancelled (3)
  const result = await db.query('UPDATE sessions SET status = 3 WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function closeSession(id, end_time, final_cost) {
  await db.query('UPDATE sessions SET end_time = ?, final_cost = ?, status = 2 WHERE id = ?', [end_time, final_cost, id]);
  return await findById(id);
}

module.exports = { findAll, findById, findActiveByTable, findByReservation, create, update, closeSession, deleteById };
