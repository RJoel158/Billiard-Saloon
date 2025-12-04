const userRepo = require('../repositories/user.repository');
const ApiError = require('../middlewares/apiError');

async function getUser(id) {
  const user = await userRepo.findById(id);
  if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  return user;
}

async function getUserByEmail(email) {
  const user = await userRepo.findByEmail(email);
  return user; // Retorna null si no existe
}

async function createUser(data) {
  const existing = await userRepo.findByEmail(data.email);
  if (existing) throw new ApiError(409, 'EMAIL_EXISTS', 'Email ya registrado');
  const user = await userRepo.create(data);
  return user;
}

async function getAllUsers() {
  return await userRepo.findAll();
}

async function getAllUsersPaged(limit, offset) {
  const users = await userRepo.findAllPaged(limit, offset);
  const total = await userRepo.countTotal();
  return { users, total };
}

async function updateUser(id, data) {
  const existing = await userRepo.findById(id);
  if (!existing) throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  const updated = await userRepo.update(id, data);
  return updated;
}

async function deleteUser(id) {
  const existing = await userRepo.findById(id);
  if (!existing) throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  await userRepo.deleteById(id);
  return true;
}

module.exports = { getUser, getUserByEmail, createUser, getAllUsers, getAllUsersPaged, updateUser, deleteUser };
