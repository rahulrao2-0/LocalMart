import cartService from '../services/cartService.js';

class CartController {
    async getCart(req, res, next) {
        try {
            const cart = await cartService.getCart(req.user.userId);
            res.json(cart);
        } catch (err) {
            next(err);
        }
    }

    async addItem(req, res, next) {
        try {
            const cart = await cartService.addItemToCart(req.user.userId, req.body);
            res.status(201).json(cart);
        } catch (err) {
            next(err);
        }
    }

    async updateItemQuantity(req, res, next) {
        try {
            const cart = await cartService.updateItemQuantity(req.user.userId, req.params.productId, req.body.quantity);
            res.json(cart);
        } catch (err) {
            next(err);
        }
    }

    async removeItem(req, res, next) {
        try {
            const cart = await cartService.removeItem(req.user.userId, req.params.productId);
            res.json(cart);
        } catch (err) {
            next(err);
        }
    }

    async clearCart(req, res, next) {
        try {
            const cart = await cartService.clearCart(req.user.userId);
            res.json(cart);
        } catch (err) {
            next(err);
        }
    }

    async checkout(req, res, next) {
        try {
            const result = await cartService.checkoutCart(req.user.userId);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
}

export default new CartController();
