const paymentRepo = require('../repositories/payment.repository');
const ApiError = require('../middlewares/apiError');

async function getPayment(id) {
  const payment = await paymentRepo.findById(id);
  if (!payment) throw new ApiError(404, 'PAYMENT_NOT_FOUND', 'Payment not found');
  return payment;
}

async function createPayment(data) {
  const payment = await paymentRepo.create(data);
  return payment;
}

module.exports = { getPayment, createPayment };
