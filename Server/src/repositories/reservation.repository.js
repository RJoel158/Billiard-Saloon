const db = require('../db/db');

async function findAll() {
  const rows = await db.query('SELECT id, user_id, table_id, reservation_date, start_time, end_time, status, created_at FROM reservations');
  return rows;
}

async function findById(id) {
  const rows = await db.query('SELECT id, user_id, table_id, reservation_date, start_time, end_time, status, created_at FROM reservations WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findByTableAndDateRange(table_id, start_time, end_time) {
  const rows = await db.query(
    `SELECT id, user_id, table_id, reservation_date, start_time, end_time, status, created_at 
     FROM reservations 
     WHERE table_id = ? 
       AND status IN (1, 2) 
       AND ((start_time < ? AND end_time > ?) OR (start_time >= ? AND start_time < ?))
     ORDER BY start_time`,
    [table_id, end_time, start_time, start_time, end_time]
  );
  return rows;
}

async function findAvailableSlots(table_id, date) {
  // Get all reservations and sessions for a table on a specific date
  const rows = await db.query(
    `SELECT start_time, end_time FROM reservations 
     WHERE table_id = ? AND DATE(start_time) = DATE(?) AND status IN (1, 2)
     UNION
     SELECT start_time, end_time FROM sessions 
     WHERE table_id = ? AND DATE(start_time) = DATE(?) AND status = 1
     ORDER BY start_time`,
    [table_id, date, table_id, date]
  );
  return rows;
}

async function create(r) {
  await db.query('INSERT INTO reservations (user_id, table_id, reservation_date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)', [r.user_id, r.table_id, r.reservation_date, r.start_time, r.end_time, r.status || 1]);
  const rows = await db.query('SELECT id, user_id, table_id, reservation_date, start_time, end_time, status, created_at FROM reservations WHERE id = LAST_INSERT_ID()');
  return rows[0] || null;
}

async function update(id, r) {
  await db.query(
    'UPDATE reservations SET user_id = ?, table_id = ?, reservation_date = ?, start_time = ?, end_time = ?, status = ? WHERE id = ?',
    [r.user_id, r.table_id, r.reservation_date, r.start_time, r.end_time, r.status, id]
  );
  return await findById(id);
}

async function updateStatus(id, status) {
  await db.query('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
  return await findById(id);
}

async function deleteById(id) {
  // Logical delete: mark as cancelled (3)
  const result = await db.query('UPDATE reservations SET status = 3 WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByTableAndDateRange, findAvailableSlots, create, update, updateStatus, deleteById };
