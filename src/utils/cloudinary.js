import {v2 as cloudinary} from 'cloudinary';
import { response } from 'express';
import { fs } from 'file-system';

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRATE 
});

const uploadOnCloud = async (loacalFilePath) => {
    try {
        if(!loacalFilePath) return null
        //upload file
        const response = await cloudinary.uploader.upload(loacalFilePath,{
            resource_type : "auto"
        })
        //file Uploaded
        console.log("file uploaded",response.url);
        return response
    } catch (error) {
        // fs.unlinkSync(loacalFilePath)  // remove local saved temp file as the upload failed
        return null;
    }
}

export {uploadOnCloud}