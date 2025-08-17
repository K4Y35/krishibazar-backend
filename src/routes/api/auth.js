import express from "express";
import {
  register,
  verifyOTP,
  login,
} from "../../controllers/Api/AuthController.js";
import userAuth from "../../middlewares/userAuth.js";

const router = express.Router();

router.post("/register", register);

router.post("/verify-otp", verifyOTP);
router.post("/login", userAuth, login);

export default router;
