import userModel from "../models/User.js";
import { generateAccessToken } from "../services/generateAccessToken.service.js";
import { error, success } from "../utills/responseWrapper.utill.js";

export async function guestLoginController(req,res){
    try{
        const {deviceID} = req.body;
        if(!deviceID){
            return res.send(error(422,"insufficient data"));
        }

        const existingUser = await userModel.findOne({deviceID});
        // if user not present
        if(!existingUser){
            const newUser = new userModel({deviceID});
            const createdUser = await newUser.save();
            const accessToken = generateAccessToken({...createdUser});
            return res.send(success(200,{accessToken}));
        }
           // if user already present
           //const accessToken = generateAccessToken({...existingUser});
           return res.send(success(200,));

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

        // Check if user with same deviceID but different email exists
        if (existingUser && existingUser.email !== email) {
            // Create new user with the provided email
            const newUser = new userModel({ deviceID, name, email, profileURL });
            const createdUser = await newUser.save();
            const accessToken = generateAccessToken({ ...createdUser });
            return res.send(success(200, { accessToken,isNewUser: true }));
        }

        // If user not present or user with same deviceID and email exists, update existing user
        if (!existingUser) {
            const newUser = new userModel({ deviceID, name, email, profileURL });
            const createdUser = await newUser.save();
            const accessToken = generateAccessToken({ ...createdUser });
            return res.send(success(200, { accessToken,isNewUser: true }));
        } 
            existingUser.name = name;
            existingUser.email = email;
            existingUser.profileURL = profileURL;
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



