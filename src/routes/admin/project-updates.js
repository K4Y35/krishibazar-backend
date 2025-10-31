import express from "express";
import * as ProjectUpdateController from "../../controllers/Admin/ProjectUpdateController.js";
import adminAuth from "../../middlewares/adminAuth.js";
import requirePermission from "../../middlewares/requirePermission.js";
import upload from "../../middlewares/fileUpload.js";

const router = express.Router();

router.get(
  "/",
  adminAuth,
  requirePermission("project_management"),
  ProjectUpdateController.getAllUpdates
);

router.get(
  "/:id",
  adminAuth,
  requirePermission("project_management"),
  ProjectUpdateController.getUpdateById
);

router.post(
  "/",
  adminAuth,
  requirePermission("project_management"),
  upload.array("media_files", 5),
  ProjectUpdateController.createUpdate
);

router.put(
  "/:id",
  adminAuth,
  requirePermission("project_management"),
  ProjectUpdateController.updateUpdate
);

router.delete(
  "/:id",
  adminAuth,
  requirePermission("project_management"),
  ProjectUpdateController.deleteUpdate
);

export default router;
