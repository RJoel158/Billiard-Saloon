const db = require('../db/db');

async function findAll() {
  const rows = await db.query('SELECT id, name FROM roles WHERE is_active = 1');
  return rows;
}

async function findById(id) {
  const rows = await db.query('SELECT id, name FROM roles WHERE id = ? AND is_active = 1', [id]);
  return rows[0] || null;
}

async function findByName(name) {
  const rows = await db.query('SELECT id, name FROM roles WHERE name = ? AND is_active = 1', [name]);
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
  const result = await db.query('UPDATE roles SET is_active = 0 WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByName, create, update, deleteById };
