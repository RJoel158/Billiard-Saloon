const db = require('../db/db');
const schema = require('../db/schema');

function _hasActive() {
  return schema.hasColumn('roles', 'is_active');
}

async function findAll() {
  const extra = _hasActive() ? ' WHERE is_active = 1' : '';
  const rows = await db.query(`SELECT id, name FROM roles${extra}`);
  return rows;
}

async function findById(id) {
  const extra = _hasActive() ? ' AND is_active = 1' : '';
  const rows = await db.query(`SELECT id, name FROM roles WHERE id = ?${extra}`, [id]);
  return rows[0] || null;
}

async function findByName(name) {
  const extra = _hasActive() ? ' AND is_active = 1' : '';
  const rows = await db.query(`SELECT id, name FROM roles WHERE name = ?${extra}`, [name]);
  return rows[0] || null;
}

async function create(role) {
  await db.query('INSERT INTO roles (name) VALUES (?)', [role.name]);
  const rows = await db.query('SELECT id, name FROM roles WHERE id = LAST_INSERT_ID()');
  return rows[0] || null;
}

async function update(id, role) {
  await db.query('UPDATE roles SET name = ? WHERE id = ?', [role.name, id]);
  return await findById(id);
}

async function deleteById(id) {
  if (_hasActive()) {
    const result = await db.query('UPDATE roles SET is_active = 0 WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
  const result = await db.query('DELETE FROM roles WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByName, create, update, deleteById };
