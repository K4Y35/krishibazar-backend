import express from 'express';
import * as ProjectController from '../../controllers/Public/ProjectController.js';

const router = express.Router();

router.get('/', ProjectController.getApprovedProjects);
router.get('/:id', ProjectController.getProjectById);

export default router;
