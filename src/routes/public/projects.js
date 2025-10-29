import express from 'express';
import * as ProjectController from '../../controllers/Public/ProjectController.js';

const router = express.Router();

// Public routes for the main site to fetch approved projects
router.get('/', ProjectController.getApprovedProjects);
router.get('/:id', ProjectController.getProjectById);

export default router;
