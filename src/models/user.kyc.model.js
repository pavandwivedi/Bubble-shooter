import mongoose from "mongoose";

const kycSchema = new mongoose.Schema({
    firstName:{
        type:String,
    },
    lastName:{
        type:String,
    },
    adharNumber:{
        type:Number,
        required:true
    },
    panNumber:{
        type:String,
        required:true 
    },
    adharFront:{
        type:String,
        required:true
    },
    adharBack:{
        type:String,
        required:true
    },
    panFront:{
        type:String,
        required:true
    },
 
    status:{
        type:Boolean,
        default:false
    },
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
},
    {timestamps:true});

const kycModel = mongoose.model('kyc',kycSchema);
export default kycModel;