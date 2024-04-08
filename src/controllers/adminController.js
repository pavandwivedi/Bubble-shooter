import adminModel from "../models/Admin.js";
import {userModel} from "../models/User.js";
import dotenv from 'dotenv'
import { generateAccessToken } from "../services/generateAccessToken.service.js";
import {error,success} from "../utills/responseWrapper.utill.js";
import kycModel from "../models/user.kyc.model.js";
import createChallengeModel from "../models/admin.challenge.js"
import bcrypt from "bcrypt";
dotenv.config();


const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY || "greenwebsolutions";
export async function signupController(req,res){
    try {
        const {username,password,email} = req.body;
        if(!username || !password || !email){
            return res.send({message:"all fields are required"});
        }
        const hashedPassword = await bcrypt.hash(password,10);
        req.body["password"] = hashedPassword;
        const user = await adminModel.create(req.body);
        const  newuser = await adminModel.findById(user._id);
        return res.send({newuser});

    } catch (error) {
        return res.send({'error':error.message});
    }

}

export async function loginController(req,res){
    try {

        const {usernameOrEmail,password} = req.body;
        const user = await adminModel.findOne({
            $or:[{username:usernameOrEmail}, {email:usernameOrEmail}]
        }); 
        if(!user){
            return res.status(404).json({message:"user not found"});
        }

        const matched = await bcrypt.compare(password,user.password);
        if(!matched){
            return res.send({message:"incorrect password"});
        }

        const accessToken = generateAccessToken({...user})
        // const {_id,password,newuser} = user;
        delete user['_doc']['password'];
        delete user['_doc']['__v'];
        delete user._doc['_id'];
        // console.log(user);

        return res.send({...user._doc,"accessToken":accessToken});
        
    } catch (error) {
        return res.json({"error":error.message});
    }
}

export async function getAllUsers(req,res){
    try {
        const users = await userModel.find({}).populate('Levels');
        return res.send(users);

    } catch (error) {
        return res.send({message:error.message})
    }
}

export async function createChallengeController(req,res){
    const {name,description,isActive,rewards,duration,challengetype,taskamount} = req.body
    try{
   if(!name || !description || !rewards || !duration || !challengetype || !taskamount){
        return res.send(error(404,"Insufficient Data"))
    }

    const newChallenge = new createChallengeModel ({
        name, 
        description,
        isActive:isActive || true,
        rewards,
        duration,
        challengetype,
        taskamount
    })

    const savedChallenge = await newChallenge.save()

    return res.send(success(200,savedChallenge,"challenge created successfully",savedChallenge))
}catch (error){
    return res.send(error(500,error.message))
}
}

export async function getChallengeController(req,res){
    try{

        const challengeDetails = await createChallengeModel.find({})

        if(!challengeDetails){
            return res.send(error(404,"challenge not found"))
        }
        return res.send(success(200,challengeDetails,"challenge fetched successfully",challengeDetails))
    }catch(error){
        return res.send(error(500,error.message))
    }
}

export async function updateChallengeController(req,res){
 
    const {id} = req.params
    const {name,description,isActive,rewards,duration,challengetype,taskamount} = req.body
    try {
      const existingChallenge = await createChallengeModel.findById(id)

      if(!existingChallenge){
        return res.send(error(404,error.message))
      }
      if(name){
        existingChallenge.name = name;
      }
      if (description){
        existingChallenge.description = description;
      }
      if (isActive != undefined){
        existingChallenge.isActive = isActive;
      }
      if (rewards){
        existingChallenge.rewards = rewards;
      }
      if(duration){
        existingChallenge.duration = duration;
      }
      if(taskamount){
        existingChallenge.taskamount = taskamount;
      }
      if(challengetype){
        existingChallenge.challengetype = challengetype;
      }

      const updatedChallenge = await existingChallenge.save()

      return res.send(success(200,updatedChallenge,"challenge updated successfully",updatedChallenge))
    }catch(error){
        return res.send(error(500,err.message))
    }
}

export async function deleteChallengeController(req,res){
    try{
        const {id} = req.params
        await createChallengeModel.findByIdAndUpdate(id)
        return res.send(success(200,"challenge deleted successfully"))
    }catch(err){
        return res.send(error(500,err.message))
    }

}


export async function updateKycStatusController(req,res){
    try {
        const {status} = req.body;
        const user = req.params;
         const admin = req._id;
         const adminDetail = await adminModel.findById({_id:admin});
         if(!adminDetail){
            return res.send(error(404,"unauthorized access"));
         }
         
         const userDetails = await userModel.findByIdAndUpdate(user,{$set:{kycstatus:status}});
         
         const kycdetails = await kycModel.findOne({user:user});
         kycdetails.status = status;
         await kycdetails.save();
        
      
        return res.send(success(200,"user kyc details verified successfully",userDetails));

    } catch (err) {
        return res.send(error(500,err.message));
    }
}

export async function getKycListController(req,res){
    try {
        const admin = req._id;
         const adminDetail = await adminModel.findById({_id:admin});
         if(!adminDetail){
            return res.send(error(404,"unauthorized access"));
         }
        const kycList = await kycModel.find({});
        return res.send(success(200, kycList,"kyc list fetch successfully"));
    } catch (err) {
        return res.send(error(500,err.message));
    }
}