const dynamicPricingRepo = require('../repositories/dynamic-pricing.repository');
const tableCategoryRepo = require('../repositories/table-category.repository');

/**
 * Calculate the final price for a session based on dynamic pricing rules
 * @param {number} categoryId - Table category ID
 * @param {Date} startTime - Session start time
 * @param {Date} endTime - Session end time (optional, uses current time if not provided)
 * @returns {Promise<{basePrice: number, adjustments: Array, finalPrice: number, durationHours: number}>}
 */
async function calculateSessionPrice(categoryId, startTime, endTime = null) {
  // Get base price from category
  const category = await tableCategoryRepo.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }

  const basePrice = Number(category.base_price);
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  
  // Calculate duration in hours
  const durationMs = end - start;
  const durationHours = durationMs / (1000 * 60 * 60);

  if (durationHours <= 0) {
    return {
      basePrice,
      adjustments: [],
      finalPrice: 0,
      durationHours: 0,
    };
  }

  // Get active dynamic pricing rules for this category
  const allPricing = await dynamicPricingRepo.findAll();
  const categoryPricing = allPricing.filter(p => p.category_id === categoryId && p.is_active);

  const adjustments = [];
  let totalPercentage = 0;

  for (const rule of categoryPricing) {
    if (isRuleApplicable(rule, start)) {
      adjustments.push({
        type: rule.type,
        percentage: Number(rule.percentage),
        description: getPricingTypeDescription(rule.type),
      });
      totalPercentage += Number(rule.percentage);
    }
  }

  // Calculate final price
  // Price = (basePrice * hours) * (1 + totalPercentage/100)
  const baseCost = basePrice * durationHours;
  const adjustment = baseCost * (totalPercentage / 100);
  const finalPrice = baseCost + adjustment;

  return {
    basePrice,
    durationHours: Number(durationHours.toFixed(2)),
    baseCost: Number(baseCost.toFixed(2)),
    adjustments,
    totalPercentageAdjustment: Number(totalPercentage.toFixed(2)),
    finalPrice: Number(finalPrice.toFixed(2)),
  };
}

/**
 * Check if a pricing rule applies to the given time
 */
function isRuleApplicable(rule, datetime) {
  const dt = new Date(datetime);
  
  // Check time range (for peak hours)
  if (rule.time_start && rule.time_end) {
    const timeStr = dt.toTimeString().substring(0, 8); // HH:MM:SS
    if (timeStr < rule.time_start || timeStr > rule.time_end) {
      return false;
    }
  }

  // Check weekday (1=Mon, 7=Sun)
  if (rule.weekday !== null && rule.weekday !== undefined) {
    const jsDay = dt.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const isoDay = jsDay === 0 ? 7 : jsDay; // Convert to 1=Mon, 7=Sun
    if (isoDay !== rule.weekday) {
      return false;
    }
  }

  // Check date range
  if (rule.date_start && rule.date_end) {
    const dateStr = dt.toISOString().substring(0, 10); // YYYY-MM-DD
    if (dateStr < rule.date_start || dateStr > rule.date_end) {
      return false;
    }
  }

  return true;
}

/**
 * Get human-readable description for pricing type
 */
function getPricingTypeDescription(type) {
  const types = {
    1: 'Peak Hour',
    2: 'Weekend',
    3: 'High Demand',
    4: 'Promotion',
    5: 'Event',
  };
  return types[type] || 'Unknown';
}

/**
 * Get applicable pricing rules for a given time and category
 */
async function getApplicablePricing(categoryId, datetime = new Date()) {
  const allPricing = await dynamicPricingRepo.findAll();
  const categoryPricing = allPricing.filter(p => p.category_id === categoryId && p.is_active);

  return categoryPricing.filter(rule => isRuleApplicable(rule, datetime)).map(rule => ({
    id: rule.id,
    type: rule.type,
    typeDescription: getPricingTypeDescription(rule.type),
    percentage: Number(rule.percentage),
    time_start: rule.time_start,
    time_end: rule.time_end,
    weekday: rule.weekday,
    date_start: rule.date_start,
    date_end: rule.date_end,
  }));
}

module.exports = {
  calculateSessionPrice,
  getApplicablePricing,
  getPricingTypeDescription,
};
