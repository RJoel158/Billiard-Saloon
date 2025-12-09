const repository = require('../repositories/billiard-table.repository');

async function getAllTables() {
  return await repository.findAll();
}

async function getTableById(id) {
  const t = await repository.findById(id);
  if (!t) throw new Error('Table not found');
  return t;
}

async function createTable(data) {
  if (!data.category_id || !data.code) throw new Error('category_id and code are required');
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

module.exports = { getAllTables, getTableById, createTable, updateTable, deleteTable };
