import express from 'express';
import { authenticLoginController, createContactAccountController, createFundAccountController, createPayoutController, facebookLoginController, getUnlockLevels, getUserController, getdetailController, guestLoginController, kycController, referAndEarnController, updateUserController, userShopController, userUpdateController, withdrawRequestController } from '../controllers/userController.js';
import { checkUserLogin } from '../middlewares/middlewares.js';
import upload from '../middlewares/upload.js';
const userRouter = express.Router();

userRouter.post('/authLogin',authenticLoginController);
userRouter.post('/guestLogin',guestLoginController);
userRouter.post('/facebookLogin',facebookLoginController);
userRouter.get('/get',checkUserLogin , getUserController);
userRouter.put('/update',checkUserLogin,userUpdateController);
userRouter.post('/refer',checkUserLogin,referAndEarnController);
userRouter.put('/shop',checkUserLogin,userShopController);
userRouter.get("/unlockLevelCount",checkUserLogin,getUnlockLevels);
userRouter.get('/updateUser',checkUserLogin,updateUserController);
userRouter.get('/getdetails',getdetailController);
//userRouter.post('/kyc',checkUserLogin,upload.single('adharFront'),upload.single('adharBack'), upload.single('panFront'),kycController);
userRouter.post(
    '/kyc',
    checkUserLogin,
    upload.fields([
      { name: 'adharFront', maxCount: 1 },
      { name: 'adharBack', maxCount: 1 },
      { name: 'panFront', maxCount: 1 }
    ]),
    kycController
  );
userRouter.post('/withdrawrequest',checkUserLogin,withdrawRequestController);
userRouter.post('/createcontactaccount',checkUserLogin,createContactAccountController);
userRouter.post('/createfundaccount',checkUserLogin,createFundAccountController);
userRouter.post('/createpayout',checkUserLogin,createPayoutController);

export default userRouter;