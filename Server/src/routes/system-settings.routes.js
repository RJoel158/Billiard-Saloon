const express = require('express');
const controller = require('../controllers/system-settings.controller');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/business-hours', controller.getBusinessHours);
router.get('/:key', controller.getByKey);
router.post('/', controller.create);
router.put('/batch', controller.updateBatch);
router.put('/:key', controller.update);
router.delete('/:key', controller.deleteSetting);

module.exports = router;
