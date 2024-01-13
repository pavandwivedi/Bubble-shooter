import express from 'express';
import {postLevelController,getLevelController,updateLevelController, getAllLevelsController} from '../controllers/levelController.js';
import { checkUserLogin } from '../middlewares/middlewares.js';

const levelRouter = express.Router();
levelRouter.post('/insert',checkUserLogin,postLevelController);
levelRouter.get('/retrieve/:levelNo',checkUserLogin, getLevelController);
levelRouter.patch('/update/:levelNo',checkUserLogin,updateLevelController);
levelRouter.get('/retrieveAll',checkUserLogin, getAllLevelsController);

export default levelRouter;