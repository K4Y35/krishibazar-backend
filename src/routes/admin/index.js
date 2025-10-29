import express from 'express';
import authRoute from './auth.js';
import usersRoute from './users.js';
import rbacRoute from './rbac.js';
import projectsRoute from './projects.js';
import investmentsRoute from './investments.js';
import productsRoute from './products.js';
import projectUpdatesRoute from './project-updates.js';
import investmentReportsRoute from './investment-reports.js';
import chatRoute from './chat.js';
import categoriesRoute from './categories.js';
import ordersRoute from './orders.js';
const router = express.Router();


router.use('/auth', authRoute);
router.use('/users', usersRoute);
router.use('/rbac', rbacRoute);
router.use('/projects', projectsRoute);
router.use('/investments', investmentsRoute);
router.use('/products', productsRoute);
router.use('/project-updates', projectUpdatesRoute);
router.use('/investment-reports', investmentReportsRoute);
router.use('/chat', chatRoute);
router.use('/categories', categoriesRoute);
router.use('/orders', ordersRoute);

export default router;


