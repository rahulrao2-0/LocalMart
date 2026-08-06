import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    ProductId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    CurrentStock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    ReservedStock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    AvailableStock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    LowStockThreshold: {
        type: Number,
        required: true,
        default: 10,
    },
    Status: {
        type: String,
        enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'],
        default: 'OUT_OF_STOCK',
    }
}, { timestamps: { createdAt: 'CreatedAt', updatedAt: 'UpdatedAt' } });

// Pre-save hook to calculate AvailableStock and Status
inventorySchema.pre('save', function(next) {
    this.AvailableStock = this.CurrentStock - this.ReservedStock;
    
    if (this.AvailableStock < 0) {
        return next(new Error('AvailableStock cannot be less than 0'));
    }

    if (this.AvailableStock === 0) {
        this.Status = 'OUT_OF_STOCK';
    } else if (this.AvailableStock <= this.LowStockThreshold) {
        this.Status = 'LOW_STOCK';
    } else {
        this.Status = 'IN_STOCK';
    }
    
    next();
});

export default mongoose.model('Inventory', inventorySchema);
