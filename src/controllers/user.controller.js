import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js"
import { ApiResponse } from "../utilities/ApiResponse.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utilities/cloudnary.js"
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        //if we apply save method : 
        /**
         * If you try to save a Mongoose object that has required fields missing, Mongoose will throw a validation error.
         *  Mongoose schema validation ensures that all required fields are provided when attempting to save a document.
         *  If any required fields are missing, the save operation will fail, and an error will be returned.
         * [options.validateBeforeSave] «Boolean» set to false to save without validating.
         */
        await user.save({validateBeforeSave : false});

        return {accessToken, refreshToken};

    }catch(error){
        throw new ApiError(500, "Something went Wrong");
    }
}


const registerUser = asyncHandler( async (req, res) => {
    /*
    res.status(200).json({
        message : "OK"
    });
    */
    // TO DO : =>
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    //console.log(req.body);
    const {fullName, email, username, password} = req.body;
    //console.log("email : ", email);

    //check inputted data is not empty using some(callback) 
    /* some(callback) : Determines whether the specified callback function return true for any element of 
      any array. The some method calls the predicate function for each element in array until 
      the predicate returns value which boolean value true or until end of array
    */
    if([fullName, email, username, password].some((feild) => feild?.trim() === "")){
        throw new ApiError(400, "All feilds are required");
    }

    const exisitedUser = await User.findOne({
        $or : [{ username }, { email }]
    });

    if(exisitedUser){
        //console.log("Existing user found:", exisitedUser);
        throw new ApiError(409, "User with email or username is already exits");
    }

    //for multer check
    //get path of that uploaded image in server
    //console.log("req.files contain" , req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;

    //1. check req.files is it or not 2. if yes then check there is array for coverImage or not. 
    //3. if yes then check size is > 0 or not.
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    //console.log("cloudnary gives us response object which contain : ", avatar);

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    });

    //check user created or not and remove password and refreshToken from response get from findId return 
    //document that matches condition
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );

});


const loginUser = asyncHandler ( async (req, res) => {
    //To do =>
    //req body -> data
    // username or email 
    //find the user
        // if not give appropriate message and also suggest to redirect to register pages 
        //if present : password check
            // if not match -> give error mssage
            //if match -> generate access and refresh token 
            //send cookies -> token

    //console.log(req.body);
    const {email, username, password} = req.body;

    if(!(username || email)){
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
       $or : [{ username }, { email }] 
    });

    if(!user){
        throw new ApiError(400, "User doesn't exit");
    }

    /*
    all method of User which is created thorogh mongoose hence the object created from mongoose 
    we can access those methods which is part of mongoose.
    AND the methods which are created by us like isPassword, generateAcessToken are only availble to user 
    i.e userSchmea which is here document user
    */
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Incorrect Password");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .cookie("accessToken" , accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
        {
            user : loggedInUser, accessToken, refreshToken
        }, 
        "User logged In Successfully")
    );

});


const logoutUser = asyncHandler (async (req, res) => {
    //To do => 
    //Delete refresh token from model
    //clear cookies

    /*
    But how to find user?
    -> In previous for login we do form to take email... hence we can find user via this feilds
    But in the time of logout we cant make form it will worst
    Hence we will user middleware 
    */

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    );

    const options = {
        httpOnly : true,
        secure : true
    };

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out")
    );

});

const refreshAcessToken = asyncHandler( async (req, res) => {
    //To do :
    //acess  refresh token -> using either cookies or DB call and if for mobile app from body
       //if not valid = error
       //if present => decode that token and verify that stored and current correct or not 


    const incomingRefreshToken = req.cookies.refreshAcessToken || req.body.refreshAcessToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken._id);
    
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token");
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token is expired or used");
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshToken(user._id);
    
        const options = {
            httpOnly : true,
            secure : true
        }
        
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken, refreshToken : newrefreshToken
                },
                "Access Token refreshed"
            )
        );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh Token");
    }

});

const getUserChannelProfile = asyncHandler( async (req, res) => {
    const { username } = req.params;

    if(!username?.trim()){
        throw new ApiError(400, "Username is missing!..");
    }

    const channel = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },
        //to find subscriber of your account
        {
            $lookup :{
                from : "subscriptions",
                localField : "_id",
                foreignField : "channel",
                as : "subscribers"
            }
        },
        //to find how many you subscribed to other
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedTo"
            }
        },
        {
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers"
                },
                channelsToSubscribedToCount : {
                    $size : "$subscribedTo"
                },
                isSubscribed : {
                    $cond : {
                        if : {$in : [req.user?._id, "$subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            //to pass only selected feilds
            $project : {
                fullName : 1,
                username : 1,
                subscribersCount : 1,
                channelsToSubscribedToCount : 1,
                isSubscribed : 1,
                avatar : 1,
                coverImage : 1,
                email : 1
            }
        }
    ]);

    //console.log(channel);

    if(!channel?.length){
        throw new ApiError(400, "channel does not exists");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    );

});

const getWatchHistory = asyncHandler( async (req, res) => {
    //to get history
    /*
    user model have watch history feilds that stores array contains ids of video
    hence we need to join user model and video model
    But video model also stores owner feild that signifies owner of user or user who posted that video
    the owner info is in user , hence to get owner info we need to agin join to user model makes nested join
    or nested lookup */
    /* _
    id : ObjectId('skjhgyuak,mnbdgks') user._id will give 'skjhgyuak,mnbdgks' which is string it is not id
    the id it whole :  ObjectId('skjhgyuak,mnbdgks') hence to get we can use mongoose.
    Mongoose will internally automatically converts _id(user._id) to mongodb _id
    */
    //In aggregation pipeline , mongoose will not work, it will directly to db not through mongoose
    //lookup return array
    const user = await User.aggregate([
        {
            $match :{
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup :{
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                //here we get all watchhistory ids and all feilds
                //now we want owner feild to populate or get owner details from user hence nested join
                //nested pipelines for each document
                pipeline : [
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            //now we get watchhistory and also the owner of videos
                            //now which feilds should pass or consider again pipeline
                            //we we can use it here also or outside
                            pipeline : [
                                {
                                    $project : {
                                        fullName : 1,
                                        username : 1,
                                        avtar : 1
                                    }
                                }
                            ]
                        }
                    },
                    //it will return owner array, that means it will inner array and outer array is watchhistory
                    //hence to make it eays we apply another pipeline in main watchhistory
                    {
                        $addFields : {
                            owner : {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
});


export { registerUser, 
    loginUser,
    logoutUser,
    refreshAcessToken,
    getUserChannelProfile,
    getWatchHistory
};
