const repository = require('../repositories/system-settings.repository');

function parseValue(value, type) {
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true' || value === '1' || value === true;
    case 'json':
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    default:
      return value;
  }
}

function formatSetting(setting) {
  if (!setting) return null;
  return {
    id: setting.id,
    key: setting.setting_key,
    value: parseValue(setting.setting_value, setting.setting_type),
    rawValue: setting.setting_value,
    type: setting.setting_type,
    description: setting.description,
    updatedAt: setting.updated_at
  };
}

async function getAllSettings() {
  const settings = await repository.findAll();
  return settings.map(formatSetting);
}

async function getSettingsByGroup(group) {
  const allSettings = await repository.findAll();
  const grouped = {
    business: [],
    schedule: [],
    reservations: [],
    pricing: [],
    system: []
  };

  allSettings.forEach(setting => {
    const key = setting.setting_key;
    if (key.includes('business_') || key.includes('currency')) {
      grouped.business.push(formatSetting(setting));
    } else if (key.includes('opening_') || key.includes('closing_') || key.includes('business_days')) {
      grouped.schedule.push(formatSetting(setting));
    } else if (key.includes('reservation_') || key.includes('cancellation_') || key.includes('max_concurrent')) {
      grouped.reservations.push(formatSetting(setting));
    } else if (key.includes('penalty') || key.includes('overtime') || key.includes('tax_') || key.includes('grace_')) {
      grouped.pricing.push(formatSetting(setting));
    } else {
      grouped.system.push(formatSetting(setting));
    }
  });

  return group ? grouped[group] : grouped;
}

async function getSettingByKey(key) {
  const setting = await repository.findByKey(key);
  return formatSetting(setting);
}

async function updateSetting(key, value) {
  const setting = await repository.findByKey(key);
  if (!setting) throw new Error('Setting not found');
  
  const stringValue = String(value);
  await repository.update(key, stringValue);
  
  return await getSettingByKey(key);
}

async function updateMultipleSettings(updates) {
  const settingsToUpdate = updates.map(u => ({
    key: u.key,
    value: String(u.value)
  }));
  
  await repository.updateMultiple(settingsToUpdate);
  return await getAllSettings();
}

async function createSetting(data) {
  return await repository.create(data);
}

async function deleteSetting(key) {
  return await repository.deleteByKey(key);
}

async function getBusinessHours() {
  const settings = await repository.findByKeys(['opening_time', 'closing_time', 'business_days']);
  const result = {};
  
  settings.forEach(s => {
    result[s.setting_key] = parseValue(s.setting_value, s.setting_type);
  });
  
  return result;
}

function isWithinBusinessHours(time, businessHours) {
  const [hours, minutes] = time.split(':').map(Number);
  const [openHours, openMins] = businessHours.opening_time.split(':').map(Number);
  const [closeHours, closeMins] = businessHours.closing_time.split(':').map(Number);
  
  const timeMinutes = hours * 60 + minutes;
  const openingMinutes = openHours * 60 + openMins;
  const closingMinutes = closeHours * 60 + closeMins;
  
  return timeMinutes >= openingMinutes && timeMinutes <= closingMinutes;
}

module.exports = {
  getAllSettings,
  getSettingsByGroup,
  getSettingByKey,
  updateSetting,
  updateMultipleSettings,
  createSetting,
  deleteSetting,
  getBusinessHours,
  isWithinBusinessHours
};
