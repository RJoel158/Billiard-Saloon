const db = require("../db/db.js");

async function findAll() {
  const rows = await db.query(
    "SELECT id, name, description, base_price FROM table_categories"
  );
  return rows;
}

async function findById(id) {
  const rows = await db.query(
    "SELECT id, name, description, base_price FROM table_categories WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function findByName(name) {
  const rows = await db.query(
    "SELECT id, name, description, base_price FROM table_categories WHERE name = ?",
    [name]
  );
  return rows[0] || null;
}

async function findByNameLike(term) {
  const like = `%${term}%`;
  const rows = await db.query(
    "SELECT id, name, description, base_price FROM table_categories WHERE name LIKE ?",
    [like]
  );
  return rows;
}

async function findAllPaged(limit, offset) {
  const rows = await db.query(
    "SELECT id, name, description, base_price FROM table_categories ORDER BY name LIMIT ? OFFSET ?",
    [limit, offset]
  );
  return rows;
}

async function countActive() {
  const rows = await db.query("SELECT COUNT(*) as cnt FROM table_categories");
  return rows[0].cnt || 0;
}

async function countTotal() {
  const rows = await db.query("SELECT COUNT(*) as total FROM table_categories");
  return rows[0]?.total || 0;
}

async function create(category) {
  await db.query(
    "INSERT INTO table_categories (name, description, base_price) VALUES (?, ?, ?)",
    [category.name, category.description, category.base_price]
  );
  const rows = await db.query(
    "SELECT id, name, description, base_price FROM table_categories WHERE id = LAST_INSERT_ID()"
  );
  return rows[0] || null;
}

async function update(id, category) {
  await db.query(
    "UPDATE table_categories SET name = ?, description = ?, base_price = ? WHERE id = ?",
    [category.name, category.description, category.base_price, id]
  );
  return await findById(id);
}

async function deleteById(id) {
  const result = await db.query("DELETE FROM table_categories WHERE id = ?", [
    id,
  ]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findByName,
  findByNameLike,
  findAllPaged,
  countActive,
  countTotal,
  create,
  update,
  deleteById,
};
