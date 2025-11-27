const paymentService = require('../services/payment.service');

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const payment = await paymentService.getPayment(id);
    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const payload = req.body;
    const payment = await paymentService.create(payload);
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
}

module.exports = { getById, create };
