import express from 'express';
import * as InvestmentController from '../../controllers/User/InvestmentController.js';
import userAuth from '../../middlewares/userAuth.js';

const router = express.Router();

// ============ USER INVESTMENT ROUTES ============
// Get user's investments
router.get('/', userAuth, InvestmentController.getUserInvestments);

// Get investment by ID
router.get('/:id', userAuth, InvestmentController.getInvestmentById);

// Create new investment
router.post('/', userAuth, InvestmentController.createInvestment);

// Cancel investment
router.put('/:id/cancel', userAuth, InvestmentController.cancelInvestment);

export default router;
