const service = require('../services/dashboard.service');

async function getStats(req, res, next) {
  try {
    const stats = await service.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

async function getRevenueReport(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'startDate and endDate are required' } 
      });
    }

    const report = await service.getRevenueReport(startDate, endDate);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}

async function getTableUsage(req, res, next) {
  try {
    const stats = await service.getTableUsageStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

async function getPaymentMethods(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'startDate and endDate are required' } 
      });
    }

    const stats = await service.getPaymentMethodStats(startDate, endDate);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

async function getPeakHours(req, res, next) {
  try {
    const { date } = req.query;
    const analysis = await service.getPeakHoursAnalysis(date);
    res.json({ success: true, data: analysis });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats,
  getRevenueReport,
  getTableUsage,
  getPaymentMethods,
  getPeakHours,
};
