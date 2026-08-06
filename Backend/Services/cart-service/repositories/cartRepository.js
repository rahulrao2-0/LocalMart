const Cart = require('../models/Cart');

class CartRepository {
    async findCartByCustomerId(customerId) {
        return await Cart.findOne({ CustomerId: customerId });
    }

    async createCart(cartData) {
        const cart = new Cart(cartData);
        return await cart.save();
    }

    async saveCart(cart) {
        return await cart.save();
    }

    async deleteCart(customerId) {
        return await Cart.deleteOne({ CustomerId: customerId });
    }

    async updateProductsInAllCarts(productId, updateData) {
        const carts = await Cart.find({ 'Items.ProductId': productId });
        for (const cart of carts) {
            let updated = false;
            for (const item of cart.Items) {
                if (item.ProductId === productId) {
                    if (updateData.ProductName) item.ProductName = updateData.ProductName;
                    if (updateData.ProductImage) item.ProductImage = updateData.ProductImage;
                    updated = true;
                }
            }
            if (updated) {
                await cart.save();
            }
        }
    }

    async removeProductFromAllCarts(productId) {
        const carts = await Cart.find({ 'Items.ProductId': productId });
        for (const cart of carts) {
            cart.Items = cart.Items.filter(item => item.ProductId !== productId);
            cart.CartTotal = cart.Items.reduce((acc, item) => acc + item.Subtotal, 0);
            cart.TotalItems = cart.Items.reduce((acc, item) => acc + item.Quantity, 0);
            await cart.save();
        }
    }
}

module.exports = new CartRepository();
