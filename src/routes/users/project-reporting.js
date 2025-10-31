import express from 'express';
import * as ProjectReportingController from '../../controllers/User/ProjectReportingController.js';
import userAuth from '../../middlewares/userAuth.js';

const router = express.Router();

router.get('/investments/:investment_id/updates', userAuth, ProjectReportingController.getInvestmentUpdates);

router.get('/investments/:investment_id/reports', userAuth, ProjectReportingController.getInvestmentReports);

router.get('/projects/:project_id', ProjectReportingController.getProjectWithDetails);

export default router;

