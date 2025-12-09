const db = require('../db/db');
const schema = require('../db/schema');

function _hasActive() {
  return schema.hasColumn('dynamic_pricing', 'is_active');
}

async function findAll() {
  const extra = _hasActive() ? ' WHERE is_active = 1' : '';
  const rows = await db.query(`SELECT * FROM dynamic_pricing${extra}`);
  return rows;
}

async function findAllPaged(limit, offset) {
  const extra = _hasActive() ? ' WHERE is_active = 1' : '';
  const rows = await db.query(`SELECT * FROM dynamic_pricing${extra} ORDER BY id DESC LIMIT ? OFFSET ?`, [limit, offset]);
  return rows;
}

async function countTotal() {
  const extra = _hasActive() ? ' WHERE is_active = 1' : '';
  const rows = await db.query(`SELECT COUNT(*) as total FROM dynamic_pricing${extra}`);
  return rows[0]?.total || 0;
}

async function findById(id) {
  const rows = await db.query('SELECT * FROM dynamic_pricing WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create(p) {
  if (_hasActive()) {
    await db.query(
      'INSERT INTO dynamic_pricing (category_id, type, percentage, time_start, time_end, weekday, date_start, date_end, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [p.category_id, p.type, p.percentage, p.time_start || null, p.time_end || null, p.weekday || null, p.date_start || null, p.date_end || null, p.is_active ? 1 : 0]
    );
  } else {
    await db.query(
      'INSERT INTO dynamic_pricing (category_id, type, percentage, time_start, time_end, weekday, date_start, date_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [p.category_id, p.type, p.percentage, p.time_start || null, p.time_end || null, p.weekday || null, p.date_start || null, p.date_end || null]
    );
  }
  const rows = await db.query('SELECT * FROM dynamic_pricing WHERE id = LAST_INSERT_ID()');
  return rows[0] || null;
}

async function update(id, p) {
  if (_hasActive()) {
    await db.query(
      'UPDATE dynamic_pricing SET category_id = ?, type = ?, percentage = ?, time_start = ?, time_end = ?, weekday = ?, date_start = ?, date_end = ?, is_active = ? WHERE id = ?',
      [p.category_id, p.type, p.percentage, p.time_start || null, p.time_end || null, p.weekday || null, p.date_start || null, p.date_end || null, p.is_active ? 1 : 0, id]
    );
  } else {
    await db.query(
      'UPDATE dynamic_pricing SET category_id = ?, type = ?, percentage = ?, time_start = ?, time_end = ?, weekday = ?, date_start = ?, date_end = ? WHERE id = ?',
      [p.category_id, p.type, p.percentage, p.time_start || null, p.time_end || null, p.weekday || null, p.date_start || null, p.date_end || null, id]
    );
  }
  return await findById(id);
}

async function deleteById(id) {
  if (_hasActive()) {
    const result = await db.query('UPDATE dynamic_pricing SET is_active = 0 WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
  const result = await db.query('DELETE FROM dynamic_pricing WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findAllPaged, countTotal, findById, create, update, deleteById };
