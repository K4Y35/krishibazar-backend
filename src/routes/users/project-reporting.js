import express from 'express';
import * as ProjectReportingController from '../../controllers/User/ProjectReportingController.js';
import userAuth from '../../middlewares/userAuth.js';

const router = express.Router();

// Get updates for user's investment
router.get('/investments/:investment_id/updates', userAuth, ProjectReportingController.getInvestmentUpdates);

// Get reports for user's investment
router.get('/investments/:investment_id/reports', userAuth, ProjectReportingController.getInvestmentReports);

// Get project with all details (public or authenticated)
router.get('/projects/:project_id', ProjectReportingController.getProjectWithDetails);

export default router;

