import mongoose from "mongoose";
const commonSchema = new mongoose.Schema({
    
    referralCode:{
        type:String,
        unique:true
    },
    life:{type:Number,default:5},
    coins:{type:Number,default:0},
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

 export const userModel = mongoose.model('user', commonSchema);

export  const guestModel = userModel.discriminator('guestPlayer', guestSchema);
export const authModel = userModel.discriminator('authPlayer', authSchema);