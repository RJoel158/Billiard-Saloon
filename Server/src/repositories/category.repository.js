const db = require("../db");

async function findAll() {
  const rows = await db.query(
    "SELECT id, name, description, base_price, status FROM table_categories"
  );
  return rows;
}

async function findById(id) {
  const rows = await db.query(
    "SELECT id, name, description, base_price, status FROM table_categories WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function findByName(name) {
  const rows = await db.query(
    "SELECT id, name, description, base_price, status FROM table_categories WHERE name = ?",
    [name]
  );
  return rows[0] || null;
}

async function create(category) {
  await db.query(
    "INSERT INTO table_categories (name, description, base_price, status) VALUES (?, ?, ?, ?)",
    [
      category.name,
      category.description,
      category.base_price,
      category.status || 1,
    ]
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
