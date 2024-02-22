import levelModel from "../models/Level.js";
import {userModel} from "../models/User.js";
import {error,success} from "../utills/responseWrapper.utill.js"



export  async function postLevelController(req,res){
    try {
        const {level,score} = req.body;
        const user = req._id;
        if(!level || !coins)
        return res.send(error(404,"all fields are required"));
    
        const isLevelExist = await levelModel.findOne({$and:[{level},{user}]});
        if(isLevelExist){
            return res.send(error(409,"Level already exists"));
        }
        const levelInfo = new levelModel({level,score,user});
        const createdLevel = await levelInfo.save();
                
        const currUser = await userModel.findById(user);
        currUser.Levels.push(createdLevel._id);
        await currUser.save();

        res.send(success(200,createdLevel));

    } catch (err) {
        return res.send(error(500, err.message));
    }
}

export  async function getLevelController(req,res){
    try {
        console.log("get levelss")
        const levelNo = req.params.levelNo;
        const user = req._id;
        const currUser = await userModel.findById(user);
        if(!currUser){
            return res.send(error(404,"user does not exist! "));
        }
        const levelInfo = await levelModel.findOne({$and : [{"level":levelNo},{user}]}).populate('user');;
        if(!levelInfo){
            return res.send(error(404,"level info does not exist!"));
        }
        return res.send(success(200,levelInfo));
        
    } catch (err) {
        return res.send(error(500,err.message));
    }
}
export async function getAllLevelsController(req, res) {
    try {
      const user = req._id;
      const currUser = await userModel.findById(user);
  
      if (!currUser) {
        return res.send(error(404,'User does not exist!'));
      }
  
      const allLevels = await levelModel.find({ user }).populate('user');;
  
      if (!allLevels || allLevels.length === 0) {
        return res.send(error(404,'No level information available!'));
      }
  
      return res.send(success(200,allLevels));
    } catch (err) {
      return res.send(error(500,err.message));
    }
}
export  async function updateLevelController(req,res){
    try {
        const levelNo = req.params.levelNo;
        const user = req._id;
        const {score} = req.body;
        const levelInfo = await levelModel.findOne({$and : [{"level":levelNo},{user}]});
        if(!levelInfo){
            return res.send(error(404,"level info does not exist!"));
        }

        if(levelInfo["score"]<score){
            levelInfo["score"]=score;
        }

        const savedLevel = await levelInfo.save();
        return res.send(success(200,savedLevel));


    } catch (err) {
       
        return res.send(error(500,err.message));
    }
}
