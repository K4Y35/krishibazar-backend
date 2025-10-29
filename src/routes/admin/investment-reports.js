import express from 'express';
import * as InvestmentReportController from '../../controllers/Admin/InvestmentReportController.js';
import adminAuth from '../../middlewares/adminAuth.js';
import requirePermission from '../../middlewares/requirePermission.js';

const router = express.Router();

// Get all reports
router.get('/', adminAuth, InvestmentReportController.getAllReports);

// Get report by ID
router.get('/:id', adminAuth, InvestmentReportController.getReportById);

// Create report (admin with permission)
router.post('/', adminAuth, requirePermission('project_management'), InvestmentReportController.createReport);

// Update report
router.put('/:id', adminAuth, requirePermission('project_management'), InvestmentReportController.updateReport);

// Delete report
router.delete('/:id', adminAuth, requirePermission('project_management'), InvestmentReportController.deleteReport);

export default router;

