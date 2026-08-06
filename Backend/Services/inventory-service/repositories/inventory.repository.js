const Inventory = require('../models/inventory.model');

class InventoryRepository {
    async findByProductId(productId) {
        return await Inventory.findOne({ ProductId: productId });
    }

    async create(data) {
        const inventory = new Inventory(data);
        return await inventory.save();
    }

    async update(inventory) {
        return await inventory.save();
    }
}

module.exports = new InventoryRepository();
