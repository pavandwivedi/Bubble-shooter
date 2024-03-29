import mongoose from "mongoose";

// Define the schema for withdraw_transaction_details
const WithdrawRequestSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

  withdraw_request_date: {
    type: Date,
    default: Date.now,
  },
  amt_withdraw: {
    type: Number,
    required: true,
  },
  payment_type: {
    type: String,
    default: null,
  },
  account_number: {
    type: String,
    default: null,
  },
  ifsc_code: {
    type: String,
    default: null,
  },
  upi_id:{
    type:String,
    default:null
  },
  mobile_number: {
    type: Number,
    minlength:10 ,
    maxlength:10,
    default: null,
  },
  reason: {
    type: String,
    maxlength: 765,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
 
});

// Create the model based on the schema
const WithdrawRequestModel = mongoose.model('WithdrawRequest', WithdrawRequestSchema);

export default WithdrawRequestModel;
