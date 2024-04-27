import createChallengeModel from "../models/admin.challenge.js";
import challengemodel from "../models/user.challenge.model.js";
import { userModel } from "../models/User.js";
import { success,error } from "../utills/responseWrapper.utill.js";
import CompletedChallenge from "../models/completedChallenge.js";

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
          return res.send(404, 'Challenge not found');
        }
    
        if (!challengeDetails.isActive) {
          return res.send(400, 'Challenge is not active');
        }
        const now = new Date(); // Current UTC date
      const utcOffset = 5.5 * 60 * 60 * 1000; // Indian Standard Time (IST) offset in milliseconds (UTC+5:30)
      const istTime = new Date(now.getTime() + utcOffset); // Convert UTC to IST
  
      // Create startTime and endTime based on IST
      const startTime = istTime;
      const endTime = new Date(startTime.getTime() + challengeDetails.duration);
    
        const challengeInfo = new challengemodel({ 
          user,
          startTime: startTime, 
          endTime, 
          name,
          rewards: challengeDetails.rewards,
          taskamount:challengeDetails.taskamount,
          duration:challengeDetails.duration,
          status:"incomplete",
          referenceId: challengeDetails.referenceId
         });
        const createchallenges = await challengeInfo.save();
    
        if(!currUser.challenges){
                   currUser.challenges = []
                  }
    
        currUser.challenges.push({challengeId:createchallenges._id,referenceId:challengeDetails.referenceId});
        await currUser.save(); 
        const response = {
          _id: createchallenges._id,
          name: createchallenges.name,
          startTime: createchallenges.startTime,
          status: createchallenges.status,
          user: createchallenges.user,
          rewards: createchallenges.rewards,
          taskamount : createchallenges.taskamount,
          duration: createchallenges.duration,
          referenceId: challengeDetails.referenceId
      };
        return res.send(success(200, "Challenge started successfully",response));
      } catch (err) {
        return res.send(500, err.message);
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
        const challengeInfo = await challengemodel.findOne({name,user})
        if(!challengeInfo){
          return res.send(error(404,"No challenge found"))
        }
        const existingChallenge = await challengemodel.findOne({name,user});
        if (!existingChallenge) {
          return res.send(error(400, "No Challenge Found for this user exists"));
        }

    if (status === "complete" && challengeInfo.status !== 'complete'){
        
        currUser.INR += challengeDetails.rewards
    
        if(currUser.challenges){
        // currUser.challenges = currUser.challenges.filter(challengeId => challengeId.toString() !==challengeInfo._id.toString())
        await currUser.save()
    }
    // const challengeDelete = await challengemodel.findOneAndDelete({name,user});
    //       if(!challengeDelete){
    //         return res.send(404,"No challenge have been played by you");
    //       }

    const completedChallenge = new CompletedChallenge({
      user : user,
      challenge:challengeInfo._id,
      status:status,
      referenceId:challengeInfo.referenceId
    })
    console.log(completedChallenge)

    await completedChallenge.save()
  }
    existingChallenge.status = status
    await existingChallenge.save();

    await challengemodel.findOneAndDelete({name,user})
    
   
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
            return res.send(404,'User Does Not Exist');
        }
        const completedChallenges = await challengemodel.find({user})

        const ongoingChallenges = await challengemodel.find({user, remainingTime:{$gt: 0}})

        const allChallenges = [...completedChallenges,...ongoingChallenges]

      if(allChallenges.length === 0) {
        return res.send(404,"no challenge have been played by you");
      }
      console.log(allChallenges)
      
        const challengesResponse = allChallenges.map(challenges => {
          return {
              _id: challenges._id,
              name: challenges.name,
              startTime: challenges.startTime,
              remainingTime: challenges.remainingTime,
              status: challenges.status,
              rewards: challenges.rewards,
            challengetype: challenges.challengetype,
              duration: challenges.duration,
              taskamount: challenges.taskamount,
          };
          
      });
   console.log(challengesResponse)
         console.log(allChallenges);
        return res.send(success(200,allChallenges));
       

    } catch (err) {
        return res.send(500,err.message);
    }
}

export async function getCompletedChallengesController(req,res){
  try {
    const user = req._id

    const completedchallenges = await CompletedChallenge.find({user,status:'complete'}).populate('challenge')

    if(completedchallenges.length ===0){
      return res.send(error(404,'No Completed Challenges Found',[]))
    }
    return res.send(success(200,'Completed Challenges',completedchallenges))
  }catch (err){
    return res.send(error(500,err.message));
  }
}