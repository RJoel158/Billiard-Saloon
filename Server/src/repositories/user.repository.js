const db = require('../db/db');
const schema = require('../db/schema');

function _hasActive() {
  return schema.hasColumn('users', 'is_active');
}

async function findById(id) {
  const extra = _hasActive() ? ' AND is_active = 1' : '';
  const rows = await db.query(`SELECT id, role_id, first_name, last_name, email, phone, created_at FROM users WHERE id = ?${extra}`, [id]);
  return rows[0] || null;
}

async function findByEmail(email) {
  const extra = _hasActive() ? ' AND is_active = 1' : '';
  const rows = await db.query(`SELECT id, role_id, first_name, last_name, email FROM users WHERE email = ?${extra}`, [email]);
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
  const extra = _hasActive() ? ' WHERE is_active = 1' : '';
  const rows = await db.query(`SELECT id, role_id, first_name, last_name, email, phone, created_at FROM users${extra}`);
  return rows;
}

async function update(id, user) {
  await db.query(
    'UPDATE users SET role_id = ?, first_name = ?, last_name = ?, email = ?, password_hash = ?, phone = ? WHERE id = ?',
    [user.role_id, user.first_name, user.last_name, user.email, user.password_hash, user.phone, id]
  );
  return await findById(id);
}

async function deleteById(id) {
  if (_hasActive()) {
    const result = await db.query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
  const result = await db.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findById, findByEmail, create, findAll, update, deleteById };
