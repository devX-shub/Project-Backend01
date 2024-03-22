import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import pkg from 'jsonwebtoken';
const { jwt } = pkg;

export const verifyJWT = asyncHandler(async(req,_,next) =>{//sometimes we have no use for the res variable so we can place _ at that place
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token)
        {
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRATE)
        const user = await User.findById(decodedToken?._id).select("-password -refreshTokens")// id is coming from the tokens
        if(!user){
            throw new ApiError(401,"Invalid access Token")
        }
        req.user =  user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message||"invalid access token")
    } 
    //
})