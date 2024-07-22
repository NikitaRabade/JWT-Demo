import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js"
import { ApiResponse } from "../utilities/ApiResponse.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utilities/cloudnary.js"

const registerUser = asyncHandler( async (req, res) => {
    /*
    res.status(200).json({
        message : "OK"
    });
    */

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
    console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

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


export { registerUser };
