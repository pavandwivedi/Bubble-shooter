import {userModel,guestModel,authModel, facebookModel} from "../models/User.js";
import { generateAccessToken } from "../services/generateAccessToken.service.js";
import { error, success } from "../utills/responseWrapper.utill.js";
import { generateUniqueReferralCode } from "../services/generateReferalCode.js";
export async function guestLoginController(req, res) {
    try {
        const { deviceID } = req.body;
        console.log(deviceID);
       
        if (!deviceID) {
            return res.send(error(422, "insufficient data"));
        }
       
        const existingUser = await guestModel.findOne({ deviceID });
       
        if (existingUser) {
            // If the existing user is found, delete it
            await guestModel.deleteOne({ deviceID });
        }
       
        const referralCode = generateUniqueReferralCode();
          
        const newUser = await guestModel.create({ deviceID, referralCode });
        console.log(newUser);
        const accessToken = generateAccessToken({ ...newUser })
        return res.send(success(200, { accessToken, isNewUser: true }));
        
    } catch (err) {
        return res.send(error(500, err.message));
    }
}

export async function authenticLoginController(req, res) {
    try {
        const { email, deviceID ,name} = req.body;
        if (!email || !deviceID || !name) {
            return res.send(error(422, "insufficient data"));
        }
    
        // Find existing user with the same email
        const guestUser = await guestModel.findOne({ deviceID });
        
        const existingUser = await authModel.findOne({ email });
        
        if (!existingUser) {
            
            // Generate referral code only for new users
            const referralCode = generateUniqueReferralCode();
            const newUser = new authModel({ email,name, referralCode });

            // Transfer guest user data to authenticated user
            if (guestUser) {
                newUser.life = guestUser.life; // Assuming name is a field you want to transfer
                newUser.coins = guestUser.coins;
                newUser.extraball = guestUser.extraball;
                newUser.fireball = guestUser.fireball;
                newUser.colorball = guestUser.colorball;
                newUser.levels = guestUser.levels;
                 
            }

            await newUser.save();

            // Delete guest user
            if (guestUser) {
                await guestModel.deleteOne({ _id: guestUser._id });
            }

            const accessToken = generateAccessToken({ ...newUser });
            return res.send(success(200, { accessToken, isNewUser: true }));
        } 

        const accessToken = generateAccessToken({ ...existingUser });
        return res.send(success(200, { accessToken, isNewUser: false }));

    } catch (err) {
        return res.send(error(500, err.message));
    }
}
export async function facebookLoginController(req, res) {
    try {
        const { facebookID, deviceID,name } = req.body;
        if (!facebookID && !deviceID ) {
            return res.send(error(422, "insufficient data"));
        }
    
    
        // Find existing user with the same email
        const guestUser = await guestModel.findOne({ deviceID });
        var existingUser;
        if(facebookID){
             existingUser = await facebookModel.findOne({ facebookID });
        }
       

        
        
        if (!existingUser) {
            
            // Generate referral code only for new users
            const referralCode = generateUniqueReferralCode();
            const newUser = new facebookModel({  
                referralCode, 
                facebookID,
                name
            });
            

            // Transfer guest user data to authenticated user
            if (guestUser) {
                newUser.life = guestUser.life; // Assuming name is a field you want to transfer
                newUser.coins = guestUser.coins;
                newUser.extraball = guestUser.extraball;
                newUser.fireball = guestUser.fireball;
                newUser.colorball = guestUser.colorball;
                newUser.levels = guestUser.levels;
                 
            }

            await newUser.save();

            // Delete guest user
            if (guestUser) {
                await guestModel.deleteOne({ _id: guestUser._id });
            }

            const accessToken = generateAccessToken({ ...newUser });
            return res.send(success(200, { accessToken, isNewUser: true }));
        } 

        const accessToken = generateAccessToken({ ...existingUser });
        return res.send(success(200, { accessToken, isNewUser: false }));

    } catch (err) {
        return res.send(error(500, err.message));
    }
}


export async function getUserController(req,res){
    try {
        console.log("get user called")
        const currUserId = req._id;
        const OriginalUser = await userModel.findOne({_id:currUserId}).populate('Levels');
        // console.log(OriginalUser);
        const user = OriginalUser;
        if(!user)
        return res.send("user not found!");
    
       res.send(user);
       OriginalUser.referedCount = 0;
       await OriginalUser.save();
       return;
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
        const originalReferedCount = user.referedCount;
        // Update user's fields ensuring non-negativity
        user.coins += coins || 0;
        user.life += life || 0;
        user.extraball += extraball || 0;
        user.fireball += fireball || 0;
        user.colorball += colorball || 0;

        // Save the user
        await user.save();

        // Restore the original referral code
        user.referralCode = originalReferralCode;
        user.referedCount = originalReferedCount;


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
        // console.log(referrer);
        referrer.referedCount++;
        await referrer.save();

        referred.coins += 10;
        referred.isReferUsed = true;
        await referred.save();
        
        // Restore the original referral codes
        referrer.referralCode = originalReferralCodeReferrer;
        referrer.isReferred = true;
        await referrer.save();

        referred.referralCode = originalReferralCodeReferred;
        await referred.save();

        return res.send(success(200, {isReferred:true}));

    } catch (err) {
        return res.send(error(500, err.message));
    }
}
export async function updateUserController (req,res){
    try {
        const userID = req._id;
        const user = await userModel.findById(userID);
        user.isReferred = false;
        await user.save();
        return res.send(success(200,"user updated successfully"))
    } catch (err) {
        return res.send(error(500,err.message));
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

export async function getUnlockLevels(req,res){
    try {
        const id = req._id;
        const user = await userModel.findById(id);
        const unlockLevelcount = user?.Levels?.length;
        return res.send(success(200,{unlockLevelcount}));
    } catch (err) {
        return res.send(error(500,err.message));
    }
}

export async function getdetailController(req,res){
    try {
        const allUsers = await userModel.find({},{__v:1,__t:1,referralCode:1,});

        return res.send(allUsers);
    } catch (err) {
        return res.send(error(500,err.message));
    }
}