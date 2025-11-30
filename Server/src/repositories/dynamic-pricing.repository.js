const db = require('../db/db');

async function findAll() {
  const rows = await db.query('SELECT * FROM dynamic_pricing WHERE is_active = 1');
  return rows;
}

async function findById(id) {
  const rows = await db.query('SELECT * FROM dynamic_pricing WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create(p) {
  await db.query(
    'INSERT INTO dynamic_pricing (category_id, type, percentage, time_start, time_end, weekday, date_start, date_end, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [p.category_id, p.type, p.percentage, p.time_start || null, p.time_end || null, p.weekday || null, p.date_start || null, p.date_end || null, p.is_active ? 1 : 0]
  );
  const rows = await db.query('SELECT * FROM dynamic_pricing WHERE id = LAST_INSERT_ID()');
  return rows[0] || null;
}

async function update(id, p) {
  await db.query(
    'UPDATE dynamic_pricing SET category_id = ?, type = ?, percentage = ?, time_start = ?, time_end = ?, weekday = ?, date_start = ?, date_end = ?, is_active = ? WHERE id = ?',
    [p.category_id, p.type, p.percentage, p.time_start || null, p.time_end || null, p.weekday || null, p.date_start || null, p.date_end || null, p.is_active ? 1 : 0, id]
  );
  return await findById(id);
}

async function deleteById(id) {
  // Logical delete: mark as inactive
  const result = await db.query('UPDATE dynamic_pricing SET is_active = 0 WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, deleteById };
