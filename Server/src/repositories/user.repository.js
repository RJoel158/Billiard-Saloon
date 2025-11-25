const db = require('../db');

async function findById(id) {
  const rows = await db.query('SELECT id, name, email FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findByEmail(email) {
  const rows = await db.query('SELECT id, name, email FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function create(user) {
  await db.query('INSERT INTO users (name, email) VALUES (?, ?)', [user.name, user.email]);
  const rows = await db.query('SELECT id, name, email FROM users WHERE id = LAST_INSERT_ID()');
  return rows[0] || null;
}

module.exports = { findById, findByEmail, create };
