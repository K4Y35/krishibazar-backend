import express from "express";
import {getAllProjects, getProjectById, createProject, updateProject, deleteProject, approveProject, rejectProject, startProject, completeProject} from "../../controllers/Admin/ProjectController.js";
import adminAuth from "../../middlewares/adminAuth.js";
import requireSuperAdmin from "../../middlewares/requireSuperAdmin.js";
import requirePermission from "../../middlewares/requirePermission.js";
import upload from "../../middlewares/upload.js";

const router = express.Router();

// ============ PROJECTS ============
// Get all projects with filters (any authenticated admin)
router.get("/", adminAuth, getAllProjects);

// Get project by ID (any authenticated admin)
router.get("/:id", adminAuth, getProjectById);

// Create new project (any authenticated admin with project_management permission)
router.post("/", adminAuth, upload.fields([
  { name: 'nid_card_front', maxCount: 1 },
  { name: 'nid_card_back', maxCount: 1 },
  { name: 'project_images', maxCount: 5 }
]), createProject);

// Update project (any authenticated admin with project_management permission)
router.put("/:id", adminAuth, upload.fields([
  { name: 'nid_card_front', maxCount: 1 },
  { name: 'nid_card_back', maxCount: 1 },
  { name: 'project_images', maxCount: 5 }
]), updateProject);

// Delete project (any authenticated admin with project_management permission)
router.delete("/:id", adminAuth, deleteProject);

// Approve project (super admin only)
router.post("/approve/:id", adminAuth, requireSuperAdmin, approveProject);

// Reject project (super admin only)
router.post("/reject/:id", adminAuth, requireSuperAdmin, rejectProject);

// Start project (admin with permission)
router.post("/start/:id", adminAuth, requirePermission('project_management'), startProject);

// Complete project (admin with permission)
router.post("/complete/:id", adminAuth, requirePermission('project_management'), completeProject);

export default router;
