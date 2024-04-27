import express from 'express';
import { checkUserLogin } from '../middlewares/middlewares.js';
import {insertChallengeController,getAllChallengeController,updateChallengeController} from '../controllers/challenge.controller.js'
import { updateInrController } from '../controllers/userController.js';
const  challengeRouter = express.Router()

challengeRouter.post('/insertChallenge',checkUserLogin,insertChallengeController)
challengeRouter.get('/getChallenge',checkUserLogin,getAllChallengeController)
challengeRouter.put('/updateChallenge', checkUserLogin,updateChallengeController)
challengeRouter.put('/updateINR',checkUserLogin,updateInrController)
export default challengeRouter
