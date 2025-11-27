const userRepo = require('../repositories/user.repository');
const ApiError = require('../middlewares/apiError');
const bcrypt = require('bcrypt');


async function getAllUsers() {
  const users = await userRepo.findAll();
  if (!users || users.length === 0) {
    throw new ApiError(404, 'NO_USERS', 'No hay usuarios registrados');
  }
  return users;
}


async function getUser(id) {
  const user = await userRepo.findById(id);
  if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  return user;
}



async function createUser(data) {
  if (!data.first_name || !data.last_name || !data.email || !data.password) {
    throw new ApiError(400, 'INVALID_DATA', 'Faltan campos requeridos');
  }

  const existing = await userRepo.findByEmail(data.email);
  if (existing) throw new ApiError(409, 'EMAIL_EXISTS', 'Email ya registrado');
  
  const password_hash = await bcrypt.hash(data.password, 10);

  const userData = {
    role_id: data.role_id || 2,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    password_hash,
    phone: data.phone || null,
  };

  const user = await userRepo.create(userData);
  return user;
}


async function updateUser(id, data) {
  const user = await userRepo.findById(id);
  if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');

  if (data.email && data.email !== user.email) {
    const existing = await userRepo.findByEmail(data.email);
    if (existing) throw new ApiError(409, 'EMAIL_EXISTS', 'El email ya está registrado');
  }

  const updatedUser = await userRepo.update(id, data);
  return updatedUser;
}


async function deleteUser(id) {
  const user = await userRepo.findById(id);
  if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');

  await userRepo.delete(id);
  return true;
}



module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,

};
