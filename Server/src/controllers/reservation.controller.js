const service = require('../services/reservation.service');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

async function getAll(req, res, next) {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { reservations, total } = await service.getAllReservationsPaged(limit, offset);
    res.json(formatPaginatedResponse(reservations, total, page, limit));
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

module.exports = { getAll, getById, create, update, deleteReservation };
