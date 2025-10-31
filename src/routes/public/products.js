import express from 'express';
import * as ProductController from '../../controllers/Public/ProductController.js';

const router = express.Router();

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);

export default router;


