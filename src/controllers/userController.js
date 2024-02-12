import userModel from "../models/User.js";
import { generateAccessToken } from "../services/generateAccessToken.service.js";
import { error, success } from "../utills/responseWrapper.utill.js";
import { generateUniqueReferralCode } from "../services/generateReferalCode.js";
export async function guestLoginController(req, res) {
    try {
        const { deviceID } = req.body;
        if (!deviceID) {
            return res.send(error(422, "insufficient data"));
        }

        let existingUser = await userModel.findOne({ deviceID });

        // if user not present
        if (!existingUser) {
            const referralCode = generateUniqueReferralCode();
            const newUser = new userModel({ deviceID, referralCode });
            existingUser = await newUser.save();
        }

        const accessToken = generateAccessToken({ ...existingUser });
        return res.send(success(200, { accessToken }));
    } catch (err) {
        return res.send(error(500, err.message));
    }
}

export async function authenticLoginController(req, res) {
    try {
        const { deviceID, name, email, profileURL } = req.body;
        if (!name || !email || !deviceID) {
            return res.send(error(422, "insufficient data"));
        }

        // Find existing user with the same email
        let existingUser = await userModel.findOne({ email });
        let isNewUser = false; // Flag to indicate if the user is new

        // If user not present or user with same email exists, create/update user
        if (!existingUser) {
            // Generate referral code only for new users
            const referralCode = generateUniqueReferralCode();
            const newUser = new userModel({ deviceID, name, email, profileURL, referralCode });
            existingUser = await newUser.save();
            isNewUser = true; // Set flag to true as it's a new user
        } else {
            // Update existing user's information
            existingUser.deviceID = deviceID;
            existingUser.name = name;
            existingUser.email = email;
            existingUser.profileURL = profileURL;
            existingUser = await existingUser.save();
        }

        const accessToken = generateAccessToken({ ...existingUser });
        return res.send(success(200, { accessToken, isNewUser }));

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

export async function userUpdateController(req, res) {
    try {
        const userId = req._id;
        const { coins, life, extraball, fireball, colorball } = req.body;

        const user = await userModel.findById(userId);

        // Store the original referral code
        const originalReferralCode = user.referralCode;

        // Update user's fields
        user.coins += coins || 0;
        user.life += life || 0;
        user.extraball += extraball || 0;
        user.fireball += fireball || 0;
        user.colorball += colorball || 0;

        // Save the user
        await user.save();

        // Restore the original referral code
        user.referralCode = originalReferralCode;

        return res.send(success(200, user));
    } catch (err) {
        return res.send(error(500, err.message));
    }
}

export async function referAndEarnController(req, res) {
    const currUser = req._id;
    const { referralCode } = req.body;
    try {
        const referrer = await userModel.findOne({ referralCode });

        if (!referrer) {
            return res.send(error(404, "referrer user not found"));
        }

        const referred = await userModel.findById(currUser);

        if (!referred) {
            return res.send(error(404, "referred user not found"));
        }

        // Store the original referral code of both referrer and referred
        const originalReferralCodeReferrer = referrer.referralCode;
        const originalReferralCodeReferred = referred.referralCode;

        // Perform the referral and earn operations
        referrer.coins += 20;
        await referrer.save();

        referred.coins += 10;
        await referred.save();

        // Restore the original referral codes
        referrer.referralCode = originalReferralCodeReferrer;
        await referrer.save();

        referred.referralCode = originalReferralCodeReferred;
        await referred.save();

        return res.send(success(200, "You have earned 10 coins by referral successfully"));

    } catch (err) {
        return res.send(error(500, err.message));
    }
}

export async function userShopController(req,res){
    try {
        const {coins} = req.body;
        const userId = req._id;
        const  user = await userModel.findById({_id:userId});
        const originalReferralCode = user.referralCode;
        if (coins==50){
            user.life+=1;
            user.coins-=50;
        }
        if(coins==150){
            user.colorball+=5;
            user.coins-=150;
        }
        if(coins==140){
            user.extraball+=3;
            user.coins-=140;
        }
        if(coins==180){
            user.life+=4;
            user.coins-=180;
        }
        if(coins==250){
            user.fireball+=5;
            user.coins-=250;
        }

        await user.save();
        user.referralCode = originalReferralCode;
        return res.send(success(200,user));
    } catch (err) {
        return res.send(error(500,err.message));
    }
}


