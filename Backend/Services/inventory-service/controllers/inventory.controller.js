import inventoryService from '../services/inventory.service.js';
import { asyncHandler } from '@localmart/shared';

class InventoryController {
    getInventory = asyncHandler(async (req, res) => {
        const { productId } = req.params;
        const inventory = await inventoryService.getInventory(productId);
        res.status(200).json({ success: true, data: inventory });
    });

    increaseStock = asyncHandler(async (req, res) => {
        const { productId, quantity } = req.body;
        const inventory = await inventoryService.increaseStock(productId, quantity);
        res.status(200).json({ success: true, data: inventory });
    });

    decreaseStock = asyncHandler(async (req, res) => {
        const { productId, quantity } = req.body;
        const inventory = await inventoryService.decreaseStock(productId, quantity);
        res.status(200).json({ success: true, data: inventory });
    });

    reserveStock = asyncHandler(async (req, res) => {
        const { productId, quantity } = req.body;
        const inventory = await inventoryService.reserveStock(productId, quantity);
        res.status(200).json({ success: true, data: inventory });
    });

    releaseStock = asyncHandler(async (req, res) => {
        const { productId, quantity } = req.body;
        const inventory = await inventoryService.releaseStock(productId, quantity);
        res.status(200).json({ success: true, data: inventory });
    });
}

export default new InventoryController();

