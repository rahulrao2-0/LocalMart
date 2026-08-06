import cartService from '../services/cartService.js';

class CartController {
    async getCart(req, res) {
        try {
            const cart = await cartService.getCart(req.user.userId);
            res.json(cart);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async addItem(req, res) {
        try {
            const cart = await cartService.addItemToCart(req.user.userId, req.body);
            res.status(201).json(cart);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async updateItemQuantity(req, res) {
        try {
            const cart = await cartService.updateItemQuantity(req.user.userId, req.params.productId, req.body.quantity);
            res.json(cart);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async removeItem(req, res) {
        try {
            const cart = await cartService.removeItem(req.user.userId, req.params.productId);
            res.json(cart);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async clearCart(req, res) {
        try {
            const cart = await cartService.clearCart(req.user.userId);
            res.json(cart);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async checkout(req, res) {
        try {
            const result = await cartService.checkoutCart(req.user.userId);
            res.json(result);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}

export default new CartController();
