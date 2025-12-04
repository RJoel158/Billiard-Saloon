const penaltyRepo = require('../repositories/penalty.repository');
const sessionRepo = require('../repositories/session.repository');
const ApiError = require('../middlewares/apiError');

async function getAllPenalties() {
  return await penaltyRepo.findAll();
}

async function getPenalty(id) {
  const penalty = await penaltyRepo.findById(id);
  if (!penalty) throw new ApiError(404, 'PENALTY_NOT_FOUND', 'Multa no encontrada');
  return penalty;
}

async function getPenaltiesBySession(sessionId) {
  const session = await sessionRepo.findById(sessionId);
  if (!session) throw new ApiError(404, 'SESSION_NOT_FOUND', 'Sesión no encontrada');
  return await penaltyRepo.findBySessionId(sessionId);
}

async function createPenalty(data) {
  if (!data.session_id || !data.amount || !data.reason || !data.applied_by) {
    throw new ApiError(400, 'INVALID_DATA', 'session_id, amount, reason y applied_by son requeridos');
  }
  
  const session = await sessionRepo.findById(data.session_id);
  if (!session) throw new ApiError(404, 'SESSION_NOT_FOUND', 'Sesión no encontrada');
  
  const penalty = await penaltyRepo.create(data);
  return penalty;
}

async function deletePenalty(id) {
  const existing = await penaltyRepo.findById(id);
  if (!existing) throw new ApiError(404, 'PENALTY_NOT_FOUND', 'Multa no encontrada');
  await penaltyRepo.deleteById(id);
  return true;
}

module.exports = { 
  getAllPenalties, 
  getPenalty, 
  getPenaltiesBySession, 
  createPenalty, 
  deletePenalty 
};
