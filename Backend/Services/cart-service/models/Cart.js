const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    ProductId: {
        type: String,
        required: true
    },
    SellerId: {
        type: String,
        required: true
    },
    ProductName: {
        type: String,
        required: true
    },
    ProductImage: {
        type: String
    },
    Quantity: {
        type: Number,
        required: true,
        min: 1
    },
    PriceAtAddition: {
        type: Number,
        required: true
    },
    Subtotal: {
        type: Number,
        required: true
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    CustomerId: {
        type: String,
        required: true,
        unique: true
    },
    Items: [cartItemSchema],
    CartTotal: {
        type: Number,
        default: 0
    },
    TotalItems: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
