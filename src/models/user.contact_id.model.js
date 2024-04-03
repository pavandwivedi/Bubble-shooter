import mongoose from "mongoose";
const contactSchema = new mongoose.Schema({
    
    contact_id:{
        type:String,
        required:true
    },
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
});

const contactModel = new mongoose.model('contact-details',contactSchema);
export default contactModel;