import express from "express";
<<<<<<< HEAD
import { getAllUsers, getKycListController, loginController, signupController, updateKycStatusController ,createChallengeController,updateChallengeController,deleteChallengeController} from "../controllers/adminController.js";
=======
import { getAllUsers, getKycListController, loginController, signupController, updateKycStatusController } from "../controllers/adminController.js";
>>>>>>> 7c232746f2f3105338217cbb0175d2312aed975f
import { checkAdminLogin } from "../middlewares/middlewares.js";

const adminRouter = express.Router();


adminRouter.post("/signup",signupController);
adminRouter.post("/login",loginController);
adminRouter.get("/getallusers",checkAdminLogin,getAllUsers);
adminRouter.put('/updatekycstatus/:_id',checkAdminLogin,updateKycStatusController);
adminRouter.get('/getkyclist',checkAdminLogin,getKycListController);
<<<<<<< HEAD
adminRouter.post('/createChallenge',checkAdminLogin,createChallengeController);
adminRouter.put('/updateChallenge/:id',checkAdminLogin,updateChallengeController);
adminRouter.delete('/deleteChallenge/:id',checkAdminLogin,deleteChallengeController);
=======

>>>>>>> 7c232746f2f3105338217cbb0175d2312aed975f

export default adminRouter;
