import express from 'express';
import * as ProductController from '../../controllers/Public/ProductController.js';

const router = express.Router();

// Public routes for the main site to fetch products
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);

export default router;


