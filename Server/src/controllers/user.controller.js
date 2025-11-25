const userService = require('../services/user.service');

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const user = await userService.getUser(id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const payload = req.body;
    const user = await userService.createUser(payload);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getById, create };
