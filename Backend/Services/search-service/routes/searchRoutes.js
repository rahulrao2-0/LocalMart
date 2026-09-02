import express from 'express';
import { searchProducts, autocomplete } from '../controllers/searchController.js';

const router = express.Router();

router.get('/products', searchProducts);
router.get('/autocomplete', autocomplete);

export default router;
