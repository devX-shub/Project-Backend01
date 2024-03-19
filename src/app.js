import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true,limit:"16kb"}))//urlencoder helps in reading from url params which are encoded
app.use(express.static("public"))
app.use(cookieParser())


//routes

app.get('/', (req,res) =>{
    res.send("Hi welcome");
    console.log("app started")
})

import userRouter from "./routes/user.routes.js"

//routes declration
//http://localhost:8080/user/register
app.use("/api/v1/users",userRouter)

export {app}