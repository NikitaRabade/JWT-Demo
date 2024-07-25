import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js"
import { ApiResponse } from "../utilities/ApiResponse.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utilities/cloudnary.js"


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
        throw new ApiError(401, "Wrong Incorrect");
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

export { registerUser, 
    loginUser,
    logoutUser
};
