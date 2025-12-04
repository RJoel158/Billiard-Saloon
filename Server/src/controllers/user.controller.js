const userService = require('../services/user.service');

async function getAll(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

async function search(req, res, next) {
  try {
    const { q } = req.query;
    const users = await userService.searchUsers(q);
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

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

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const payload = req.body;
    const user = await userService.updateUser(id, payload);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, search, getById, create, update, deleteUser };
