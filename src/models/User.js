import mongoose from "mongoose";
const commonSchema = new mongoose.Schema({
    
    referralCode:{
        type:String,
        unique:true
    },
    isReferred:{
        type:Boolean,
        default:false
    },
    referedCount:{type:Number,default:0},
    life:{type:Number,default:0,min:0,max:5},
    coins:{type:Number,default:0},
    INR:{type:Number,default:0},
    extraball:{type:Number,default:0},
    fireball:{type:Number,default:0},
    colorball:{type:Number,default:0},
    Levels:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'level',

        }
    ]
},
{timestamps:true})

const guestSchema = new mongoose.Schema({
    deviceID:{
        type:String,
        unique:true,
        required:true
    }
})
const authSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
        required:true
        
    }
})

const facebookSchema = new mongoose.Schema({
    facebookID:{
        type:String,
        unique:true,
        // required:true
       
    },
    phoneNo:{
        type:String,
        unique:true
    }
})

 export const userModel = mongoose.model('user', commonSchema);
export const facebookModel = userModel.discriminator('facebookPlayer',facebookSchema);
export  const guestModel = userModel.discriminator('guestPlayer', guestSchema);
export const authModel = userModel.discriminator('authPlayer', authSchema);

