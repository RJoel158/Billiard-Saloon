const db = require("../db/db.js");

async function findAll() {
  const rows = await db.query(
    "SELECT id, name, description, base_price, status FROM table_categories WHERE status = 1"
  );
  return rows;
}

async function findById(id) {
  const rows = await db.query(
    "SELECT id, name, description, base_price, status FROM table_categories WHERE id = ? AND status = 1",
    [id]
  );
  return rows[0] || null;
}

async function findByName(name) {
  const rows = await db.query(
    "SELECT id, name, description, base_price, status FROM table_categories WHERE name = ? AND status = 1",
    [name]
  );
  return rows[0] || null;
}

async function create(category) {
  await db.query(
    "INSERT INTO table_categories (name, description, base_price) VALUES (?, ?, ?)",
    [category.name, category.description, category.base_price]
  );
  const rows = await db.query(
    "SELECT id, name, description, base_price, status FROM table_categories WHERE id = LAST_INSERT_ID()"
  );
  return rows[0] || null;
}

async function update(id, category) {
  await db.query(
    "UPDATE table_categories SET name = ?, description = ?, base_price = ?, status = ? WHERE id = ?",
    [
      category.name,
      category.description,
      category.base_price,
      category.status,
      id,
    ]
  );
  return await findById(id);
}

async function deleteById(id) {
  const result = await db.query(
    "UPDATE table_categories SET status = 0 WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByName, create, update, deleteById };
