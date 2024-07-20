import dotenv from "dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import express from "express";

dotenv.config({
    path : "../env"
})

const app = express();

console.log(`${process.env.MONGODB_URI}/${DB_NAME}`);

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        //adding lister event to app beacause if express app doesnt connect to db
        //hence to listen error on event is used here
        //console.log(connectionInstance);
        app.on("error", (error) => {
            console.log("ERROR while connect to express : ", error);
            throw error;
        });

    }catch(error){
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
}

export default connectDB;