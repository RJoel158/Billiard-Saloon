const service = require('../services/reservation.service');

async function getAll(req, res, next) {
  try {
    const items = await service.getAllReservations();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await service.getReservationById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const item = await service.createReservation(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await service.updateReservation(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function deleteReservation(req, res, next) {
  try {
    await service.deleteReservation(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getAvailableSlots(req, res, next) {
  try {
    const { table_id, date } = req.query;
    if (!table_id || !date) {
      return res.status(400).json({ error: 'Se requiere table_id y date' });
    }
    const slots = await service.getAvailableSlots(Number(table_id), date);
    res.json({ success: true, data: slots });
  } catch (err) {
    next(err);
  }
}

async function approve(req, res, next) {
  try {
    const admin_user_id = req.body.admin_user_id || req.user?.id; // Assumes auth middleware sets req.user
    const item = await service.approveReservation(req.params.id, admin_user_id);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

async function reject(req, res, next) {
  try {
    const admin_user_id = req.body.admin_user_id || req.user?.id;
    const reason = req.body.reason || 'No se especificó razón';
    const item = await service.rejectReservation(req.params.id, admin_user_id, reason);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, deleteReservation, getAvailableSlots, approve, reject };
