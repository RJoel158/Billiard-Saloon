const repository = require('../repositories/reservation.repository');

async function getAllReservations() {
  return await repository.findAll();
}

async function getReservationById(id) {
  const r = await repository.findById(id);
  if (!r) throw new Error('Reservation not found');
  return r;
}

async function createReservation(data) {
  if (!data.user_id || !data.table_id || !data.reservation_date || !data.start_time || !data.end_time) {
    throw new Error('Missing required reservation fields');
  }
  return await repository.create(data);
}

async function updateReservation(id, data) {
  await getReservationById(id);
  return await repository.update(id, data);
}

async function deleteReservation(id) {
  await getReservationById(id);
  return await repository.deleteById(id);
}

module.exports = { getAllReservations, getReservationById, createReservation, updateReservation, deleteReservation };
