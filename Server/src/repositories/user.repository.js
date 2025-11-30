const db = require('../db/db');

async function findById(id) {
  const rows = await db.query('SELECT id, role_id, first_name, last_name, email, phone, created_at FROM users WHERE id = ? AND is_active = 1', [id]);
  return rows[0] || null;
}

async function findByEmail(email) {
  const rows = await db.query('SELECT id, role_id, first_name, last_name, email FROM users WHERE email = ? AND is_active = 1', [email]);
  return rows[0] || null;
}

async function create(user) {
  await db.query(
    'INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?, ?)',
    [user.role_id || 2, user.first_name, user.last_name, user.email, user.password_hash || '', user.phone || null]
  );
  const rows = await db.query('SELECT id, role_id, first_name, last_name, email, phone, created_at FROM users WHERE id = LAST_INSERT_ID()');
  return rows[0] || null;
}

async function findAll() {
  const rows = await db.query('SELECT id, role_id, first_name, last_name, email, phone, created_at FROM users WHERE is_active = 1');
  return rows;
}

async function update(id, user) {
  await db.query('UPDATE users SET role_id = ?, first_name = ?, last_name = ?, email = ?, password_hash = ?, phone = ? WHERE id = ?', [user.role_id, user.first_name, user.last_name, user.email, user.password_hash || '', user.phone || null, id]);
  return await findById(id);
}

async function deleteById(id) {
  const result = await db.query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findById, findByEmail, create, findAll, update, deleteById };
