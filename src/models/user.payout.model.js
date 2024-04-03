import mongoose from "mongoose";
const payoutSchema = new mongoose.Schema({
       payout_id:{
        type:String,
        required:true
           },
           amount:{
            type:Number
           },
           mode:{
            type:String
           },
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
});
const payoutModel = new mongoose.model('payoutdetail',payoutSchema);
export default payoutModel;