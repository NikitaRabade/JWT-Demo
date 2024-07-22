import dotenv from "dotenv"
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//import { urlencoded } from "body-parser";

dotenv.config({
    path : "../env"
});

import bodyParser from 'body-parser';
const { urlencoded } = bodyParser;

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN, //which origin means frontend is allowed to talk with backend
    credentials : true
}));

app.use(express.json({limit : "16kb"}));

app.use(urlencoded({extended : true, limit : "16kb"}));

app.use(express.static("public"));

app.use(cookieParser());


//import routes
import userRouter from "./routes/user.routes.js";


//routes declartion
app.use("/users", userRouter);
//https://localhost:3000/users => makes primary route for all userRouter

export { app };