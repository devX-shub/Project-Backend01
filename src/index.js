import connectDB from "./db/index.js";
import dotenv from 'dotenv'
// require('ditenv').config({path:'./env'})


dotenv.config(
    {
        path : './env'
    }
)


connectDB();





/*
-----------------------------------------------------------------------------------
import { express } from "express";
const app = express()
//ief - immediately exeacutable function
( async() => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERR" ,error);
            throw error
        })

        app.listen(process.env.PORT,()=> {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("error : ", error);
    }
})()

*/