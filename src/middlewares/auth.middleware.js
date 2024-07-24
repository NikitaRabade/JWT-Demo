import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { ApiError } from "../utilities/ApiError.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { User } from "../models/user.model.js";

dotenv.config({
    path : "../env"
});

export const verifyJWT = asyncHandler( async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        if(!token){
            throw new ApiError(401 , "Unauthorized Reques");
        }
    
        const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }

});

