import cartService from '../services/cartService.js';

export const getCart = async (req, res, next) => {
    try {
        const cart = await cartService.getCart(req.user.userId);
        res.json(cart);
    } catch (err) {
        next(err);
    }
};

export const addItem = async (req, res, next) => {
    try {
        const cart = await cartService.addItemToCart(req.user.userId, req.body);
        res.status(201).json(cart);
    } catch (err) {
        next(err);
    }
};

export const updateItemQuantity = async (req, res, next) => {
    try {
        const cart = await cartService.updateItemQuantity(req.user.userId, req.params.productId, req.body.quantity);
        res.json(cart);
    } catch (err) {
        next(err);
    }
};

export const removeItem = async (req, res, next) => {
    try {
        const cart = await cartService.removeItem(req.user.userId, req.params.productId);
        res.json(cart);
    } catch (err) {
        next(err);
    }
};

export const clearCart = async (req, res, next) => {
    try {
        const cart = await cartService.clearCart(req.user.userId);
        res.json(cart);
    } catch (err) {
        next(err);
    }
};

export const checkout = async (req, res, next) => {
    try {
        const result = await cartService.checkoutCart(req.user.userId);
        res.json(result);
    } catch (err) {
        next(err);
    }
};
