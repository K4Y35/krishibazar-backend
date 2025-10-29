import express from 'express';
import { changePassword, getUserDetails } from '../../controllers/User/UserController.js';
import userAuth from '../../middlewares/userAuth.js';

const router = express.Router();


router.get('/get-user-details/:id', getUserDetails);
router.post('/change-password', userAuth, changePassword);

export default router;