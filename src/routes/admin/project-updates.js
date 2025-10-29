import express from 'express';
import * as ProjectUpdateController from '../../controllers/Admin/ProjectUpdateController.js';
import adminAuth from '../../middlewares/adminAuth.js';
import requirePermission from '../../middlewares/requirePermission.js';
import upload from '../../middlewares/fileUpload.js';

const router = express.Router();

// Get all updates
router.get('/', adminAuth, ProjectUpdateController.getAllUpdates);

// Get update by ID
router.get('/:id', adminAuth, ProjectUpdateController.getUpdateById);

// Create update (admin with permission + file upload support)
router.post('/', adminAuth, requirePermission('project_management'), upload.array('media_files', 5), ProjectUpdateController.createUpdate);

// Update update
router.put('/:id', adminAuth, requirePermission('project_management'), ProjectUpdateController.updateUpdate);

// Delete update
router.delete('/:id', adminAuth, requirePermission('project_management'), ProjectUpdateController.deleteUpdate);

export default router;

