const penaltyService = require('../services/penalty.service');

async function getAll(req, res, next) {
  try {
    const penalties = await penaltyService.getAllPenalties();
    res.json({ success: true, data: penalties });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const penalty = await penaltyService.getPenalty(req.params.id);
    res.json({ success: true, data: penalty });
  } catch (err) {
    next(err);
  }
}

async function getBySessionId(req, res, next) {
  try {
    const penalties = await penaltyService.getPenaltiesBySession(req.params.sessionId);
    res.json({ success: true, data: penalties });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const penalty = await penaltyService.createPenalty(req.body);
    res.status(201).json({ success: true, data: penalty });
  } catch (err) {
    next(err);
  }
}

async function deletePenalty(req, res, next) {
  try {
    await penaltyService.deletePenalty(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, getBySessionId, create, deletePenalty };
