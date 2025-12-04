const db = require('../db/db');
const schema = require('../db/schema');

function _hasActive() {
  return schema.hasColumn('users', 'is_active');
}

async function findById(id) {
  const extra = _hasActive() ? ' AND is_active = 1' : '';
  const rows = await db.query(`SELECT id, role_id, first_name, last_name, email, password_hash, phone, created_at, password_changed, reset_code, reset_code_expiry FROM users WHERE id = ?${extra}`, [id]);
  return rows[0] || null;
}

async function findByEmail(email) {
  const extra = _hasActive() ? ' AND is_active = 1' : '';
  const rows = await db.query(`SELECT id, role_id, first_name, last_name, email, password_changed FROM users WHERE email = ?${extra}`, [email]);
  return rows[0] || null;
}

async function create(user) {
  await db.query(
    'INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone, password_changed) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [user.role_id || 2, user.first_name, user.last_name, user.email, user.password_hash || '', user.phone || null, user.password_changed || 0]
  );
  const rows = await db.query('SELECT id, role_id, first_name, last_name, email, phone, created_at, password_changed FROM users WHERE id = LAST_INSERT_ID()');
  return rows[0] || null;
}

async function findAll() {
  const extra = _hasActive() ? ' WHERE is_active = 1' : '';
  const rows = await db.query(`SELECT id, role_id, first_name, last_name, email, phone, created_at, password_changed FROM users${extra}`);
  return rows;
}

async function update(id, user) {
  const fields = [];
  const values = [];
  
  if (user.role_id !== undefined) { fields.push('role_id = ?'); values.push(user.role_id); }
  if (user.first_name !== undefined) { fields.push('first_name = ?'); values.push(user.first_name); }
  if (user.last_name !== undefined) { fields.push('last_name = ?'); values.push(user.last_name); }
  if (user.email !== undefined) { fields.push('email = ?'); values.push(user.email); }
  if (user.password_hash !== undefined) { fields.push('password_hash = ?'); values.push(user.password_hash); }
  if (user.phone !== undefined) { fields.push('phone = ?'); values.push(user.phone); }
  if (user.password_changed !== undefined) { fields.push('password_changed = ?'); values.push(user.password_changed); }
  if (user.reset_code !== undefined) { fields.push('reset_code = ?'); values.push(user.reset_code); }
  if (user.reset_code_expiry !== undefined) { fields.push('reset_code_expiry = ?'); values.push(user.reset_code_expiry); }
  
  if (fields.length === 0) return await findById(id);
  
  values.push(id);
  await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
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
