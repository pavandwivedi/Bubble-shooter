import mongoose from "mongoose";
const bankFundSchema = new mongoose.Schema({   
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
const bankFundModel = new mongoose.model("bankfunddetails",bankFundSchema);
export default  bankFundModel;