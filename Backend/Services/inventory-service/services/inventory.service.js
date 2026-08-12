import inventoryRepository from '../repositories/inventory.repository.js';
import { redis, publishEvent, TOPICS, BadRequestError } from '@localmart/shared';

class InventoryService {
    async getInventory(productId) {
        const cacheKey = `inventory:${productId}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        let inventory = await inventoryRepository.findByProductId(productId);
        if (!inventory) {
            // Create default inventory for the product if not exists (or throw error, but creating is safer for stock management)
            inventory = await inventoryRepository.create({ ProductId: productId });
        }

        await redis.set(cacheKey, JSON.stringify(inventory), 'EX', 3600); // cache for 1 hour
        return inventory;
    }

    async updateInventoryCache(inventory) {
        const cacheKey = `inventory:${inventory.ProductId}`;
        await redis.set(cacheKey, JSON.stringify(inventory), 'EX', 3600);
    }

    async checkAndPublishLowStock(inventory) {
        if (inventory.Status === 'OUT_OF_STOCK') {
            await publishEvent(TOPICS?.OUT_OF_STOCK || 'OUT_OF_STOCK', { ProductId: inventory.ProductId });
        } else if (inventory.Status === 'LOW_STOCK') {
            await publishEvent(TOPICS?.LOW_STOCK || 'LOW_STOCK', { ProductId: inventory.ProductId, RemainingStock: inventory.AvailableStock });
        }
    }

    async increaseStock(productId, quantity) {
        const inventory = await this.getInventory(productId);
        inventory.CurrentStock += quantity;
        await inventoryRepository.update(inventory);
        await this.updateInventoryCache(inventory);
        return inventory;
    }

    async decreaseStock(productId, quantity) {
        const inventory = await this.getInventory(productId);
        if (inventory.CurrentStock < quantity) {
            throw new BadRequestError('Not enough current stock to decrease', 'INSUFFICIENT_CURRENT_STOCK');
        }
        inventory.CurrentStock -= quantity;
        await inventoryRepository.update(inventory);
        await this.updateInventoryCache(inventory);
        await this.checkAndPublishLowStock(inventory);
        return inventory;
    }

    async reserveStock(productId, quantity) {
        const inventory = await this.getInventory(productId);
        if (inventory.AvailableStock < quantity) {
            throw new BadRequestError('Not enough available stock to reserve', 'INSUFFICIENT_AVAILABLE_STOCK');
        }
        inventory.ReservedStock += quantity;
        await inventoryRepository.update(inventory);
        await this.updateInventoryCache(inventory);
        await this.checkAndPublishLowStock(inventory);
        return inventory;
    }

    async releaseStock(productId, quantity) {
        const inventory = await this.getInventory(productId);
        if (inventory.ReservedStock < quantity) {
            throw new BadRequestError('Not enough reserved stock to release', 'INVALID_RESERVED_STOCK');
        }
        inventory.ReservedStock -= quantity;
        await inventoryRepository.update(inventory);
        await this.updateInventoryCache(inventory);
        return inventory;
    }
}

export default new InventoryService();
