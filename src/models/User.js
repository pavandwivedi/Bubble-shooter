import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    deviceID:{
        type:String,
        required:true
       
    },
    name:{
        type:String,
        
    },
    referralCode:{
        type:String,
        unique:true
        
     
    },
    email:{
        type:String,
         unique:true
    },
    profileURL:{
        type:String,
        default:null
    },
    life:{type:Number,default:0},
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
})

const userModel = mongoose.model('user',userSchema);
export default userModel;