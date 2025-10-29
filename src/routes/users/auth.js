import express from 'express';
import { login, register, requestPasswordReset, resetPassword, verifyOTP, resendOTP } from '../../controllers/User/AuthController.js';



const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

export default router;
