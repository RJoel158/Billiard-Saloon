const service = require('../services/reservation.service');

async function getAll(req, res, next) {
  try {
    const items = await service.getAllReservations();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getPending(req, res, next) {
  try {
    const items = await service.getPendingReservations();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getUserReservations(req, res, next) {
  try {
    const userId = req.user.id; // From auth middleware
    const items = await service.getUserReservations(userId);
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

async function confirm(req, res, next) {
  try {
    const item = await service.confirmReservation(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const item = await service.cancelReservation(req.params.id);
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

module.exports = { 
  getAll, 
  getPending, 
  getUserReservations, 
  getById, 
  create, 
  update, 
  confirm, 
  cancel, 
  deleteReservation 
};
