const db = require('../db/db');

async function findAll() {
  const rows = await db.query(`
    SELECT p.*, u.first_name, u.last_name 
    FROM penalties p 
    LEFT JOIN users u ON p.applied_by = u.id
    ORDER BY p.created_at DESC
  `);
  return rows;
}

async function findById(id) {
  const rows = await db.query(`
    SELECT p.*, u.first_name, u.last_name 
    FROM penalties p 
    LEFT JOIN users u ON p.applied_by = u.id 
    WHERE p.id = ?
  `, [id]);
  return rows[0] || null;
}

async function findBySessionId(sessionId) {
  const rows = await db.query(`
    SELECT p.*, u.first_name, u.last_name 
    FROM penalties p 
    LEFT JOIN users u ON p.applied_by = u.id 
    WHERE p.session_id = ?
    ORDER BY p.created_at DESC
  `, [sessionId]);
  return rows;
}

async function create(penalty) {
  await db.query(
    'INSERT INTO penalties (session_id, amount, reason, applied_by) VALUES (?, ?, ?, ?)',
    [penalty.session_id, penalty.amount, penalty.reason, penalty.applied_by]
  );
  const rows = await db.query('SELECT * FROM penalties WHERE id = LAST_INSERT_ID()');
  return rows[0] || null;
}

async function deleteById(id) {
  const result = await db.query('DELETE FROM penalties WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findBySessionId, create, deleteById };
