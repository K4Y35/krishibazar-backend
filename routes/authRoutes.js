const express = require('express');
const router = express.Router();
const { register, verifyOTP, login } = require('../controllers/authController');
const {
  getPendingFarmers,
  getFarmerDetails,
  approveFarmer,
  rejectFarmer,
  getPendingInvestors,
  getInvestorDetails,
  approveInvestor,
  rejectInvestor,
} = require("../controllers/adminController");
const upload = require("../middleware/fileUpload");
const adminAuth = require("../middleware/adminAuth");

// Public routes
router.post(
  "/register",
  upload.fields([
    { name: "nid_front", maxCount: 1 },
    { name: "nid_back", maxCount: 1 },
  ]),
  register
);

// Verify OTP
router.post("/verify-otp", verifyOTP);

// Login user
router.post("/login", login);

router.get("/pending-farmers", getPendingFarmers);
router.get("/farmer/:id", getFarmerDetails);
router.post("/farmer/:id/approve", approveFarmer);
router.post("/farmer/:id/reject", rejectFarmer);

// Investor routes
router.get("/pending-investors", getPendingInvestors);
router.get("/investor/:id", getInvestorDetails);
router.post("/investor/:id/approve", approveInvestor);
router.post("/investor/:id/reject", rejectInvestor);

module.exports = router; 