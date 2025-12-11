const settingsRepository = require('../repositories/system-settings.repository');

async function validateReservation(req, res, next) {
  try {
    const { reservation_date, start_time, duration_hours } = req.body;
    
    if (!reservation_date || !start_time) {
      return next();
    }

    const settings = await loadSettings();
    
    const reservationDate = new Date(start_time);
    const now = new Date();
    
    const dayOfWeek = reservationDate.getDay() === 0 ? 7 : reservationDate.getDay();
    if (!settings.business_days.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        error: `El día seleccionado no es un día laborable del negocio.`
      });
    }
    
    const hour = reservationDate.getHours();
    const minute = reservationDate.getMinutes();
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    if (timeString < settings.opening_time || timeString > settings.closing_time) {
      return res.status(400).json({
        success: false,
        error: `La reserva debe estar dentro del horario de atención: ${settings.opening_time} - ${settings.closing_time}`
      });
    }
    
    if (duration_hours) {
      const durationMinutes = duration_hours * 60;
      
      if (durationMinutes < settings.min_reservation_duration) {
        return res.status(400).json({
          success: false,
          error: `La duración mínima de reserva es ${settings.min_reservation_duration} minutos (${settings.min_reservation_duration / 60} horas).`
        });
      }
      
      if (durationMinutes > settings.max_reservation_duration) {
        return res.status(400).json({
          success: false,
          error: `La duración máxima de reserva es ${settings.max_reservation_duration} minutos (${settings.max_reservation_duration / 60} horas).`
        });
      }
    }
    
    const hoursInAdvance = (reservationDate - now) / (1000 * 60 * 60);
    if (hoursInAdvance < settings.min_advance_hours) {
      return res.status(400).json({
        success: false,
        error: `Las reservas deben hacerse con al menos ${settings.min_advance_hours} horas de anticipación.`
      });
    }
    
    const daysInAdvance = hoursInAdvance / 24;
    if (daysInAdvance > settings.max_advance_days) {
      return res.status(400).json({
        success: false,
        error: `Las reservas no pueden hacerse con más de ${settings.max_advance_days} días de anticipación.`
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en validateReservation middleware:', error);
    next(error);
  }
}

async function loadSettings() {
  const allSettings = await settingsRepository.findAll();
  
  const settings = {};
  allSettings.forEach(setting => {
    let value = setting.setting_value;
    
    switch (setting.setting_type) {
      case 'boolean':
        value = value === 'true' || value === '1' || value === 1;
        break;
      case 'number':
        value = parseFloat(value);
        break;
      case 'json':
        try {
          value = typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
          value = [];
        }
        break;
      default:
        value = String(value);
    }
    
    settings[setting.setting_key] = value;
  });
  
  return settings;
}

module.exports = { validateReservation };
