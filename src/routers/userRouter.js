import express from 'express';
import { authenticLoginController, getUserController, guestLoginController, referAndEarnController, userUpdateController } from '../controllers/userController.js';
import { checkUserLogin } from '../middlewares/middlewares.js';

const userRouter = express.Router();

userRouter.post('/authLogin',authenticLoginController);
userRouter.post('/guestLogin',guestLoginController);
userRouter.get('/get',checkUserLogin , getUserController);
userRouter.put('/update',checkUserLogin,userUpdateController);
userRouter.post('/refer',checkUserLogin,referAndEarnController);

export default userRouter;