import Jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const secretKey = process.env.ACCESS_SECRET_KEY || "greenwebsolutions";

export function generateAccessToken(data){
    try {
        const token = Jwt.sign(data, secretKey,{expiresIn:"30d"});
        return token;
    } catch (error) {
        return error;
    }
}