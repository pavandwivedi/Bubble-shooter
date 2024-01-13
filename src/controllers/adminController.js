import adminModel from "../models/Admin.js";
import userModel from "../models/User.js";
import bcrypt from 'bcrypt'
import Jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { generateAccessToken } from "../services/generateAccessToken.service.js";
dotenv.config();


const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY || "greenwebsolutions";
export async function signupController(req,res){
    try {
        const {username,password,email} = req.body;
        if(!username || !password || !email){
            return res.send({message:"all fields are required"});
        }
        const hashedPassword = await bcrypt.hash(password,10);
        req.body["password"] = hashedPassword;
        const user = await adminModel.create(req.body);
        const  newuser = await adminModel.findById(user._id);
        return res.send({newuser});

    } catch (error) {
        return res.send({'error':error.message});
    }

}

export async function loginController(req,res){
    try {

        const {usernameOrEmail,password} = req.body;
        const user = await adminModel.findOne({
            $or:[{username:usernameOrEmail}, {email:usernameOrEmail}]
        });
        if(!user){
            return res.status(404).json({message:"user not found"});
        }

        const matched = await bcrypt.compare(password,user.password);
        if(!matched){
            return res.send({message:"incorrect password"});
        }

        const accessToken = generateAccessToken({...user})
        // const {_id,password,newuser} = user;
        delete user['_doc']['password'];
        delete user['_doc']['__v'];
        delete user._doc['_id'];
        // console.log(user);

        return res.send({...user._doc,"accessToken":accessToken});
        
    } catch (error) {
        return res.json({"error":error.message});
    }
}

export async function getAllUsers(req,res){
    try {
        const users = await userModel.find({}).populate('Levels');
        return res.send(users);

    } catch (error) {
        return res.send({message:error.message})
    }
}
