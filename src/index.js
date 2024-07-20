import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/config.js";

dotenv.config({
    path : "../env"
})

const app = express();

connectDB()                                  
.then(() =>{
    app.listen(process.env.PORT || 3000, () =>{
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
})
.catch((error) =>{
    console.log("connection failed !!! ", error);
})




/*
connectDB() => asynchronous function will return promise hence after connecting do some work depend on 
successfully connecting db or error while connecting