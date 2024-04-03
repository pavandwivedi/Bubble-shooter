import {userModel,guestModel,authModel, facebookModel} from "../models/User.js";
import { generateAccessToken } from "../services/generateAccessToken.service.js";
import { error, success } from "../utills/responseWrapper.utill.js";
import { generateUniqueReferralCode } from "../services/generateReferalCode.js";
import kycModel from "../models/user.kyc.model.js";
import WithdrawRequestModel from "../models/user.withdrawrequest.model.js";
import axios from "axios";
import contactModel from "../models/user.contact_id.model.js";
import upiFundModel from "../models/user.upi_fund_account_id.model.js";
import bankFundModel from "../models/user.bank_fund_account_id.model.js";
import payoutModel from "../models/user.payout.model.js";
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

export async function getdetailController(req, res) {
    try {
        const allUsers = await userModel.find({}, { __v: 1,   });
        const totalUsers = await userModel.countDocuments();
        const zeroCount = await userModel.countDocuments({ __v: 0 });
        const oneCount = await userModel.countDocuments({ __v: 1 });
        const twoCount = await userModel.countDocuments({ __v: 2 });
        const threeCount = await userModel.countDocuments({ __v: 3 });
        const fourCount = await userModel.countDocuments({ __v: 4 });
        const fiveCount = await userModel.countDocuments({ __v: 5});
        const sixCount = await userModel.countDocuments({ __v: 6 });
        const sevenCount = await userModel.countDocuments({ __v: 7 });
        const eightCount = await userModel.countDocuments({ __v: 8});
        const nineCount = await userModel.countDocuments({ __v: 9 });
        const tenCount = await userModel.countDocuments({ __v: 10});
        const elevenCount = await userModel.countDocuments({ __v: 11 });
        const twelveCount = await userModel.countDocuments({ __v: 12 });
        const thirteenCount = await userModel.countDocuments({ __v: 13 });
        const fourteenCount = await userModel.countDocuments({ __v: 14 });
        const fifteenCount = await userModel.countDocuments({ __v: 15 });
        const sixteenCount = await userModel.countDocuments({ __v: 16 });
        const seventeenCount = await userModel.countDocuments({ __v: 17 });
        const eighteenCount = await userModel.countDocuments({ __v: 18 });
        const ninteenCount = await userModel.countDocuments({ __v: 19 });
        const twentyCount = await userModel.countDocuments({ __v: 20 });
        const twentyoneCount = await userModel.countDocuments({ __v:21});
        const twentytwoCount = await userModel.countDocuments({ __v: 22});
        const twentythreeCount = await userModel.countDocuments({ __v: 23 });
        const  twentyfourCount = await userModel.countDocuments({ __v: 24 });
        const  twentyfiveCount = await userModel.countDocuments({ __v: 25 });
        const  twentysixCount = await userModel.countDocuments({ __v: 26});
        const  twentysevenCount = await userModel.countDocuments({ __v: 27 });
        const  twentyeightCount = await userModel.countDocuments({ __v: 28 });
        const twentynineCount = await userModel.countDocuments({ __v: 29 });
        const  thirtyCount = await userModel.countDocuments({ __v: 30 });
        const thirtyoneCount = await userModel.countDocuments({ __v: 31 });
        const thirtytwoCount = await userModel.countDocuments({ __v: 32});
        const thirtythreeCount = await userModel.countDocuments({ __v: 33 });
        const thirtyfourCount = await userModel.countDocuments({ __v: 34 });
        const  thirtyfiveCount = await userModel.countDocuments({ __v: 35 });
        const thirtysixCount = await userModel.countDocuments({ __v: 36 });
        const thirtysevenCount = await userModel.countDocuments({ __v: 37 });
        const thirtyeightCount = await userModel.countDocuments({ __v: 38});
        const thirtynineCount = await userModel.countDocuments({ __v: 39 });
        const fourtyCount = await userModel.countDocuments({ __v: 40 });
        const fourtyoneCount = await userModel.countDocuments({ __v: 41 });
        const fourtytwoCount = await userModel.countDocuments({ __v: 42 });
        const fourtythreeCount = await userModel.countDocuments({ __v: 43 });
        const fourtyfourCount = await userModel.countDocuments({ __v: 44 });
        const fourtyfiveCount = await userModel.countDocuments({ __v: 45 });
        const fourtysixCount = await userModel.countDocuments({ __v: 46 });
        const fourtysevenCount = await userModel.countDocuments({ __v: 47});
        const fourtyeightCount = await userModel.countDocuments({ __v: 48 });
        const fourtynineCount = await userModel.countDocuments({ __v: 49});
        const fiftyCount = await userModel.countDocuments({ __v: 50 });
        

        return res.send( {
            totalUsers,
            zeroCount ,
            oneCount ,
           twoCount ,
            threeCount,
            fourCount,
            fiveCount ,
            sixCount,
            sevenCount ,
           eightCount ,
            nineCount ,
           tenCount,
         elevenCount,
           twelveCount ,
           thirteenCount ,
        fourteenCount ,
            fifteenCount,
        sixteenCount ,
          seventeenCount ,
          eighteenCount, 
           ninteenCount,
            twentyCount ,
          twentyoneCount ,
        twentytwoCount ,
           twentythreeCount ,
             twentyfourCount,
         twentyfiveCount,
             twentysixCount,
            twentysevenCount ,
           twentyeightCount ,
            twentynineCount ,
             thirtyCount ,
            thirtyoneCount ,
           thirtytwoCount,
           thirtythreeCount,
            thirtyfourCount ,
             thirtyfiveCount ,
           thirtysixCount ,
            thirtysevenCount,
          thirtyeightCount,
           thirtynineCount ,
            fourtyCount ,
            fourtyoneCount ,
           fourtytwoCount ,
           fourtythreeCount ,
            fourtyfourCount ,
            fourtyfiveCount ,
           fourtysixCount ,
            fourtysevenCount, 
            fourtyeightCount ,
            fourtynineCount, 
           fiftyCount 
           
         
        
        
        });
    } catch (err) {
        return res.send(error(500, err.message));
    }
}

export async function kycController(req, res) {
    try {
         const user = req._id;
         if(!user){
            return res.send(error(404,"user not found"));
         }
         
      const { firstName, lastName, adharNumber, panNumber } = req.body;
      
      if (!firstName || !lastName || !adharNumber || !panNumber) {
        return res.status(400).send({ error: 'All fields are required for KYC verification' });
      }
      const adharFront = req.files['adharFront'][0];
    const adharBack = req.files['adharBack'][0];
    const panFront = req.files['panFront'][0];
      
      console.log(adharFront,adharBack,panFront);
        const adharFrontPath = adharFront.path;
     
        const adharBackPath = adharBack .path;
        const panFrontPath = panFront.path;
       console.log(adharFrontPath,adharBackPath,panFrontPath)
        // Save KYC details and file paths to the user document in the 
        const kycdetails = new kycModel({firstName,
            lastName,
            adharNumber,
            panNumber,
            adharFront:adharFrontPath,
            adharBack:adharBackPath,
            panFront:panFrontPath,
            user
        });
        await kycdetails.save();
        console.log(kycdetails);
        
  
       return res.send(success(200, "player request for kyc successfully"));
    
    } catch (err) {
      return res.send(error(500,err.message));
    }
  }
//  import asyncTimeout from 'async-timeout'; // Assuming you have a timeout library

// export async function kycController(req, res) {
//     try {
//       const user = req._id;
//       const { firstName, lastName, adharNumber, panNumber } = req.body;
  
//       if (!firstName || !lastName || !adharNumber || !panNumber) {
//         return res.status(400).send({ error: 'All fields are required for KYC verification' });
//       }
  
//       // Assuming you have a timeout duration in milliseconds (e.g., 30 seconds)
//       const uploadTimeout = 3000; // 30 seconds
  
//       let adharFrontPath, adharBackPath, panFrontPath;
  
//       // Use asyncTimeout to wait for file uploads with a timeout
//       await asyncTimeout(uploadTimeout, async () => {
//         const adharFront = req.files['adharFront'][0];
//         const adharBack = req.files['adharBack'][0];
//         const panFront = req.files['panFront'][0];
  
//         adharFrontPath = adharFront.path;
//         adharBackPath = adharBack.path;
//         panFrontPath = panFront.path;
//       });
  
//       // Check if all file uploads completed within the timeout
//       if (!adharFrontPath || !adharBackPath || !panFrontPath) {
//         return res.status(500).send({ error: 'File upload timed out or incomplete' });
//       }
  
//       // Save KYC details and file paths to the user document
//       const kycdetails = new kycModel({
//         firstName,
//         lastName,
//         adharNumber,
//         panNumber,
//         adharFront: adharFrontPath,
//         adharBack: adharBackPath,
//         panFront: panFrontPath,
//         user
//       });
//       await kycdetails.save();
  
//       return res.send(success(200, 'Player request for KYC successful'));
//     } catch (err) {
//       return res.status(500).send(error(500, err.message));
//     }
//   }
  
  export async function withdrawRequestController(req,res){
    try {
        const { amt_withdraw,payment_type,upi_id,mobile_number,reason} = req.body;

        if (!amt_withdraw || !payment_type || !upi_id || !mobile_number || !reason ) {
            return res.send(error(403,"all fields are required"));
        }
         const user = req._id;
         const userInfo = await userModel.findById(user);
         if(!userInfo){
            return res.send(error(404,"no such user exist"));
         }

         if(userInfo.INR < amt_withdraw){
            return res.send(error(404,`you have only ${amt_withdraw} in your wallet , please play the challenge to increase INR`  ));
         }
         const newWithdrawRequest = new WithdrawRequestModel({amt_withdraw,payment_type,upi_id,mobile_number,reason,user});
          await newWithdrawRequest.save();
     return res.send(success(200,` request for ${amt_withdraw } rupees have  been sent successfully,please wait for 3-4 hours for payment processing `));

    } catch (err) {
        return res.send(error(500,err.message));
    }
  }
  export  async function createContactAccountController(req, res) {
    const apiKey = 'rzp_test_HReBag7y9g12Bp';
const apiSecret = 'DM6knlODsGtsJsTzEUbx64dA';

// Base URL for Razorpay API
const baseUrl = 'https://api.razorpay.com/v1/';

// Endpoint for creating contacts
const endpoint = 'contacts'
    try {
        const user = req._id;
      const { name, email, contact } = req.body;
      const type = "employee"
      // Validate request data
      if (!name || !email || !contact || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const existingContact = await contactModel.findOne({user});
      if(existingContact){
        await contactModel.findByIdAndDelete(existingContact._id);
      }
      // Sample data for creating a contact
      const data = {
        name,
        email,
        contact,
        type,
        // Add other required fields as needed
      };
  
      // Axios request configuration
      const axiosConfig = {
        baseURL: baseUrl,
        headers: {
          Authorization: `Basic ${Buffer.from(apiKey + ':' + apiSecret).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      };
  
      // Make POST request to create a contact
      const response = await axios.post(endpoint, data, axiosConfig);
      const contact_id = response.data.id;
      const contactDetail = new contactModel({contact_id,user});
      await contactDetail.save();
      // Handle successful response
      res.status(201).json({ message: 'Contact created successfully', data: response.data });
    } catch (error) {
      // Handle errors
      console.error('Error creating contact:', error.response ? error.response.data : error.message);
      res.status(error.response ? error.response.status : 500).json({ error: error.message });
    }
  }

  export async function createUpiFundAccountController(req,res){
    const apiKey = 'rzp_test_HReBag7y9g12Bp';
    const apiSecret = 'DM6knlODsGtsJsTzEUbx64dA';
    
    // Base URL for Razorpay API
    const baseUrl = 'https://api.razorpay.com/v1/';
    
    // Endpoint for creating contacts
    const endpoint = 'fund_accounts'
        try {
            const user = req._id;
          const contactDetail = await contactModel.findOne({user});
          const contact_id = contactDetail.contact_id;
          const requestData = req.body;
          const vpa = requestData;
          // Validate request data
          const account_type = "vpa";
          
          
          if (!account_type || !vpa) {
            return res.status(400).json({ error: 'Missing required fields' });
          }
          const existingFundAccount = await upiFundModel.findOne({user});
          if(existingFundAccount){
            await upiFundModel.findByIdAndDelete(existingFundAccount._id);
          }
          // Sample data for creating a contact
          const data = {
          contact_id,account_type,vpa
          };
       
          // Axios request configuration
          const axiosConfig = {
            baseURL: baseUrl,
            headers: {
              Authorization: `Basic ${Buffer.from(apiKey + ':' + apiSecret).toString('base64')}`,
              'Content-Type': 'application/json',
            },
          };
      
          // Make POST request to create a contact
          const response = await axios.post(endpoint, data, axiosConfig);
          
         const fund_account_id  = response.data.id;
          const fundDetail = new upiFundModel({fund_account_id,user});
          await fundDetail.save();
          
          res.status(201).json({ message: ' created  upi fund account successfully', data: response.data });
        } catch (error) {
          // Handle errors
          console.error('Error creating contact:', error.response ? error.response.data : error.message);
          res.status(error.response ? error.response.status : 500).json({ error: error.message });
        }
  }
  export async function createBankFundAccountController(req,res){
    const apiKey = 'rzp_test_HReBag7y9g12Bp';
    const apiSecret = 'DM6knlODsGtsJsTzEUbx64dA';
    
    // Base URL for Razorpay API
    const baseUrl = 'https://api.razorpay.com/v1/';
    
    // Endpoint for creating contacts
    const endpoint = 'fund_accounts'
        try {
            const user = req._id;
          const contactDetail = await contactModel.findOne({user});
          const contact_id = contactDetail.contact_id;
         
          const requestData = req.body;
          const bank_account = requestData
      
          // Validate request data
          const account_type = "bank_account";
          if (!account_type || !bank_account ) {
            return res.status(400).json({ error: 'Missing required fields' });
          }
          const existingFundAccount = await bankFundModel.findOne({user});
          if(existingFundAccount){
            await bankFundModel.findByIdAndDelete(existingFundAccount._id);
          }
          // Sample data for creating a contact
          const data = {
          contact_id,account_type,bank_account
          };
      
          // Axios request configuration
          const axiosConfig = {
            baseURL: baseUrl,
            headers: {
              Authorization: `Basic ${Buffer.from(apiKey + ':' + apiSecret).toString('base64')}`,
              'Content-Type': 'application/json',
            },
          };
      
          // Make POST request to create a contact
          const response = await axios.post(endpoint, data, axiosConfig);
         const fund_account_id  = response.data.id;
          const fundDetail = new bankFundModel({fund_account_id,user});
          await fundDetail.save();
          
          res.status(201).json({ message: ' created bank fun account successfully', data: response.data });
        } catch (error) {
          // Handle errors
          console.error('Error creating contact:', error.response ? error.response.data : error.message);
          res.status(error.response ? error.response.status : 500).json({ error: error.message });
        }
  }

  export async function createPayoutController(req,res){
    const apiKey = 'rzp_test_HReBag7y9g12Bp';
    const apiSecret = 'DM6knlODsGtsJsTzEUbx64dA';
    
    // Base URL for Razorpay API
    const baseUrl = 'https://api.razorpay.com/v1/';
    
    // Endpoint for creating contacts
    const endpoint = 'payouts'
        try {
            const user = req._id;
            // const type = req.body;
            // if(type =="upi"){
            //   var fundDetail = await upiFundModel.findOne({user});
            // }else{
            //     var fundDetail = await bankFundModel.findOne({user});
            // }
         const upiFundDetail = await upiFundModel.findOne({user});
         const bankFundDetail = await bankFundModel.findOne({user});
         if(upiFundDetail.createdAt>bankFundDetail.createdAt){
            var fundDetail = upiFundDetail;
         }
         else{
            var fundDetail = bankFundDetail;
         }
          const account_number = 2323230055816469;
          const currency = "INR";
          const fund_account_id = fundDetail.fund_account_id;
          console.log(fund_account_id);
          const { amount} = req.body;
          
          const mode = "UPI";
          const purpose = "refund"
          // Validate request data
          if (! amount  ) {
            return res.status(400).json({ error: 'Missing required fields' });
          }
      
          // Sample data for creating a contact
          const data = {
             account_number,currency,fund_account_id,mode,amount,purpose
          };
         
          // Axios request configuration
          const axiosConfig = {
            baseURL: baseUrl,
            headers: {
              Authorization: `Basic ${Buffer.from(apiKey + ':' + apiSecret).toString('base64')}`,
              'Content-Type': 'application/json',
            },
          };
      
          // Make POST request to create a contact
           const response = await axios.post(endpoint, data, axiosConfig);
         const payout_id = response.data.id;
         const payoutDetail = new payoutModel({payout_id,amount,mode,user});
         console.log(payoutDetail)
         await payoutDetail.save();
          
          res.status(201).json({ message: 'Contact created successfully', data: response.data });
        } catch (error) {
          // Handle errors
          console.error('Error creating contact:', error.response ? error.response.data : error.message);
          res.status(error.response ? error.response.status : 500).json({ error: error.message });
        }
  }
