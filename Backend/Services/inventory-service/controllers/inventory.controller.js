import inventoryService from '../services/inventory.service.js';
import { asyncHandler } from '@localmart/shared';

export const getInventory = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const inventory = await inventoryService.getInventory(productId);
    res.status(200).json({ success: true, data: inventory });
});

export const increaseStock = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const inventory = await inventoryService.increaseStock(productId, quantity);
    res.status(200).json({ success: true, data: inventory });
});

export const decreaseStock = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const inventory = await inventoryService.decreaseStock(productId, quantity);
    res.status(200).json({ success: true, data: inventory });
});

export const reserveStock = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const inventory = await inventoryService.reserveStock(productId, quantity);
    res.status(200).json({ success: true, data: inventory });
});

export const releaseStock = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const inventory = await inventoryService.releaseStock(productId, quantity);
    res.status(200).json({ success: true, data: inventory });
});

