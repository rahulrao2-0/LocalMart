const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const router = express.Router();

router.get('/:productId', inventoryController.getInventory.bind(inventoryController));
router.put('/increase', inventoryController.increaseStock.bind(inventoryController));
router.put('/decrease', inventoryController.decreaseStock.bind(inventoryController));
router.put('/reserve', inventoryController.reserveStock.bind(inventoryController));
router.put('/release', inventoryController.releaseStock.bind(inventoryController));

module.exports = router;
