import express from 'express';
import apiAuth from './api/auth.js';
import api from './api/index.js';
import adminUsers from './admin/users.js';

const router = express.Router();

router.use('/api/auth', apiAuth);
router.use('/api', api);
router.use('/admin/users', adminUsers);

export default router;


