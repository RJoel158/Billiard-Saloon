const userRepo = require('../repositories/user.repository');
const ApiError = require('../middlewares/apiError');
const bcrypt = require('bcryptjs');

async function getUser(id) {
  const user = await userRepo.findById(id);
  if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  return user;
}

async function createUser(data) {
  const existing = await userRepo.findByEmail(data.email);
  if (existing) throw new ApiError(409, 'EMAIL_EXISTS', 'Email ya registrado');
  // Accept either `password` (plain) or `password_hash` (already hashed)
  const plain = data.password || null;
  const providedHash = data.password_hash || null;
  const hash = providedHash ? providedHash : (plain ? await bcrypt.hash(plain, 10) : '');
  const toCreate = { ...data, password_hash: hash };
  const user = await userRepo.create(toCreate);
  return user;
}

async function promoteUser(id) {
  const existing = await userRepo.findById(id);
  if (!existing) throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  // set role_id = 1 (admin)
  const updated = await userRepo.update(id, { role_id: 1, first_name: existing.first_name, last_name: existing.last_name, email: existing.email, password_hash: existing.password_hash, phone: existing.phone });
  return updated;
}

async function getAllUsers() {
  return await userRepo.findAll();
}

async function searchUsers(searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    return [];
  }
  return await userRepo.searchByName(searchTerm.trim());
}

async function updateUser(id, data) {
  const existing = await userRepo.findById(id);
  if (!existing) throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  
  // Merge with existing data to avoid undefined values in query params
  const payload = {
    role_id: data.role_id !== undefined ? data.role_id : existing.role_id,
    first_name: data.first_name !== undefined ? data.first_name : existing.first_name,
    last_name: data.last_name !== undefined ? data.last_name : existing.last_name,
    email: data.email !== undefined ? data.email : existing.email,
    password_hash: data.password_hash !== undefined ? data.password_hash : existing.password_hash,
    phone: data.phone !== undefined ? data.phone : existing.phone,
  };
  
  const updated = await userRepo.update(id, payload);
  return updated;
}

async function deleteUser(id) {
  const existing = await userRepo.findById(id);
  if (!existing) throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  await userRepo.deleteById(id);
  return true;
}

module.exports = { getUser, createUser, getAllUsers, searchUsers, updateUser, deleteUser };
