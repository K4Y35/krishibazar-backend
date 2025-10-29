import express from 'express';
import * as InvestmentController from '../../controllers/Admin/InvestmentController.js';
import adminAuth from '../../middlewares/adminAuth.js';

const router = express.Router();

// ============ ADMIN INVESTMENT ROUTES ============
// Get all investments with filters (any authenticated admin)
router.get('/', adminAuth, InvestmentController.getAllInvestments);

// Get investment by ID (any authenticated admin)
router.get('/:id', adminAuth, InvestmentController.getInvestmentById);

// Confirm investment payment (any authenticated admin)
router.put('/:id/confirm', adminAuth, InvestmentController.confirmInvestment);

// Cancel investment (any authenticated admin)
router.put('/:id/cancel', adminAuth, InvestmentController.cancelInvestment);

// Complete investment (any authenticated admin)
router.put('/:id/complete', adminAuth, InvestmentController.completeInvestment);

// Get investment statistics
router.get('/stats/project/:project_id', adminAuth, InvestmentController.getInvestmentStats);

export default router;
