import express from 'express';
import { postProgressAmountController,resetProgressAmount } from '../controllers/progressamount.controller.js';
import { checkUserLogin } from '../middlewares/middlewares.js';

const progressamountRouter = express.Router();

progressamountRouter.post('/insert',checkUserLogin,postProgressAmountController);
progressamountRouter.put('/reset',checkUserLogin,resetProgressAmount);

export default progressamountRouter;