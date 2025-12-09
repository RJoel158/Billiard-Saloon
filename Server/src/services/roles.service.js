const repository = require('../repositories/roles.repository');

async function getAllRoles() {
  return await repository.findAll();
}

async function getAllRolesPaged(limit, offset) {
  const roles = await repository.findAllPaged(limit, offset);
  const total = await repository.countTotal();
  return { roles, total };
}

async function getRoleById(id) {
  const r = await repository.findById(id);
  if (!r) throw new Error('Role not found');
  return r;
}

async function createRole(data) {
  const existing = await repository.findByName(data.name);
  if (existing) throw new Error('Role already exists');
  return await repository.create(data);
}

async function updateRole(id, data) {
  await getRoleById(id);
  return await repository.update(id, data);
}

async function deleteRole(id) {
  await getRoleById(id);
  return await repository.deleteById(id);
}

module.exports = { getAllRoles, getAllRolesPaged, getRoleById, createRole, updateRole, deleteRole };
