const paymentService = require('../services/payment.service');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

async function list(req, res, next) {
  try {
    if (req.query.session_id) {
      const payments = await paymentService.getPaymentsBySession(Number(req.query.session_id));
      return res.json({ 
        success: true, 
        data: payments,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: payments.length,
          itemsPerPage: payments.length,
          hasNextPage: false,
          hasPreviousPage: false
        }
      });
    }
    
    const { page, limit, offset } = getPaginationParams(req.query);
    const { payments, total } = await paymentService.getAllPaymentsPaged(limit, offset);
    res.json(formatPaginatedResponse(payments, total, page, limit));
  } catch (err) {
    next(err);
  }
}

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

async function del(req, res, next) {
  try {
    const id = Number(req.params.id);
    await paymentService.deletePayment(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, del };
