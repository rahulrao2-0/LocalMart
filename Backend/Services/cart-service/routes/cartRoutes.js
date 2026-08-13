import express from 'express';
const router = express.Router();
import { 
    getCart, 
    addItem, 
    updateItemQuantity, 
    removeItem, 
    clearCart, 
    checkout 
} from '../controllers/cartController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

router.use(authenticate);

router.get('/', getCart);
router.post('/', addItem);
router.put('/items/:productId', updateItemQuantity);
router.delete('/items/:productId', removeItem);
router.delete('/', clearCart);
router.post('/checkout', checkout);

export default router;
