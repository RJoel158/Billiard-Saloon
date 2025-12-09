const service = require('../services/reservation.service');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');
const path = require('path');
const fs = require('fs');

async function getAll(req, res, next) {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { reservations, total } = await service.getAllReservationsPaged(limit, offset);
    res.json(formatPaginatedResponse(reservations, total, page, limit));
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const item = await service.getReservationById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.qr_payment_path = req.file.path;
      data.payment_verified = false;
    }
    
    const item = await service.createReservation(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await service.updateReservation(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function deleteReservation(req, res, next) {
  try {
    await service.deleteReservation(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getAvailableSlots(req, res, next) {
  try {
    const { table_id, date } = req.query;
    if (!table_id || !date) {
      return res.status(400).json({ error: 'Se requiere table_id y date' });
    }
    const slots = await service.getAvailableSlots(Number(table_id), date);
    res.json({ success: true, data: slots });
  } catch (err) {
    next(err);
  }
}

async function approve(req, res, next) {
  try {
    const admin_user_id = req.body.admin_user_id || req.user?.id;
    const item = await service.approveReservation(req.params.id, admin_user_id);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

async function reject(req, res, next) {
  try {
    const admin_user_id = req.body.admin_user_id || req.user?.id;
    const reason = req.body.reason || 'No se especificó razón';
    const item = await service.rejectReservation(req.params.id, admin_user_id, reason);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

async function getQRImage(req, res, next) {
  try {
    const reservation = await service.getReservationById(req.params.id);
    
    if (!reservation.qr_payment_path) {
      return res.status(404).json({ 
        error: 'QR_NOT_FOUND', 
        message: 'Esta reserva no tiene imagen de pago adjunta' 
      });
    }

    const filePath = path.resolve(reservation.qr_payment_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: 'FILE_NOT_FOUND', 
        message: 'El archivo de imagen no existe en el servidor' 
      });
    }

    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, deleteReservation, getAvailableSlots, approve, reject, getQRImage };
