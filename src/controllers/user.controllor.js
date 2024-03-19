import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloud} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req,res) => {
    // get details from frontend
    const {fullName , email,username,password} = req.body
    // validation
    if(fullName === "")
    {
        throw new ApiError(400,"FullName is required")
    }

    if(
        [fullName,email,username,password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }
    // check if user is already exist
    const existingUser = User.findOne({
        $or : [{usernane},{email}]
    })

    if(existingUser)
    {
        throw new ApiError(409,"duplicate user, already exist")
    }
    // console.log(req.files)
    // check for images, check for avatar
    const avatarLocalPath =  req.files?.avatar[0]?.path
    const coverImagePath = req.files?.coverImage[0]?.path
    if(!avatarLocalPath)
    {
        throw new ApiError(400,"avatar is required")
    }
    // upload them to cloudinary , avatar
    const avatar = await uploadOnCloud(avatarLocalPath)
    const coverImage = await uploadOnCloud(coverImagePath)

    if(!avatar)
    {
        throw new ApiError(400," avatar is not present")
    }
    // create user objects - create entry in db
    const userData = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    // remove password and regresh token field from response
    const dataCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // check for user creation
    if(!dataCreated)
    {
        throw new ApiError(500,"something went wront while regesting")
    }
    // return response to front end
    return res.status(201).json(
        new ApiResponse(200,dataCreated,"Registration Successfull")
    )
})

export {registerUser}