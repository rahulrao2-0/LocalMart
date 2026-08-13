import express from 'express';
import {
    getInventory,
    increaseStock,
    decreaseStock,
    reserveStock,
    releaseStock
} from '../controllers/inventory.controller.js';
const router = express.Router();

router.get('/:productId', getInventory);
router.put('/increase', increaseStock);
router.put('/decrease', decreaseStock);
router.put('/reserve', reserveStock);
router.put('/release', releaseStock);

export default router;
