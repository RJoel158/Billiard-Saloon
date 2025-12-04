const repository = require('../repositories/reservation.repository');
const tableRepo = require('../repositories/billiard-table.repository');
const db = require('../db/db');

async function getAllReservations() {
  return await repository.findAll();
}

async function getReservationById(id) {
  const r = await repository.findById(id);
  if (!r) throw new Error('Reservation not found');
  return r;
}

async function createReservation(data) {
  // basic validation
  if (!data.user_id || !data.table_id || !data.reservation_date || !data.start_time || !data.end_time) {
    throw new Error('Missing required reservation fields');
  }

  // Verify table exists
  const table = await tableRepo.findById(data.table_id);
  if (!table) {
    throw new Error('Table not found');
  }

  // Check if table is available for the requested time
  const isAvailable = await checkTableAvailability(
    data.table_id,
    data.start_time,
    data.end_time
  );

  if (!isAvailable) {
    throw new Error('Table is not available for the requested time');
  }

  // Create reservation with pending status
  return await repository.create({
    ...data,
    status: 1, // pending
  });
}

async function updateReservation(id, data) {
  await getReservationById(id);
  return await repository.update(id, data);
}

async function confirmReservation(id) {
  const reservation = await getReservationById(id);
  
  if (reservation.status !== 1) {
    throw new Error('Only pending reservations can be confirmed');
  }

  return await repository.update(id, {
    ...reservation,
    status: 2, // confirmed
  });
}

async function cancelReservation(id) {
  const reservation = await getReservationById(id);
  
  if (reservation.status === 3) {
    throw new Error('Reservation is already cancelled');
  }

  return await repository.update(id, {
    ...reservation,
    status: 3, // cancelled
  });
}

async function getPendingReservations() {
  const all = await repository.findAll();
  return all.filter(r => r.status === 1);
}

async function getUserReservations(userId) {
  const all = await repository.findAll();
  return all.filter(r => r.user_id === userId);
}

async function checkTableAvailability(tableId, startTime, endTime, excludeReservationId = null) {
  // Check for overlapping reservations (pending or confirmed)
  let query = `
    SELECT id FROM reservations 
    WHERE table_id = ? 
    AND status IN (1, 2)
    AND (
      (start_time <= ? AND end_time > ?)
      OR (start_time < ? AND end_time >= ?)
      OR (start_time >= ? AND end_time <= ?)
    )
  `;
  
  const params = [tableId, startTime, startTime, endTime, endTime, startTime, endTime];
  
  if (excludeReservationId) {
    query += ' AND id != ?';
    params.push(excludeReservationId);
  }

  const conflicts = await db.query(query, params);
  
  // Check for active sessions during the requested time
  const sessionQuery = `
    SELECT id FROM sessions
    WHERE table_id = ?
    AND status = 1
    AND start_time < ?
    AND (end_time IS NULL OR end_time > ?)
  `;
  
  const sessionConflicts = await db.query(sessionQuery, [tableId, endTime, startTime]);
  
  return conflicts.length === 0 && sessionConflicts.length === 0;
}

async function deleteReservation(id) {
  await getReservationById(id);
  return await repository.deleteById(id);
}

module.exports = { 
  getAllReservations, 
  getReservationById, 
  createReservation, 
  updateReservation,
  confirmReservation,
  cancelReservation,
  getPendingReservations,
  getUserReservations,
  checkTableAvailability,
  deleteReservation 
};
