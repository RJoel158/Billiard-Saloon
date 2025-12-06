const service = require('../services/session.service');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

async function getAll(req, res, next) {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { sessions, total } = await service.getAllSessionsPaged(limit, offset);
    res.json(formatPaginatedResponse(sessions, total, page, limit));
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await service.getSessionById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const item = await service.createSession(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await service.updateSession(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function deleteSession(req, res, next) {
  try {
    await service.deleteSession(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function start(req, res, next) {
  try {
    const session = await service.startSession(req.body);
    res.status(201).json({ success: true, data: session, message: 'Sesión iniciada correctamente' });
  } catch (err) {
    next(err);
  }
}

async function end(req, res, next) {
  try {
    const session = await service.endSession(req.params.id);
    res.json({ success: true, data: session, message: 'Sesión finalizada correctamente' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, deleteSession, start, end };
