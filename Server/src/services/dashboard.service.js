const db = require('../db/db');
const sessionRepo = require('../repositories/session.repository');
const paymentRepo = require('../repositories/payment.repository');

async function getDashboardStats() {
  // Active sessions count
  const activeSessions = await db.query(
    'SELECT COUNT(*) as count FROM sessions WHERE status = 1'
  );

  // Total revenue today
  const todayRevenue = await db.query(`
    SELECT COALESCE(SUM(p.amount), 0) as total
    FROM payments p
    WHERE DATE(p.created_at) = CURDATE()
  `);

  // Total revenue this month
  const monthRevenue = await db.query(`
    SELECT COALESCE(SUM(p.amount), 0) as total
    FROM payments p
    WHERE YEAR(p.created_at) = YEAR(CURDATE())
    AND MONTH(p.created_at) = MONTH(CURDATE())
  `);

  // Available tables
  const availableTables = await db.query(
    'SELECT COUNT(*) as count FROM billiard_tables WHERE status = 1'
  );

  // Occupied tables
  const occupiedTables = await db.query(
    'SELECT COUNT(*) as count FROM billiard_tables WHERE status = 2'
  );

  // Pending reservations
  const pendingReservations = await db.query(
    'SELECT COUNT(*) as count FROM reservations WHERE status = 1'
  );

  return {
    activeSessions: activeSessions[0].count,
    availableTables: availableTables[0].count,
    occupiedTables: occupiedTables[0].count,
    pendingReservations: pendingReservations[0].count,
    todayRevenue: Number(todayRevenue[0].total),
    monthRevenue: Number(monthRevenue[0].total),
  };
}

async function getRevenueReport(startDate, endDate) {
  const query = `
    SELECT 
      DATE(p.created_at) as date,
      COUNT(p.id) as transactions,
      SUM(p.amount) as total,
      AVG(p.amount) as average
    FROM payments p
    WHERE p.created_at >= ? AND p.created_at < ?
    GROUP BY DATE(p.created_at)
    ORDER BY date DESC
  `;

  const results = await db.query(query, [startDate, endDate]);
  
  return results.map(row => ({
    date: row.date,
    transactions: row.transactions,
    total: Number(row.total),
    average: Number(row.average),
  }));
}

async function getTableUsageStats() {
  const query = `
    SELECT 
      bt.id,
      bt.code,
      bt.description,
      tc.name as category,
      COUNT(s.id) as total_sessions,
      COALESCE(SUM(TIMESTAMPDIFF(MINUTE, s.start_time, COALESCE(s.end_time, NOW()))), 0) as total_minutes,
      COALESCE(SUM(s.final_cost), 0) as total_revenue
    FROM billiard_tables bt
    LEFT JOIN table_categories tc ON bt.category_id = tc.id
    LEFT JOIN sessions s ON bt.id = s.table_id AND s.status IN (1, 2)
    GROUP BY bt.id, bt.code, bt.description, tc.name
    ORDER BY total_revenue DESC
  `;

  const results = await db.query(query);
  
  return results.map(row => ({
    tableId: row.id,
    code: row.code,
    description: row.description,
    category: row.category,
    totalSessions: row.total_sessions,
    totalHours: Number((row.total_minutes / 60).toFixed(2)),
    totalRevenue: Number(row.total_revenue),
  }));
}

async function getPaymentMethodStats(startDate, endDate) {
  const query = `
    SELECT 
      p.method,
      COUNT(p.id) as count,
      SUM(p.amount) as total
    FROM payments p
    WHERE p.created_at >= ? AND p.created_at < ?
    GROUP BY p.method
    ORDER BY total DESC
  `;

  const results = await db.query(query, [startDate, endDate]);
  
  const methodNames = {
    1: 'Cash',
    2: 'Card',
    3: 'QR',
    4: 'Other',
  };

  return results.map(row => ({
    method: row.method,
    methodName: methodNames[row.method] || 'Unknown',
    count: row.count,
    total: Number(row.total),
  }));
}

async function getPeakHoursAnalysis(date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  const query = `
    SELECT 
      HOUR(s.start_time) as hour,
      COUNT(s.id) as sessions,
      SUM(s.final_cost) as revenue
    FROM sessions s
    WHERE DATE(s.start_time) = ?
    GROUP BY HOUR(s.start_time)
    ORDER BY hour
  `;

  const results = await db.query(query, [targetDate]);
  
  return results.map(row => ({
    hour: row.hour,
    sessions: row.sessions,
    revenue: Number(row.revenue || 0),
  }));
}

module.exports = {
  getDashboardStats,
  getRevenueReport,
  getTableUsageStats,
  getPaymentMethodStats,
  getPeakHoursAnalysis,
};
