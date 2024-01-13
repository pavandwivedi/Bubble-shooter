import mongoose from "mongoose";

const mongoURL = 'mongodb://127.0.0.1:27017/BubbleShooter';

export default async function connectDB(){
    try {
        const connect =  await mongoose.connect(mongoURL);
        console.log('DB connected! '+connect.connection.host);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}