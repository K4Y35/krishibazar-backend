import express from 'express';
import * as InvestmentController from '../../controllers/User/InvestmentController.js';
import userAuth from '../../middlewares/userAuth.js';

const router = express.Router();

router.get('/', userAuth, InvestmentController.getUserInvestments);

router.get('/:id', userAuth, InvestmentController.getInvestmentById);

router.post('/', userAuth, InvestmentController.createInvestment);

router.put('/:id/cancel', userAuth, InvestmentController.cancelInvestment);

export default router;
