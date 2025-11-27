const db = require('../db/db');

async function create(user) {
  await db.query(
    'INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?, ?)',
    [user.role_id, user.first_name, user.last_name, user.email, user.password_hash, user.phone || null]
  );
  return await findByEmail(user.email);
}


async function findAll() {
  const rows = await db.query(
    'SELECT id, role_id, first_name, last_name, email, phone, created_at FROM users'
  );
  return rows;
}


async function findById(id) {
  const rows = await db.query(
    'SELECT id, role_id, first_name, last_name, email, phone, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function update(id, user) {
  const allowedFields = ['role_id', 'first_name', 'last_name', 'phone'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (user[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(user[field]);
    }
  }

  if (updates.length === 0) return null;

  values.push(id);
  await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
  return await findById(id);
}


async function delete_(id) {
  await db.query('DELETE FROM users WHERE id = ?', [id]);
  return true;
}

// READ - Obtener usuario por email con contraseña (para login)
async function findByEmailWithPassword(email) {
  const rows = await db.query(
    'SELECT id, role_id, first_name, last_name, email, password_hash, phone, created_at FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}


module.exports = {
  create,
  findAll,
  findById,
  findByEmailWithPassword,
  update,
  delete: delete_,
};
