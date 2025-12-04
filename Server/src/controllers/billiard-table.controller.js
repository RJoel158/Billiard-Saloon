const service = require('../services/billiard-table.service');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

async function getAll(req, res, next) {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { tables, total } = await service.getAllTablesPaged(limit, offset);
    res.json(formatPaginatedResponse(tables, total, page, limit));
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await service.getTableById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const item = await service.createTable(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await service.updateTable(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function deleteTable(req, res, next) {
  try {
    await service.deleteTable(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, deleteTable };
