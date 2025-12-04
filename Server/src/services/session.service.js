const repository = require('../repositories/session.repository');
const reservationRepo = require('../repositories/reservation.repository');
const tableRepo = require('../repositories/billiard-table.repository');
const tableCategoryRepo = require('../repositories/table-category.repository');
const ApiError = require('../middlewares/apiError');

async function getAllSessions() {
  return await repository.findAll();
}

async function getSessionById(id) {
  const s = await repository.findById(id);
  if (!s) throw new ApiError(404, 'SESSION_NOT_FOUND', 'Sesión no encontrada');
  return s;
}

async function startSession(data) {
  // Validate required fields
  if (!data.table_id) {
    throw new ApiError(400, 'MISSING_TABLE', 'Se requiere el ID de la mesa');
  }

  // Validate table exists
  const table = await tableRepo.findById(data.table_id);
  if (!table) throw new ApiError(404, 'TABLE_NOT_FOUND', 'Mesa no encontrada');
  if (table.status === 3) throw new ApiError(400, 'TABLE_MAINTENANCE', 'Mesa en mantenimiento');

  // Check if table already has an active session
  const activeSession = await repository.findActiveByTable(data.table_id);
  if (activeSession) {
    throw new ApiError(409, 'TABLE_BUSY', 'La mesa ya tiene una sesión activa');
  }

  const now = new Date();
  let sessionType = 2; // walk-in by default
  let reservation_id = null;
  let user_id = data.user_id || null;

  // If reservation_id is provided, validate it
  if (data.reservation_id) {
    const reservation = await reservationRepo.findById(data.reservation_id);
    if (!reservation) {
      throw new ApiError(404, 'RESERVATION_NOT_FOUND', 'Reserva no encontrada');
    }
    
    if (reservation.status !== 2) {
      throw new ApiError(400, 'RESERVATION_NOT_CONFIRMED', 'La reserva no está confirmada');
    }

    if (reservation.table_id !== data.table_id) {
      throw new ApiError(400, 'TABLE_MISMATCH', 'La reserva es para otra mesa');
    }

    // Check if reservation time is close (within 30 minutes)
    const resStart = new Date(reservation.start_time);
    const timeDiff = Math.abs(resStart - now) / (1000 * 60); // minutes
    if (timeDiff > 30) {
      throw new ApiError(400, 'EARLY_ARRIVAL', 'La reserva no está en el horario próximo');
    }

    // Check if reservation already has a session
    const existingSession = await repository.findByReservation(data.reservation_id);
    if (existingSession) {
      throw new ApiError(409, 'SESSION_EXISTS', 'Esta reserva ya tiene una sesión creada');
    }

    sessionType = 1; // reservation
    reservation_id = reservation.id;
    user_id = reservation.user_id;
  } else {
    // Walk-in: check no upcoming reservations in next 2 hours
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const upcomingReservations = await reservationRepo.findByTableAndDateRange(
      data.table_id,
      now,
      twoHoursLater
    );

    if (upcomingReservations.length > 0) {
      const nextRes = upcomingReservations[0];
      const resStart = new Date(nextRes.start_time);
      const minutesUntilRes = Math.floor((resStart - now) / (1000 * 60));
      throw new ApiError(409, 'UPCOMING_RESERVATION', 
        `No se puede iniciar walk-in. Hay una reserva en ${minutesUntilRes} minutos`);
    }
  }

  // Update table status to occupied
  await tableRepo.update(data.table_id, { ...table, status: 2 });

  // Create session
  const session = await repository.create({
    user_id,
    reservation_id,
    table_id: data.table_id,
    start_time: now,
    end_time: null,
    session_type: sessionType,
    final_cost: 0,
    status: 1 // active
  });

  return session;
}

async function endSession(id) {
  const session = await getSessionById(id);

  if (session.status !== 1) {
    throw new ApiError(400, 'SESSION_NOT_ACTIVE', 'La sesión no está activa');
  }

  const now = new Date();
  const startTime = new Date(session.start_time);

  // Calculate duration in hours (round up to next hour)
  const durationMs = now - startTime;
  const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

  // Get table category to calculate cost
  const table = await tableRepo.findById(session.table_id);
  const category = await tableCategoryRepo.findById(table.category_id);

  // Calculate cost: base_price * hours
  // TODO: Apply dynamic pricing if applicable
  const finalCost = category.base_price * durationHours;

  // Close session
  const closedSession = await repository.closeSession(id, now, finalCost);

  // Update table status back to available
  await tableRepo.update(session.table_id, { ...table, status: 1 });

  return closedSession;
}

async function createSession(data) {
  if (!data.table_id || !data.start_time) throw new ApiError(400, 'MISSING_FIELDS', 'Faltan campos requeridos');
  return await repository.create(data);
}

async function updateSession(id, data) {
  const existing = await getSessionById(id);
  
  const payload = {
    user_id: data.user_id !== undefined ? data.user_id : existing.user_id,
    reservation_id: data.reservation_id !== undefined ? data.reservation_id : existing.reservation_id,
    table_id: data.table_id !== undefined ? data.table_id : existing.table_id,
    start_time: data.start_time !== undefined ? data.start_time : existing.start_time,
    end_time: data.end_time !== undefined ? data.end_time : existing.end_time,
    session_type: data.session_type !== undefined ? data.session_type : existing.session_type,
    final_cost: data.final_cost !== undefined ? data.final_cost : existing.final_cost,
    status: data.status !== undefined ? data.status : existing.status,
  };
  
  return await repository.update(id, payload);
}

async function deleteSession(id) {
  await getSessionById(id);
  return await repository.deleteById(id);
}

module.exports = {
  getAllSessions,
  getSessionById,
  startSession,
  endSession,
  createSession,
  updateSession,
  deleteSession
};
