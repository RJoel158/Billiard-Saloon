const repository = require('../repositories/session.repository');
const paymentRepository = require('../repositories/payment.repository');
const tableRepository = require('../repositories/billiard-table.repository');
const categoryRepository = require('../repositories/table-category.repository');

async function getAllSessions() {
  return await repository.findAll();
}

async function getAllSessionsPaged(limit, offset) {
  const sessions = await repository.findAllPaged(limit, offset);
  const total = await repository.countTotal();
  return { sessions, total };
}

async function getActiveSessions() {
  return await repository.findActive();
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

async function finalizeSession(id, data = {}) {
  const session = await getSessionById(id);
  
  // Obtener información de la mesa y categoría para calcular precio
  const table = await tableRepository.findById(session.table_id);
  const category = await categoryRepository.findById(table.category_id);
  
  const endTime = new Date();
  const startTime = new Date(session.start_time);
  const durationHours = (endTime - startTime) / (1000 * 60 * 60);
  
  // Calcular costo base
  let finalCost = durationHours * category.base_price;
  
  // Agregar multa si existe
  if (data.penalty_amount) {
    finalCost += Number(data.penalty_amount);
  }
  
  // Actualizar sesión
  const updatedSession = await repository.update(id, {
    end_time: endTime.toISOString(),
    final_cost: finalCost,
    status: 2 // cerrada
  });
  
  // Crear registro de pago automáticamente
  await paymentRepository.create({
    session_id: id,
    amount: finalCost,
    method: data.payment_method || 1 // 1=efectivo por defecto
  });
  
  return updatedSession;
}

async function deleteSession(id) {
  await getSessionById(id);
  return await repository.deleteById(id);
}

module.exports = { 
  getAllSessions, 
  getAllSessionsPaged, 
  getActiveSessions,
  getSessionById, 
  createSession, 
  updateSession, 
  finalizeSession,
  deleteSession 
};
