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

module.exports = { getUser, createUser };
