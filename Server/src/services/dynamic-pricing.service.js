const repository = require('../repositories/dynamic-pricing.repository');

async function getAllPricing() {
  return await repository.findAll();
}

async function getPricingById(id) {
  const p = await repository.findById(id);
  if (!p) throw new Error('Pricing not found');
  return p;
}

async function createPricing(data) {
  return await repository.create(data);
}

async function updatePricing(id, data) {
  await getPricingById(id);
  return await repository.update(id, data);
}

async function deletePricing(id) {
  await getPricingById(id);
  return await repository.deleteById(id);
}

module.exports = { getAllPricing, getPricingById, createPricing, updatePricing, deletePricing };
