import mongoose from "mongoose";
const fundSchema = new mongoose.Schema({   
    fund_account_id:{
    type:String,
    required:true
       },
user : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
}});
const fundModel = new mongoose.model("fund-details",fundSchema);
export default fundModel;