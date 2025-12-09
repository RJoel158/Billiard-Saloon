const repository = require("../repositories/reservation.repository");
const tableRepo = require("../repositories/billiard-table.repository");
const sessionRepo = require("../repositories/session.repository");
const ApiError = require("../middlewares/apiError");

async function getAllReservations() {
  return await repository.findAll();
}

async function getAllReservationsPaged(limit, offset) {
  const reservations = await repository.findAllPaged(limit, offset);
  const total = await repository.countTotal();
  return { reservations, total };
}

async function getReservationById(id) {
  const r = await repository.findById(id);
  if (!r)
    throw new ApiError(404, "RESERVATION_NOT_FOUND", "Reserva no encontrada");
  return r;
}

async function getAvailableSlots(table_id, date) {
  const table = await tableRepo.findById(table_id);
  if (!table) throw new ApiError(404, "TABLE_NOT_FOUND", "Mesa no encontrada");

  const busySlots = await repository.findAvailableSlots(table_id, date);

  const now = new Date();
  const targetDate = new Date(date);
  const isToday = targetDate.toDateString() === now.toDateString();

  const openingHour = isToday ? Math.max(now.getHours() + 1, 8) : 8;
  const closingHour = 23;

  const availableSlots = [];

  for (let hour = openingHour; hour < closingHour; hour++) {
    const slotStart = new Date(targetDate);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    // Check if this slot conflicts with any busy slot
    const hasConflict = busySlots.some((busy) => {
      const busyStart = new Date(busy.start_time);
      const busyEnd = new Date(busy.end_time);
      return slotStart < busyEnd && slotEnd > busyStart;
    });

    if (!hasConflict) {
      availableSlots.push({
        start_time: slotStart,
        end_time: slotEnd,
        hour: `${hour}:00 - ${hour + 1}:00`,
      });
    }
  }

  return availableSlots;
}

async function getAvailableSlotsWithSettings(table_id, date, openingHour, closingHour) {
  const table = await tableRepo.findById(table_id);
  if (!table) throw new ApiError(404, "TABLE_NOT_FOUND", "Mesa no encontrada");

  const busySlots = await repository.findAvailableSlots(table_id, date);

  const now = new Date();
  const targetDate = new Date(date);
  const isToday = targetDate.toDateString() === now.toDateString();

  const startHour = isToday ? Math.max(now.getHours() + 1, openingHour) : openingHour;

  const availableSlots = [];

  for (let hour = startHour; hour < closingHour; hour++) {
    const slotStart = new Date(targetDate);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    const hasConflict = busySlots.some((busy) => {
      const busyStart = new Date(busy.start_time);
      const busyEnd = new Date(busy.end_time);
      return slotStart < busyEnd && slotEnd > busyStart;
    });

    if (!hasConflict) {
      availableSlots.push({
        start_time: slotStart,
        end_time: slotEnd,
        hour: `${hour}:00 - ${hour + 1}:00`,
      });
    }
  }

  return availableSlots;
}

async function createReservation(data) {
  if (!data.user_id || !data.table_id || !data.start_time || !data.end_time) {
    throw new ApiError(
      400,
      "MISSING_FIELDS",
      "Faltan campos requeridos para la reserva"
    );
  }

  const table = await tableRepo.findById(data.table_id);
  if (!table) throw new ApiError(404, "TABLE_NOT_FOUND", "Mesa no encontrada");
  if (table.status === 3)
    throw new ApiError(400, "TABLE_MAINTENANCE", "Mesa en mantenimiento");

  const startTime = new Date(data.start_time);
  const endTime = new Date(data.end_time);

  const durationHours = (endTime - startTime) / (1000 * 60 * 60);
  if (durationHours < 1) {
    throw new ApiError(
      400,
      "INVALID_DURATION",
      "La duración mínima de reserva es 1 hora"
    );
  }

  const now = new Date();
  if (startTime < now) {
    throw new ApiError(400, "PAST_TIME", "No se puede reservar en el pasado");
  }

  const conflicts = await repository.findByTableAndDateRange(
    data.table_id,
    startTime,
    endTime
  );
  if (conflicts.length > 0) {
    throw new ApiError(
      409,
      "TIME_CONFLICT",
      "Ya existe una reserva o sesión activa en ese horario"
    );
  }

  const activeSession = await sessionRepo.findActiveByTable(data.table_id);
  if (activeSession) {
    const sessionEnd = activeSession.end_time
      ? new Date(activeSession.end_time)
      : null;
    if (!sessionEnd || sessionEnd > startTime) {
      throw new ApiError(
        409,
        "TABLE_OCCUPIED",
        "La mesa está ocupada actualmente"
      );
    }
  }

  const reservation = await repository.create({
    user_id: data.user_id,
    table_id: data.table_id,
    reservation_date: startTime,
    start_time: startTime,
    end_time: endTime,
    qr_payment_path: data.qr_payment_path || null,
    payment_verified: data.payment_verified || false,
    status: 1,
  });

  return reservation;
}

async function approveReservation(id, admin_user_id) {
  const reservation = await getReservationById(id);

  if (reservation.status !== 1) {
    throw new ApiError(
      400,
      "INVALID_STATUS",
      "Solo se pueden aprobar reservas pendientes"
    );
  }

  const updated = await repository.update(id, {
    ...reservation,
    status: 2,
    payment_verified: true,
  });

  return updated;
}

async function rejectReservation(id, admin_user_id, reason) {
  const reservation = await getReservationById(id);

  if (reservation.status !== 1) {
    throw new ApiError(
      400,
      "INVALID_STATUS",
      "Solo se pueden rechazar reservas pendientes"
    );
  }

  const updated = await repository.updateStatus(id, 3);

  return updated;
}

async function updateReservation(id, data) {
  const existing = await getReservationById(id);

  const payload = {
    user_id: data.user_id !== undefined ? data.user_id : existing.user_id,
    table_id: data.table_id !== undefined ? data.table_id : existing.table_id,
    reservation_date:
      data.reservation_date !== undefined
        ? data.reservation_date
        : existing.reservation_date,
    start_time:
      data.start_time !== undefined ? data.start_time : existing.start_time,
    end_time: data.end_time !== undefined ? data.end_time : existing.end_time,
    qr_payment_path: data.qr_payment_path !== undefined ? data.qr_payment_path : existing.qr_payment_path,
    payment_verified: data.payment_verified !== undefined ? data.payment_verified : existing.payment_verified,
    status: data.status !== undefined ? data.status : existing.status,
  };

  return await repository.update(id, payload);
}

async function deleteReservation(id) {
  await getReservationById(id);
  return await repository.deleteById(id);
}

module.exports = {
  getAllReservations,
  getReservationById,
  getAvailableSlots,
  getAvailableSlotsWithSettings,
  createReservation,
  approveReservation,
  rejectReservation,
  updateReservation,
  deleteReservation,
  getAllReservationsPaged,
};
