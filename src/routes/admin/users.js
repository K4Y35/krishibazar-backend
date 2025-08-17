import express from 'express';
import {
  getPendingFarmers,
  getFarmerDetails,
  approveFarmer,
  rejectFarmer,
  getPendingInvestors,
  getInvestorDetails,
  approveInvestor,
  rejectInvestor,
} from '../../controllers/Admin/UsersController.js';
import adminAuth from '../../middlewares/adminAuth.js';

const router = express.Router();

router.get('/pending-farmers', adminAuth, getPendingFarmers);
router.get('/farmer/:id', adminAuth, getFarmerDetails);
router.post('/farmer/:id/approve', adminAuth, approveFarmer);
router.post('/farmer/:id/reject', adminAuth, rejectFarmer);

router.get('/pending-investors', adminAuth, getPendingInvestors);
router.get('/investor/:id', adminAuth, getInvestorDetails);
router.post('/investor/:id/approve', adminAuth, approveInvestor);
router.post('/investor/:id/reject', adminAuth, rejectInvestor);

export default router;


