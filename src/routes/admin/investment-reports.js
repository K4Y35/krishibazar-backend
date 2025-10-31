import express from 'express';
import * as InvestmentReportController from '../../controllers/Admin/InvestmentReportController.js';
import adminAuth from '../../middlewares/adminAuth.js';
import requirePermission from '../../middlewares/requirePermission.js';

const router = express.Router();

router.get('/', adminAuth,requirePermission('project_management'), InvestmentReportController.getAllReports);
router.get('/:id', adminAuth,requirePermission('project_management'), InvestmentReportController.getReportById);
router.post('/', adminAuth,requirePermission('project_management'), InvestmentReportController.createReport);
router.put('/:id', adminAuth,requirePermission('project_management'), InvestmentReportController.updateReport);
router.delete('/:id', adminAuth, requirePermission('project_management'), InvestmentReportController.deleteReport);

export default router;

