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
  
  // Verificar que la mesa no tenga una sesión activa
  const activeSession = await repository.findActiveByTableId(data.table_id);
  if (activeSession) {
    throw new Error('La mesa ya tiene una sesión activa. Finalice la sesión actual antes de iniciar una nueva.');
  }
  
  // Actualizar estado de la mesa a ocupada (2)
  await tableRepository.updateStatus(data.table_id, 2);
  
  return await repository.create(data);
}

async function updateSession(id, data) {
  await getSessionById(id);
  return await repository.update(id, data);
}

async function finalizeSession(id, data = {}) {
  try {
    console.log('=== Finalizing Session ===');
    console.log('Session ID:', id);
    console.log('Data:', JSON.stringify(data));
    
    const session = await getSessionById(id);
    console.log('Session found:', { id: session.id, start_time: session.start_time, table_id: session.table_id });
    
    // Obtener información de la mesa y categoría para calcular precio
    const table = await tableRepository.findById(session.table_id);
    console.log('Table found:', { id: table.id, category_id: table.category_id });
    
    const category = await categoryRepository.findById(table.category_id);
    console.log('Category found:', { id: category.id, base_price: category.base_price });
    
    const endTime = new Date();
    const startTime = new Date(session.start_time);
    console.log('Start time:', startTime.toISOString());
    console.log('End time:', endTime.toISOString());
    
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = Math.max(0, durationMs / (1000 * 60 * 60)); // Mínimo 0 horas
    console.log('Duration:', durationHours, 'hours');
    
    // Calcular costo base (mínimo 0)
    let finalCost = Math.max(0, durationHours * category.base_price);
    console.log('Base cost:', finalCost);
    
    // Agregar penalización si existe
    if (data.penalty_amount && !isNaN(data.penalty_amount)) {
      finalCost += Number(data.penalty_amount);
      console.log('Final cost with penalty:', finalCost);
    }
    
    // Convertir end_time a formato MySQL: YYYY-MM-DD HH:MM:SS
    const endTimeMysql = endTime.toISOString().slice(0, 19).replace('T', ' ');
    console.log('End time MySQL format:', endTimeMysql);
    
    // Actualizar sesión (mantener todos los campos existentes)
    const updatedSession = await repository.update(id, {
      user_id: session.user_id,
      reservation_id: session.reservation_id,
      table_id: session.table_id,
      start_time: session.start_time,
      end_time: endTimeMysql,
      session_type: session.session_type,
      final_cost: finalCost,
      status: 2 // cerrada
    });
    console.log('Session updated');
    
    // Crear registro de pago automáticamente
    await paymentRepository.create({
      session_id: id,
      amount: finalCost,
      method: data.payment_method || 1 // 1=efectivo por defecto
    });
    console.log('Payment created');
    
    // Actualizar estado de la mesa a disponible (1)
    await tableRepository.updateStatus(session.table_id, 1);
    console.log('Table status updated to available');
    
    return updatedSession;
  } catch (error) {
    console.error('Error in finalizeSession:', error);
    throw error;
  }
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
