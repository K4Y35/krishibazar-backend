import express from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  approveProject,
  rejectProject,
  startProject,
  completeProject,
} from "../../controllers/Admin/ProjectController.js";
import adminAuth from "../../middlewares/adminAuth.js";
import requirePermission from "../../middlewares/requirePermission.js";
import upload from "../../middlewares/upload.js";

const router = express.Router();

router.get("/", adminAuth, getAllProjects);
router.get("/:id", adminAuth, getProjectById);

router.post(
  "/",
  adminAuth,
  requirePermission("project_management"),
  upload.fields([
    { name: "nid_card_front", maxCount: 1 },
    { name: "nid_card_back", maxCount: 1 },
    { name: "project_images", maxCount: 5 },
  ]),
  createProject
);

router.put(
  "/:id",
  adminAuth,
  requirePermission("project_management"),
  upload.fields([
    { name: "nid_card_front", maxCount: 1 },
    { name: "nid_card_back", maxCount: 1 },
    { name: "project_images", maxCount: 5 },
  ]),
  updateProject
);

router.delete(
  "/:id",
  adminAuth,
  requirePermission("project_management"),
  deleteProject
);

router.post(
  "/approve/:id",
  adminAuth,
  requirePermission("project_approval"),
  approveProject
);

router.post(
  "/reject/:id",
  adminAuth,
  requirePermission("project_approval"),
  rejectProject
);

router.post(
  "/start/:id",
  adminAuth,
  requirePermission("project_management"),
  startProject
);

router.post(
  "/complete/:id",
  adminAuth,
  requirePermission("project_management"),
  completeProject
);

export default router;
