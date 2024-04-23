import createChallengeModel from "../models/admin.challenge.js";
import challengemodel from "../models/user.challenge.model.js";
import { userModel } from "../models/User.js";
import { success,error } from "../utills/responseWrapper.utill.js";

export async function insertChallengeController(req,res){
    try{
        const user =req._id;
        const {name} = req.body;

        const currUser = await userModel.findById(user)
        if(!currUser){
            return res.send(404, 'User Not Found')
        }
    
        const activeChallenge = await challengemodel.findOne({user, status:"incomplete"})
        if(activeChallenge){
          return res.status(400).send(400, 'You already have an active challenge');
        } 
     const challengeDetails = await createChallengeModel.findOne({ name });
        if (!challengeDetails) {
          return res.send(error(404, 'Challenge not found'));
        }
    
        if (!challengeDetails.isActive) {
          return res.send(error(400, 'Challenge is not active'));
        }
        const now = new Date(); // Current UTC date
      const utcOffset = 5.5 * 60 * 60 * 1000; // Indian Standard Time (IST) offset in milliseconds (UTC+5:30)
      const istTime = new Date(now.getTime() + utcOffset); // Convert UTC to IST
  
      // Create startTime and endTime based on IST
      const startTime = istTime;
      const endTime = new Date(startTime.getTime() + challengeDetails.duration);
    
        const challengeInfo = new challengemodel({ user,startTime: startTime, endTime, name,
          taskamount:challengeDetails.taskamount,duration:challengeDetails.duration,status:"incomplete" });
        const createchallenges = await challengeInfo.save();
    
        if(!currUser.challenges){
                   currUser.challenges = []
                  }
    
        currUser.challenges.push(createchallenges._id);
        await currUser.save(); 
        const response = {
          _id: createchallenges._id,
          name: createchallenges.name,
          startTime: createchallenges.startTime,
          status: createchallenges.status,
          user: createchallenges.user,
          taskamount : createchallenges.taskamount,
          duration: createchallenges.duration,
      };
        return res.send(success(200, "Challenge started successfully",response));
      } catch (err) {
        return res.send(error(500, err.message));
      }
    }


export async function updateChallengeController(req,res){
    try{
        const user = req._id;
        const {name,status} = req.body;
        const currUser = await userModel.findById(user)
        if(!currUser){
            return res.send(error(404,'User not Found'))
        }
        const challengeDetails = await createChallengeModel.findOne({name})
        console.log(challengeDetails)
        const challengeInfo = await challengemodel.findOne({name})
        
        
    if (status === "complete"){
        
        currUser.INR += challengeDetails.rewards
    }
        if(currUser.challenges){
        currUser.challenges = currUser.challenges.filter(challengeId => challengeId.toString() !==challengeInfo._id.toString())
        await currUser.save()
    }
    const challengeDelete = await challengemodel.findOneAndDelete({name,user});
          if(!challengeDelete){
            return res.send(error(404,"No challenge have been played by you"));
          }
    challengeInfo.status = status
    await challengeInfo.save()
    return res.send(success(200,"Challenge Completed successfully"))
    }catch(error){
        return res.send(500,error.message)
    }
}

export async function getAllChallengeController(req,res){
   
    try{
        const user =req._id;
        const currUser = await userModel.findById(user)
        if (!currUser){
            return res.send(error(404,'User Does Not Exist'));
        }
        const completedChallenges = await challengemodel.find({user})

        const ongoingChallenges = await challengemodel.find({user, remainingTime:{$gt: 0}})

        const allChallenges = [...completedChallenges,...ongoingChallenges]

      if(allChallenges.length === 0) {
        return res.send(error(404,"no challenge have been played by you"));
      }
      console.log(allChallenges)
      
        const challengesResponse = allChallenges.map(challenges => {
          return {
              _id: challenges._id,
              name: challenges.name,
              startTime: challenges.startTime,
              remainingTime: challenges.remainingTime,
              status: challenges.status,
              duration: challenges.duration,
              taskamount: challenges.taskamount,
          };
          
      });
   console.log(challengesResponse)
         console.log(allChallenges);
        return res.send(success(200,allChallenges));
       

    } catch (err) {
        return res.send(error(500,err.message));
    }
}

       