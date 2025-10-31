import express from 'express';
import * as InvestmentController from '../../controllers/Admin/InvestmentController.js';
import adminAuth from '../../middlewares/adminAuth.js';
import requirePermission from '../../middlewares/requirePermission.js';

const router = express.Router();

router.get('/', adminAuth,requirePermission('investment_management'), InvestmentController.getAllInvestments);

router.get('/:id', adminAuth,requirePermission('investment_management'), InvestmentController.getInvestmentById);

router.put('/:id/confirm', adminAuth,requirePermission('investment_management'), InvestmentController.confirmInvestment);

router.put('/:id/cancel', adminAuth,requirePermission('investment_management'), InvestmentController.cancelInvestment);

router.put('/:id/complete', adminAuth,requirePermission('investment_management'), InvestmentController.completeInvestment);

router.get('/stats/project/:project_id', adminAuth,requirePermission('investment_management'), InvestmentController.getInvestmentStats);

export default router;
