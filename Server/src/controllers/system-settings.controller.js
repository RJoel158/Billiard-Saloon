const service = require('../services/system-settings.service');

async function getAll(req, res, next) {
  try {
    const { group } = req.query;
    const settings = group 
      ? await service.getSettingsByGroup(group)
      : await service.getAllSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

async function getByKey(req, res, next) {
  try {
    const setting = await service.getSettingByKey(req.params.key);
    if (!setting) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }
    res.json({ success: true, data: setting });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const setting = await service.updateSetting(req.params.key, req.body.value);
    res.json({ success: true, data: setting });
  } catch (err) {
    next(err);
  }
}

async function updateBatch(req, res, next) {
  try {
    const { settings } = req.body;
    if (!Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'Settings must be an array' });
    }
    
    const updated = await service.updateMultipleSettings(settings);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const setting = await service.createSetting(req.body);
    res.status(201).json({ success: true, data: setting });
  } catch (err) {
    next(err);
  }
}

async function deleteSetting(req, res, next) {
  try {
    await service.deleteSetting(req.params.key);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getBusinessHours(req, res, next) {
  try {
    const hours = await service.getBusinessHours();
    res.json({ success: true, data: hours });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getByKey,
  update,
  updateBatch,
  create,
  deleteSetting,
  getBusinessHours
};
