const repository = require("../repositories/session.repository");
const reservationRepo = require("../repositories/reservation.repository");
const tableRepo = require("../repositories/billiard-table.repository");
const tableCategoryRepo = require("../repositories/table-category.repository");
const paymentRepository = require("../repositories/payment.repository");
const ApiError = require("../middlewares/apiError");

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
  if (!s) throw new ApiError(404, "SESSION_NOT_FOUND", "Sesión no encontrada");
  return s;
}

async function startSession(data) {
  if (!data.table_id) {
    throw new ApiError(400, "MISSING_TABLE", "Se requiere el ID de la mesa");
  }

  const table = await tableRepo.findById(data.table_id);
  if (!table) throw new ApiError(404, "TABLE_NOT_FOUND", "Mesa no encontrada");
  if (table.status === 3)
    throw new ApiError(400, "TABLE_MAINTENANCE", "Mesa en mantenimiento");

  const activeSession = await repository.findActiveByTableId(data.table_id);
  if (activeSession) {
    throw new ApiError(409, "TABLE_BUSY", "La mesa ya tiene una sesión activa");
  }

  const now = new Date();
  let sessionType = 2;
  let reservation_id = null;
  let user_id = data.user_id || null;

  if (data.reservation_id) {
    const reservation = await reservationRepo.findById(data.reservation_id);
    if (!reservation) {
      throw new ApiError(404, "RESERVATION_NOT_FOUND", "Reserva no encontrada");
    }

    if (reservation.status !== 2) {
      throw new ApiError(
        400,
        "RESERVATION_NOT_CONFIRMED",
        "La reserva no está confirmada"
      );
    }

    if (reservation.table_id !== data.table_id) {
      throw new ApiError(400, "TABLE_MISMATCH", "La reserva es para otra mesa");
    }

    const resStart = new Date(reservation.start_time);
    const timeDiff = Math.abs(resStart - now) / (1000 * 60); // minutes
    if (timeDiff > 30) {
      throw new ApiError(
        400,
        "EARLY_ARRIVAL",
        "La reserva no está en el horario próximo"
      );
    }

    const existingSession = await repository.findByReservation(
      data.reservation_id
    );
    if (existingSession) {
      throw new ApiError(
        409,
        "SESSION_EXISTS",
        "Esta reserva ya tiene una sesión creada"
      );
    }

    sessionType = 1;
    reservation_id = reservation.id;
    user_id = reservation.user_id;
  } else {
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
      throw new ApiError(
        409,
        "UPCOMING_RESERVATION",
        `No se puede iniciar walk-in. Hay una reserva en ${minutesUntilRes} minutos`
      );
    }
  }

  await tableRepo.updateStatus(data.table_id, 2);

  const session = await repository.create({
    user_id,
    reservation_id,
    table_id: data.table_id,
    start_time: now,
    end_time: null,
    session_type: sessionType,
    final_cost: 0,
    status: 1,
  });

  return session;
}

async function endSession(id) {
  const session = await getSessionById(id);

  if (session.status !== 1) {
    throw new ApiError(400, "SESSION_NOT_ACTIVE", "La sesión no está activa");
  }

  const now = new Date();
  const startTime = new Date(session.start_time);

  const durationMs = now - startTime;
  const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

  const table = await tableRepo.findById(session.table_id);
  const category = await tableCategoryRepo.findById(table.category_id);

  const finalCost = category.base_price * durationHours;

  const closedSession = await repository.closeSession(id, now, finalCost);

  await tableRepo.updateStatus(session.table_id, 1);

  return closedSession;
}

async function createSession(data) {
  if (!data.table_id || !data.start_time)
    throw new ApiError(400, "MISSING_FIELDS", "Faltan campos requeridos");
  
  const activeSession = await repository.findActiveByTableId(data.table_id);
  if (activeSession) {
    throw new ApiError(409, "TABLE_BUSY", "La mesa ya tiene una sesión activa. Finalice la sesión actual antes de iniciar una nueva.");
  }
  
  await tableRepo.updateStatus(data.table_id, 2);
  
  return await repository.create(data);
}

async function updateSession(id, data) {
  const existing = await getSessionById(id);

  const payload = {
    user_id: data.user_id !== undefined ? data.user_id : existing.user_id,
    reservation_id:
      data.reservation_id !== undefined
        ? data.reservation_id
        : existing.reservation_id,
    table_id: data.table_id !== undefined ? data.table_id : existing.table_id,
    start_time:
      data.start_time !== undefined ? data.start_time : existing.start_time,
    end_time: data.end_time !== undefined ? data.end_time : existing.end_time,
    session_type:
      data.session_type !== undefined
        ? data.session_type
        : existing.session_type,
    final_cost:
      data.final_cost !== undefined ? data.final_cost : existing.final_cost,
    status: data.status !== undefined ? data.status : existing.status,
  };

  return await repository.update(id, payload);
}

async function finalizeSession(id, data = {}) {
  try {
    const session = await getSessionById(id);
    
    const table = await tableRepo.findById(session.table_id);
    
    const category = await tableCategoryRepo.findById(table.category_id);
    
    const endTime = new Date();
    const startTime = new Date(session.start_time);
    
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = Math.max(0, durationMs / (1000 * 60 * 60));
    
    let finalCost = Math.max(0, durationHours * category.base_price);
    
    if (data.penalty_amount && !isNaN(data.penalty_amount)) {
      finalCost += Number(data.penalty_amount);
    }
    
    const endTimeMysql = endTime.toISOString().slice(0, 19).replace('T', ' ');
    
    const updatedSession = await repository.update(id, {
      user_id: session.user_id,
      reservation_id: session.reservation_id,
      table_id: session.table_id,
      start_time: session.start_time,
      end_time: endTimeMysql,
      session_type: session.session_type,
      final_cost: finalCost,
      status: 2
    });
    
    await paymentRepository.create({
      session_id: id,
      amount: finalCost,
      method: data.payment_method || 1
    });
    
    await tableRepo.updateStatus(session.table_id, 1);
    
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
  startSession,
  endSession,
  createSession,
  updateSession,
  finalizeSession,
  deleteSession,
};
