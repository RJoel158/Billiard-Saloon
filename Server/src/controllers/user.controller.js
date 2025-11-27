const userService = require('../services/user.service');
const ApiError = require('../middlewares/apiError');

async function create(req, res, next) {
  try {
    // Validar que req.body existe
    if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
      throw new ApiError(400, 'EMPTY_BODY', 'El body de la solicitud está vacío');
    }

    const payload = req.body;
    const user = await userService.createUser(payload);
    res.status(201).json({success: true, data: user});
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  create
};
