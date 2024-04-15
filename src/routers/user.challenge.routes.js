import express from 'express';
import { checkUserLogin } from '../middlewares/middlewares.js';

import { getAllChallengeController, insertChallengeController, updateChallengeController } from '../controllers/challenge.controller.js';

const  challengeRouter = express.Router()

challengeRouter.post('/insertChallenge',checkUserLogin,insertChallengeController)
challengeRouter.get('/getChallenge',checkUserLogin,getAllChallengeController)
challengeRouter.put('/updateChallenge', checkUserLogin,updateChallengeController)

export default challengeRouter
