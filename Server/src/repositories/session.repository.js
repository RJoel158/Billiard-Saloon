const db = require('../db/db');

async function findAll() {
  const rows = await db.query('SELECT id, user_id, reservation_id, table_id, start_time, end_time, session_type, final_cost, status FROM sessions');
  return rows;
}

async function findAllPaged(limit, offset) {
  const rows = await db.query('SELECT id, user_id, reservation_id, table_id, start_time, end_time, session_type, final_cost, status FROM sessions ORDER BY start_time DESC LIMIT ? OFFSET ?', [limit, offset]);
  return rows;
}

async function findActive() {
  const rows = await db.query(`
    SELECT 
      s.id, s.user_id, s.reservation_id, s.table_id, s.start_time, s.end_time, 
      s.session_type, s.final_cost, s.status,
      u.id as u_id, u.first_name, u.last_name, u.email,
      t.id as t_id, t.code as table_code
    FROM sessions s
    LEFT JOIN users u ON s.user_id = u.id
    LEFT JOIN billiard_tables t ON s.table_id = t.id
    WHERE s.status = 1
    ORDER BY s.start_time DESC
  `);
  
  return rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    reservation_id: row.reservation_id,
    table_id: row.table_id,
    start_time: row.start_time,
    end_time: row.end_time,
    session_type: row.session_type,
    final_cost: row.final_cost,
    status: row.status,
    user: row.first_name ? {
      id: row.u_id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email
    } : null,
    table: {
      id: row.t_id,
      code: row.table_code
    }
  }));
}

async function countTotal() {
  const rows = await db.query('SELECT COUNT(*) as total FROM sessions');
  return rows[0]?.total || 0;
}

async function findById(id) {
  const rows = await db.query('SELECT id, user_id, reservation_id, table_id, start_time, end_time, session_type, final_cost, status FROM sessions WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findActiveByTableId(tableId) {
  const rows = await db.query('SELECT id, user_id, reservation_id, table_id, start_time, end_time, session_type, final_cost, status FROM sessions WHERE table_id = ? AND status = 1', [tableId]);
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

module.exports = { findAll, findAllPaged, findActive, countTotal, findById, findActiveByTableId, create, update, deleteById };
