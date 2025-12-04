const repository = require('../repositories/session.repository');

async function getAllSessions() {
  return await repository.findAll();
}

async function getAllSessionsPaged(limit, offset) {
  const sessions = await repository.findAllPaged(limit, offset);
  const total = await repository.countTotal();
  return { sessions, total };
}

async function getSessionById(id) {
  const s = await repository.findById(id);
  if (!s) throw new Error('Session not found');
  return s;
}

async function createSession(data) {
  if (!data.table_id || !data.start_time) throw new Error('table_id and start_time are required');
  return await repository.create(data);
}

async function updateSession(id, data) {
  await getSessionById(id);
  return await repository.update(id, data);
}

async function deleteSession(id) {
  await getSessionById(id);
  return await repository.deleteById(id);
}

module.exports = { getAllSessions, getAllSessionsPaged, getSessionById, createSession, updateSession, deleteSession };
