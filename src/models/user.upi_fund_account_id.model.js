import mongoose from "mongoose";
const upiFundSchema = new mongoose.Schema({   
    fund_account_id:{
    type:String,
    required:true
       },
user : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
}
},
{timestamps:true}
);
const upiFundModel = new mongoose.model("upifunddetails",upiFundSchema);
export default upiFundModel;