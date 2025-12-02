const userRepo = require('../repositories/user.repository');
const ApiError = require('../middlewares/apiError');

async function getUser(id) {
  const user = await userRepo.findById(id);
  if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  return user;
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

module.exports = { getUser, createUser, getAllUsers, updateUser, deleteUser };
