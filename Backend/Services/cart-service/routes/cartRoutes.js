const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/', cartController.getCart.bind(cartController));
router.post('/', cartController.addItem.bind(cartController));
router.put('/items/:productId', cartController.updateItemQuantity.bind(cartController));
router.delete('/items/:productId', cartController.removeItem.bind(cartController));
router.delete('/', cartController.clearCart.bind(cartController));
router.post('/checkout', cartController.checkout.bind(cartController));

module.exports = router;
