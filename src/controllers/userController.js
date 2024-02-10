import userModel from "../models/User.js";
import { generateAccessToken } from "../services/generateAccessToken.service.js";
import { error, success } from "../utills/responseWrapper.utill.js";
import { generateUniqueReferralCode } from "../services/generateReferalCode.js";

export async function guestLoginController(req,res){
    try{
        const {deviceID} = req.body;
        if(!deviceID){
            return res.send(error(422,"insufficient data"));
        }

        const existingUser = await userModel.findOne({deviceID});
        const referralCode =  generateUniqueReferralCode();
        // if user not present
        if(!existingUser){
            const newUser = new userModel({deviceID,referralCode});
            const createdUser = await newUser.save();
            const accessToken = generateAccessToken({...createdUser});
            return res.send(success(200,{accessToken}));
        }
           // if user already present
           const accessToken = generateAccessToken({...existingUser});
           return res.send(success(200,accessToken));

    }catch (err) {
        return res.send(error(500,err.message));
    }
}
export async function authenticLoginController(req, res) {
    try {
        const { deviceID, name, email, profileURL } = req.body;
        if (!name || !email || !deviceID) {
            return res.send(error(422, "insufficient data"));
        }

        // Find existing user with the same deviceID
        let existingUser = await userModel.findOne({ email});
        const referralCode =  generateUniqueReferralCode();
        // Check if user with same deviceID but different email exists
        if (existingUser && existingUser.email !== email) {
            // Create new user with the provided email
            const newUser = new userModel({ deviceID, name, email, profileURL,referralCode });
            const createdUser = await newUser.save();
            const accessToken = generateAccessToken({ ...createdUser });
            return res.send(success(200, { accessToken,isNewUser: true }));
        }

        // If user not present or user with same deviceID and email exists, update existing user
        if (!existingUser) {
            const newUser = new userModel({ deviceID, name, email, profileURL,referralCode });
            const createdUser = await newUser.save();
            const accessToken = generateAccessToken({ ...createdUser });
            return res.send(success(200, { accessToken,isNewUser: true }));
        } 
            existingUser.name = name;
            existingUser.email = email;
            existingUser.profileURL = profileURL;
            existingUser. referralCode= referralCode;
            existingUser = await existingUser.save();
        

        const accessToken = generateAccessToken({ ...existingUser });
        return res.send(success(200, { accessToken,isNewUser:false }));

    } catch (err) {
        return res.send(error(500, err.message));
    }
}


export async function getUserController(req,res){
    try {
        console.log("get user called")
        const currUserId = req._id;
        const user = await userModel.findOne({_id:currUserId}).populate('Levels');
        if(!user)
        return res.send("user not found!");

        return res.send(user);
    } catch (error) {
        
    }
}

export async function userUpdateController(req,res){
    
    try {
        const userId = req._id;
        const{coins,life,extraball,fireball,colorball} = req.body;

        const user = await userModel.findById(userId);

        user.coins+= coins || 0;
        user.life += life || 0;
        user.extraball += extraball || 0;
        user.fireball += fireball || 0;
        user.colorball+= colorball || 0;

        await user.save();
        return res.send(success(200,user));

    } catch (err) {
        return res.send(error(500,err.message));
    }
}
export async function referAndEarnController(req,res){

    const currUser = req._id;
   
    const{referralCode} = req.body;
    try {
        const refferer = await userModel.findOne({referralCode}); 
        
        if(!refferer){
            return res.send(error(404,"refferer user not found"));
        } 
        const reffered = await userModel.findById({_id:currUser});
        if(!reffered){
            return res.send(error(404,"referred user not found"));
        }
        refferer.coins+=20;
        await refferer.save();
        reffered.coins+=10;
        await reffered.save();
     return res.send(success(200,"you have earn 10 coins by referal successfully "));
        
    } catch (err) {
        return res.send(error(500,err.message));
    }
}


