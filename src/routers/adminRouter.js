import express from "express";
import { getAllUsers, getKycListController, loginController, signupController, updateKycStatusController ,createChallengeController,updateChallengeController,deleteChallengeController} from "../controllers/adminController.js";
import { checkAdminLogin } from "../middlewares/middlewares.js";

const adminRouter = express.Router();


adminRouter.post("/signup",signupController);
adminRouter.post("/login",loginController);
adminRouter.get("/getallusers",checkAdminLogin,getAllUsers);
adminRouter.put('/updatekycstatus/:_id',checkAdminLogin,updateKycStatusController);
adminRouter.get('/getkyclist',checkAdminLogin,getKycListController);
adminRouter.post('/createChallenge',checkAdminLogin,createChallengeController);
adminRouter.put('/updateChallenge/:id',checkAdminLogin,updateChallengeController);
adminRouter.delete('/deleteChallenge/:id',checkAdminLogin,deleteChallengeController);

export default adminRouter;
