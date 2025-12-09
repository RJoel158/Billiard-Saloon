const service = require('../services/roles.service');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

async function getAll(req, res, next) {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { roles, total } = await service.getAllRolesPaged(limit, offset);
    res.json(formatPaginatedResponse(roles, total, page, limit));
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await service.getRoleById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const item = await service.createRole(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await service.updateRole(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function deleteRole(req, res, next) {
  try {
    await service.deleteRole(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, deleteRole };
