const reservationService = require("../services/reservation.service");
const settingsRepo = require("../repositories/system-settings.repository");

async function getAvailableSlots(req, res, next) {
  try {
    const { tableId } = req.params;
    const { date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: "INVALID_DATE",
        message: "Fecha inválida. Formato requerido: YYYY-MM-DD",
      });
    }

    const settings = await settingsRepo.findByKeys(['opening_time', 'closing_time']);
    
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {});
    
    const openingHour = settingsObj.opening_time
      ? parseInt(settingsObj.opening_time.split(":")[0])
      : 8;
    const closingHour = settingsObj.closing_time
      ? parseInt(settingsObj.closing_time.split(":")[0])
      : 23;

    const availableSlots = await reservationService.getAvailableSlotsWithSettings(
      parseInt(tableId),
      date,
      openingHour,
      closingHour
    );

    res.json({
      table_id: parseInt(tableId),
      date,
      opening_time: `${openingHour}:00`,
      closing_time: `${closingHour}:00`,
      available_slots: availableSlots,
      total_slots: availableSlots.length,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAvailableSlots,
};
