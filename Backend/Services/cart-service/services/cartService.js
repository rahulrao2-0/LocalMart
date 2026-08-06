import cartRepository from '../repositories/cartRepository.js';
import axios from 'axios';
import { publishEvent, TOPICS } from '@localmart/shared';

class CartService {
    async getCart(customerId) {
        let cart = await cartRepository.findCartByCustomerId(customerId);
        if (!cart) {
            cart = await cartRepository.createCart({ CustomerId: customerId, Items: [] });
        }
        return cart;
    }

    async addItemToCart(customerId, itemData) {
        // Validate product with product service
        try {
            const productRes = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/${itemData.productId}`);
            const product = productRes.data;
            if (!product || !product.active || product.stock < itemData.quantity) {
                throw new Error('Product not available or insufficient stock');
            }
            
            // Check price mismatch if necessary, or just use product price
            itemData.price = product.price;
            itemData.productName = product.name;
            itemData.sellerId = product.sellerId;
            itemData.productImage = product.image;
        } catch (err) {
            throw new Error('Error validating product: ' + err.message);
        }

        let cart = await cartRepository.findCartByCustomerId(customerId);
        if (!cart) {
            cart = await cartRepository.createCart({ CustomerId: customerId, Items: [] });
        }

        const existingItemIndex = cart.Items.findIndex(item => item.ProductId === itemData.productId);
        if (existingItemIndex > -1) {
            cart.Items[existingItemIndex].Quantity += itemData.quantity;
            cart.Items[existingItemIndex].Subtotal = cart.Items[existingItemIndex].Quantity * itemData.price;
        } else {
            cart.Items.push({
                ProductId: itemData.productId,
                SellerId: itemData.sellerId,
                ProductName: itemData.productName,
                ProductImage: itemData.productImage,
                Quantity: itemData.quantity,
                PriceAtAddition: itemData.price,
                Subtotal: itemData.quantity * itemData.price
            });
        }

        this.updateTotals(cart);
        return await cartRepository.saveCart(cart);
    }

    async updateItemQuantity(customerId, productId, quantity) {
        const cart = await cartRepository.findCartByCustomerId(customerId);
        if (!cart) throw new Error('Cart not found');

        const item = cart.Items.find(item => item.ProductId === productId);
        if (!item) throw new Error('Item not found in cart');

        if (quantity <= 0) {
            cart.Items = cart.Items.filter(item => item.ProductId !== productId);
        } else {
            item.Quantity = quantity;
            item.Subtotal = item.Quantity * item.PriceAtAddition;
        }

        this.updateTotals(cart);
        return await cartRepository.saveCart(cart);
    }

    async removeItem(customerId, productId) {
        const cart = await cartRepository.findCartByCustomerId(customerId);
        if (!cart) throw new Error('Cart not found');

        cart.Items = cart.Items.filter(item => item.ProductId !== productId);
        this.updateTotals(cart);
        return await cartRepository.saveCart(cart);
    }

    async clearCart(customerId) {
        const cart = await cartRepository.findCartByCustomerId(customerId);
        if (cart) {
            cart.Items = [];
            cart.CartTotal = 0;
            cart.TotalItems = 0;
            return await cartRepository.saveCart(cart);
        }
        return null;
    }

    async checkoutCart(customerId) {
        const cart = await cartRepository.findCartByCustomerId(customerId);
        if (!cart || cart.Items.length === 0) throw new Error('Cart is empty');

        await publishEvent(TOPICS.CART_CHECKED_OUT, {
            CustomerId: customerId,
            CartId: cart._id,
            Items: cart.Items,
            TotalAmount: cart.CartTotal
        });

        cart.Items = [];
        cart.CartTotal = 0;
        cart.TotalItems = 0;
        await cartRepository.saveCart(cart);
        return { message: 'Checkout event published' };
    }

    updateTotals(cart) {
        cart.CartTotal = cart.Items.reduce((acc, item) => acc + item.Subtotal, 0);
        cart.TotalItems = cart.Items.reduce((acc, item) => acc + item.Quantity, 0);
    }
}

export default new CartService();
