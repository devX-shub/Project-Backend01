import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloud} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { application } from "express";
import pkg from 'jsonwebtoken';
const { Jwt } = pkg;

const generateAccessTokenAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshTokens = user.generateRefreshToken()
        user.refreshTokens = refreshTokens
        await user.save({validateBeforeSave: false})
        return {accessToken,refreshTokens}
    } catch (error) {
        throw new ApiError(500,"Something went wrong with tokens")
    }
}

const registerUser = asyncHandler(async (req,res) => {
    // get details from frontend
    const {fullName,email,username,password} = req.body
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
    const existingUser =await User.findOne({
        $or : [{username},{email}]
    })

    if(existingUser)
    {
        throw new ApiError(409,"duplicate user, already exist")
    }
    // console.log(req.files)
    // check for images, check for avatar
    const avatarLocalPath =  req.files?.avatar[0]?.path
    const coverImagePath = req.files?.coverImage[0]?.path

    /*
    let converImagePath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
    {
        converImagePath = req.files.coverImage[0].path
    }
    */
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
    const dataCreated = await User.findById(userData._id).select(
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

const loginUser = asyncHandler(async (req,res) => {
    //req body -> data
    const {email,username,password} = req.body
    //username or email
    console.log(email);
    if(!(username || email))
    {
        throw new ApiError(400,"username or email is required")
    }
    //find the user
    // const user = await User.findOne({
    //     $or:[{username,email}]
    // })
    const user = await User.findOne({$or:[{username,email}]})
    console.log(user);
    if(!user)
    {
        throw new ApiError(404,"bad credentials,please provide valid username or email")
    }
    //password checking
    const isValidPassword = await user.isPasswordCorrect(password)
    if(!isValidPassword)
    {
        throw new ApiError(401,"invalid credentials, please provide valid password")
    }
    //access and refresh token
    // console.log(user._id);
    const {accessToken,refreshTokens} = await generateAccessTokenAndRefreshTokens(user._id)
    //send cookies
    const logedinUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshTokens,options)
        .json(
            new ApiResponse(
                200,
                {
                    user : logedinUser,accessToken,refreshTokens
                },
                "User logged in successfully"
            )
        )
})


const logoutUser = asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshTokens : undefined
            }
        }
    )

    const options = {
        httpOnly:true,
        secure:true
    }
   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200,{},"Logged Out Successfully"))
})

const refreshAccessToken = asyncHandler(async (req,res) =>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRATE)
        const user = await User.findById(decodedToken?._id)
    
        if(!user)
        {
            throw new ApiError(401,"invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken)
        {
            throw new ApiError(401,"refresh token is expired or used")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
         const {accessToken,newrefreshToken} = await generateAccessTokenAndRefreshTokens(user._id)
    
        return res.status(200).cookie("accessToken",accessToken ,options)
        .cookie("refreshToken",newrefreshToken,options).json(
            new ApiResponse(200,{accessToken,newrefreshToken},"access token refreshed")
        )
    } catch (error) {
        throw new ApiError(401,"error in refrsh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword,newPassword,cnfPassword} = req.body
    if(!(newPassword === cnfPassword)){
        throw new ApiError(400,"password does not matches")
    }
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400,"wrong password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave : false})
    return res.status(200)
    .json(new ApiResponse(200,{},"password changed"))
})

const getCurrentUser = asyncHandler(async (req,res) =>{
    return res.status(200)
    .json(200,req.user,"user fetched successfully")
})

const updateUserAvatar = asyncHandler(async (req,res) =>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath)
    {
        throw new ApiError(400,"file ismissing")
    }
    const avatar = await uploadOnCloud(avatarLocalPath)

    if(!avatar.url)
    {
        throw new ApiError(400,"error while uploading")
    }

    await User.findByIdAndDelete(req.user?._id,
        {$set:{
            avatar: avatar.url
        }},
        {new:true}).select("-password")
})

/*
const updateAccountDetails = asyncHandler(async (req,res) =>{
    const {fullname,email} = req.body
    if(!fullname || !email)
    {
        throw new ApiError()
    }
    const user = User.findByIdAndUpdate(req.user?._id
        {
            $set: {
                fullname
                email
            }
        }.
        {new:true}).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200,'userdetail update successfully))
})
*/

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar
}
