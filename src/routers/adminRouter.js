import express from "express";
import { getAllUsers, loginController, signupController, updateKycStatusController } from "../controllers/adminController.js";
import { checkAdminLogin } from "../middlewares/middlewares.js";

const adminRouter = express.Router();


adminRouter.post("/signup",signupController);
adminRouter.post("/login",loginController);
adminRouter.get("/getallusers",checkAdminLogin,getAllUsers);
adminRouter.put('/updatekycstatus/:_id',checkAdminLogin,updateKycStatusController);


export default adminRouter;
