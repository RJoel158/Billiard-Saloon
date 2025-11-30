const paymentRepo = require('../repositories/payment.repository');
const ApiError = require('../middlewares/apiError');
const db = require('../db/db');

async function getPayment(id) {
  const payment = await paymentRepo.findById(id);
  if (!payment) throw new ApiError(404, 'PAYMENT_NOT_FOUND', 'Payment not found');
  return payment;
}

async function getAllPayments() {
  // simple list of active payments
  const rows = await db.query('SELECT id, session_id, amount, method, created_at FROM payments WHERE is_active = 1');
  return rows;
}

async function create(data) {
  // Basic validation
  if (!data.session_id || !data.amount || !data.method) {
    throw new ApiError(400, 'INVALID_PAYLOAD', 'session_id, amount and method are required');
  }

  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();

    // Lock session row
    const [sessions] = await conn.execute('SELECT id, final_cost, status FROM sessions WHERE id = ? FOR UPDATE', [data.session_id]);
    const session = sessions[0];
    if (!session) {
      throw new ApiError(404, 'SESSION_NOT_FOUND', 'Session not found');
    }

    // Insert payment
    const [result] = await conn.execute('INSERT INTO payments (session_id, amount, method) VALUES (?, ?, ?)', [data.session_id, data.amount, data.method]);
    const paymentId = result.insertId;

    // Update session final_cost and mark closed (2)
    const newFinal = (session.final_cost || 0) + Number(data.amount);
    await conn.execute('UPDATE sessions SET final_cost = ?, status = ? WHERE id = ?', [newFinal, 2, data.session_id]);

    await conn.commit();

    // Return payment row
    const [payments] = await db.query('SELECT id, session_id, amount, method, created_at FROM payments WHERE id = ?', [paymentId]);
    return payments[0] || null;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function deletePayment(id) {
  const existing = await paymentRepo.findById(id);
  if (!existing) throw new ApiError(404, 'PAYMENT_NOT_FOUND', 'Payment not found');
  const result = await db.query('UPDATE payments SET is_active = 0 WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { getPayment, create, getAllPayments, deletePayment };
