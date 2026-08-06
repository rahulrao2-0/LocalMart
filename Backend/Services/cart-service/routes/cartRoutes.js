import express from 'express';
const router = express.Router();
import cartController from '../controllers/cartController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

router.use(authenticate);

router.get('/', cartController.getCart.bind(cartController));
router.post('/', cartController.addItem.bind(cartController));
router.put('/items/:productId', cartController.updateItemQuantity.bind(cartController));
router.delete('/items/:productId', cartController.removeItem.bind(cartController));
router.delete('/', cartController.clearCart.bind(cartController));
router.post('/checkout', cartController.checkout.bind(cartController));

export default router;
