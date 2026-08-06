const inventoryService = require('../services/inventory.service');

class InventoryController {
    async getInventory(req, res) {
        const { productId } = req.params;
        const inventory = await inventoryService.getInventory(productId);
        res.status(200).json({ success: true, data: inventory });
    }

    async increaseStock(req, res) {
        const { productId, quantity } = req.body;
        const inventory = await inventoryService.increaseStock(productId, quantity);
        res.status(200).json({ success: true, data: inventory });
    }

    async decreaseStock(req, res) {
        const { productId, quantity } = req.body;
        const inventory = await inventoryService.decreaseStock(productId, quantity);
        res.status(200).json({ success: true, data: inventory });
    }

    async reserveStock(req, res) {
        const { productId, quantity } = req.body;
        const inventory = await inventoryService.reserveStock(productId, quantity);
        res.status(200).json({ success: true, data: inventory });
    }

    async releaseStock(req, res) {
        const { productId, quantity } = req.body;
        const inventory = await inventoryService.releaseStock(productId, quantity);
        res.status(200).json({ success: true, data: inventory });
    }
}

module.exports = new InventoryController();
