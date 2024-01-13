import express from "express"
import connectDB from "./src/config/db.js";
import session  from 'express-session';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import  passport  from "passport";
import morgan from "morgan";
import cors from "cors";
import authRouter from "./src/routers/authRouter.js";
import levelRouter from "./src/routers/levelRouter.js";
import dotenv from 'dotenv';
import userRouter from "./src/routers/userRouter.js";
import adminRouter from "./src/routers/adminRouter.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 2000;
connectDB();
app.set('view engine','ejs');  
app.use(morgan("common"));
app.use(cors());
app.use(express.json());
app.use(session({resave: false,saveUninitialized: true,secret: 'SECRET'}));
app.use(passport.initialize());
app.use(passport.session());
 
var userProfile;
const GOOGLE_CLIENT_ID = '479174792699-3j9st18bejecoutiorib1mutmej2rasn.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    // callbackURL: "http://localhost:3000/auth/google/callback"
    callbackURL: "http://192.168.1.16.nip.io:3000/auth/google/callback"
    // callbackURL: "https://a5cb-122-175-148-85.ngrok-free.app/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));

// Serialize & Deserialize user information to store in the session
passport.serializeUser(function(user, cb) {cb(null, user);});
passport.deserializeUser(function(obj, cb){ cb(null, obj);});

// routes
app.get('/',(req,res)=>{res.render('auth')})
app.use('/auth',authRouter);
app.use('/level',levelRouter);
app.use('/user',userRouter);
app.use('/admin',adminRouter);

app.listen(port,()=>
    {
        console.log(`server running on port ${port}`);
    }
)