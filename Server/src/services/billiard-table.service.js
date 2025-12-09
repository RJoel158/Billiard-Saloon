const repository = require("../repositories/billiard-table.repository");

async function getAllTables() {
  return await repository.findAll();
}

async function getAllTablesPaged(limit, offset) {
  const tables = await repository.findAllPaged(limit, offset);
  const total = await repository.countTotal();
  return { tables, total };
}

async function getTableById(id) {
  const t = await repository.findById(id);
  if (!t) throw new Error("Table not found");
  return t;
}

async function createTable(data) {
  // basic validation
  if (!data.category_id || !data.code)
    throw new Error("category_id and code are required");
  return await repository.create(data);
}

async function updateTable(id, data) {
  await getTableById(id);
  return await repository.update(id, data);
}

async function deleteTable(id) {
  await getTableById(id);
  return await repository.deleteById(id);
}

async function markTableAsOccupied(id) {
  await getTableById(id);
  const success = await repository.markAsOccupied(id);
  if (!success) throw new Error("Could not mark table as occupied");
  return await repository.findById(id);
}

async function markTableAsReserved(id) {
  await getTableById(id);
  const success = await repository.markAsReserved(id);
  if (!success) throw new Error("Could not mark table as reserved");
  return await repository.findById(id);
}

module.exports = {
  getAllTables,
  getAllTablesPaged,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  markTableAsOccupied,
  markTableAsReserved,
};
