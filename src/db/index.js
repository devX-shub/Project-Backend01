import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}${DB_NAME}`)
        console.log("Finally connect established");
    } catch (error) {
        console.error("connection error : Unable to connect to mongodb ", error);
        process.exit(1);
    }
}

export default connectDB