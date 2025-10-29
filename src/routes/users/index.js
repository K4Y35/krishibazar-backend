import express from 'express';
import authRoute from './auth.js';
import userRoute from './user.js';
import investmentRoute from './investments.js';
import projectReportingRoute from './project-reporting.js';
import chatRoute from './chat.js';
import ordersRoute from './orders.js';
const router = express.Router();


router.use('/auth', authRoute);
router.use('/', userRoute);
router.use('/investments', investmentRoute);
router.use('/', projectReportingRoute);
router.use('/chat', chatRoute);
router.use('/orders', ordersRoute);


export default router;


