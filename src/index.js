import connectDB from "./db/index.js";
import dotenv from 'dotenv';
import { app } from "./app.js";

dotenv.config(
    {
        path : './env'
    }
)

//returns a promise,here we init our app on a port
connectDB()
.then(() =>{
    app.listen(process.env.PORT || 8000,() =>{
    console.log(`serever is listening at port : ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("mongoDB connection failure, don't know why");
})





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