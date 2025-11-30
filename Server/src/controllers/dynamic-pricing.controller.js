const service = require('../services/dynamic-pricing.service');

async function getAll(req, res, next) {
  try {
    const items = await service.getAllPricing();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await service.getPricingById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const item = await service.createPricing(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await service.updatePricing(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function deletePricing(req, res, next) {
  try {
    await service.deletePricing(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, deletePricing };
