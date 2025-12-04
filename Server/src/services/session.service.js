const repository = require('../repositories/session.repository');
const tableRepo = require('../repositories/billiard-table.repository');
const penaltyRepo = require('../repositories/penalty.repository');
const pricingCalculator = require('./pricing-calculator.service');

async function getAllSessions() {
  return await repository.findAll();
}

async function getSessionById(id) {
  const s = await repository.findById(id);
  if (!s) throw new Error('Session not found');
  return s;
}

async function createSession(data) {
  if (!data.table_id || !data.start_time) throw new Error('table_id and start_time are required');
  
  // Verify table exists and get category
  const table = await tableRepo.findById(data.table_id);
  if (!table) throw new Error('Table not found');
  
  // Check table availability
  if (table.status === 2) {
    throw new Error('Table is already occupied');
  }
  
  if (table.status === 3) {
    throw new Error('Table is under maintenance');
  }
  
  // Create session
  const session = await repository.create(data);
  
  // Update table status to occupied
  await tableRepo.update(data.table_id, {
    ...table,
    status: 2,
  });
  
  return session;
}

async function updateSession(id, data) {
  await getSessionById(id);
  return await repository.update(id, data);
}

async function closeSession(id, endTime = null) {
  const session = await getSessionById(id);
  
  if (session.status !== 1) {
    throw new Error('Session is not active');
  }
  
  const table = await tableRepo.findById(session.table_id);
  if (!table) throw new Error('Table not found');
  
  const end = endTime || new Date();
  
  // Calculate final cost using dynamic pricing
  const pricing = await pricingCalculator.calculateSessionPrice(
    table.category_id,
    session.start_time,
    end
  );
  
  // Get all penalties for this session
  const penalties = await penaltyRepo.findBySessionId(id);
  const totalPenalties = penalties.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  
  const finalCost = pricing.finalPrice + totalPenalties;
  
  // Update session
  const updated = await repository.update(id, {
    ...session,
    end_time: end,
    final_cost: finalCost,
    status: 2, // closed
  });
  
  // Free up the table
  await tableRepo.update(session.table_id, {
    ...table,
    status: 1, // available
  });
  
  return {
    session: updated,
    pricing,
    penalties,
    totalPenalties,
    finalCost,
  };
}

async function getActiveSessions() {
  const all = await repository.findAll();
  return all.filter(s => s.status === 1);
}

async function deleteSession(id) {
  await getSessionById(id);
  return await repository.deleteById(id);
}

module.exports = { 
  getAllSessions, 
  getSessionById, 
  createSession, 
  updateSession, 
  closeSession,
  getActiveSessions,
  deleteSession 
};
