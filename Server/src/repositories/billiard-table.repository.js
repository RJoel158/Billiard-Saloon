const db = require("../db/db");

async function findAll() {
  const rows = await db.query(
    "SELECT id, category_id, code, description, status FROM billiard_tables"
  );
  return rows;
}

async function findAllPaged(limit, offset) {
  const rows = await db.query(
    "SELECT id, category_id, code, description, status FROM billiard_tables ORDER BY id DESC LIMIT ? OFFSET ?",
    [limit, offset]
  );
  return rows;
}

async function countTotal() {
  const rows = await db.query("SELECT COUNT(*) as total FROM billiard_tables");
  return rows[0]?.total || 0;
}

async function findById(id) {
  const rows = await db.query(
    "SELECT id, category_id, code, description, status FROM billiard_tables WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function create(table) {
  await db.query(
    "INSERT INTO billiard_tables (category_id, code, description, status) VALUES (?, ?, ?, ?)",
    [
      table.category_id,
      table.code,
      table.description || null,
      table.status || 1,
    ]
  );
  const rows = await db.query(
    "SELECT id, category_id, code, description, status FROM billiard_tables WHERE id = LAST_INSERT_ID()"
  );
  return rows[0] || null;
}

async function update(id, table) {
  await db.query(
    "UPDATE billiard_tables SET category_id = ?, code = ?, description = ?, status = ? WHERE id = ?",
    [table.category_id, table.code, table.description, table.status, id]
  );
  return await findById(id);
}

async function updateStatus(id, status) {
  await db.query('UPDATE billiard_tables SET status = ? WHERE id = ?', [status, id]);
  return await findById(id);
}

async function deleteById(id) {
  // Logical delete: update status to 0
  const result = await db.query(
    "UPDATE billiard_tables SET status = 0 WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findAllPaged,
  countTotal,
  findById,
  create,
  update,
  updateStatus,
  deleteById,
};
