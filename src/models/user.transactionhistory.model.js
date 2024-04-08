import mongoose from "mongoose";

  
const WithdrawHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  
  },
  withdrawHistory: [{  
    amount: {
    type: Number,
    required: true,
  },
  withdrawalDate: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    maxlength: 100,
  },
  transaction_id: {
    type: String,
    maxlength: 100,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },}],
});


const withdrawHistoryModel = mongoose.model('WithdrawHistory', WithdrawHistorySchema);

 export default  withdrawHistoryModel;
