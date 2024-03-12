import { Schema } from "mongoose";
import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import { Jwt } from "jsonwebtoken";

const userSchema = new Schema({

})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password,10)
    next();
})
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign({
        _id : this._id,
        email : this.email,
        userName : this.username,
        fullName : this.fullName
    },
    process.env.ACCESS_TOKEN,
    {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    })
}
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign({
        _id : this._id,
    },
    process.env.REFRESH_TOKEN,
    {
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    })
}

export const User = mongoose.model("User",userSchema);